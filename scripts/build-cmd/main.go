package main

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

func main() {
	cmd := exec.Command("find", "./cmd", "-type", "f", "-name", "main.go")
	cmd.Stderr = os.Stderr
	stdout, err := cmd.Output()
	if err != nil {
		panic(err)
	}

	mainFiles := strings.Split(string(stdout), "\n")

	cmd = exec.Command("mkdir", "-p", "build")
	_, err = cmd.Output()
	if err != nil {
		panic(err)
	}

	hasError := false

	c := make(chan chanResult, len(mainFiles))
	parallelCount := 0
	remaining := 0
	maxParallel := getParallisation()
	fmt.Printf("Running build with parallisation: %d\n", maxParallel)

	build := func(file string) {
		go buildLambda(file, c)
		parallelCount++
		remaining++
	}
	readChan := func() {
		chanRes := <-c
		remaining--
		if chanRes.err != nil {
			hasError = true
		}
	}

	for i, file := range mainFiles {
		if len(file) < 1 {
			continue
		}

		build(file)

		if i == 0 || parallelCount > maxParallel {
			readChan()
		}
	}

	for remaining > 0 {
		readChan()
	}

	if hasError {
		os.Exit(1)
	}
}

func getParallisation() int {
	cpus := runtime.NumCPU()
	if cpus < 4 {
		//GitHub actions has only 2 CPUs and seems to be slower in parallel
		return 1
	}
	return cpus
}

func buildLambda(mainFile string, c chan chanResult) {
	inputDir := getInputDirectory(mainFile)
	outPath := getOutputPath(mainFile)

	cmd := exec.Command("go", "build", "-o", outPath, "-trimpath", "-buildvcs=false", "-ldflags=-w -s", inputDir) // #nosec G204 -- Subprocess needs to be launched with variable
	cmd.Env = os.Environ()
	cmd.Env = append(cmd.Env, "GOOS=linux")
	cmd.Env = append(cmd.Env, "GOARCH=arm64")
	cmd.Env = append(cmd.Env, "CGO_ENABLED=0")
	cmd.Stderr = os.Stderr
	_, err := cmd.Output()
	if err != nil {
		c <- chanResult{err: err}
		return
	}

	size := float64(0)
	fi, err := os.Stat(outPath)
	if err == nil {
		size = float64(fi.Size()) / (1000 * 1000)
		fmt.Printf("Build %s\nOK    %s %.1fMB\n\n", inputDir, outPath, size)
	} else {
		fmt.Printf("Build %s\nOK    %s\n\n", inputDir, outPath)
	}

	err = buildZip(outPath)
	if err != nil {
		c <- chanResult{err: err}
		return
	}

	err = os.Remove(outPath)
	if err != nil {
		c <- chanResult{err: err}
		return
	}

	c <- chanResult{err: nil}
}

func getInputDirectory(mainFile string) string {
	return strings.Replace(mainFile, "/main.go", "", 1)
}

// getOutputPath flattens the directory structure replacing `/` with `-` and sets the correct output directory
func getOutputPath(mainFile string) string {
	outDir := strings.Replace(mainFile, "/main.go", "", 1)
	outDir = strings.Replace(outDir, "./cmd/", "", 1)
	outDir = strings.ReplaceAll(outDir, "/", "-")

	return fmt.Sprintf("build/%s/bootstrap", outDir)
}

type chanResult struct {
	err error
}

func buildZip(outputPath string) error {
	zipFile, err := os.Create(outputPath + ".zip")
	if err != nil {
		return err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	err = addFileToZipDeterministic(zipWriter, outputPath)
	if err != nil {
		return err
	}

	return nil
}

func addFileToZipDeterministic(zipWriter *zip.Writer, filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	// Define a fixed timestamp (e.g., Unix epoch) to ensure determinism
	fixedTime := time.Date(time.Now().UTC().Year(), 1, 1, 0, 0, 0, 0, time.UTC)

	// Create ZIP header
	header := &zip.FileHeader{
		Name:   "bootstrap",
		Method: zip.Deflate, // Use Deflate for compression
	}
	header.Modified = fixedTime // Set fixed modification time
	header.SetMode(0755)        // Ensure consistent file permissions

	writer, err := zipWriter.CreateHeader(header)
	if err != nil {
		return err
	}

	_, err = io.Copy(writer, file)
	return err
}
