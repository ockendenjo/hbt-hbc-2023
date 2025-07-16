package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	s3Types "github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/ockendenjo/hbt-hbc-2023/scripts/pkg/hash"
)

var buildPath = filepath.Join("build")

func main() {
	ctx := context.Background()

	awsConfig, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		panic(err)
	}

	s3Client := s3.NewFromConfig(awsConfig)
	bucket := getBucketForEnv()

	buildDirs, err := listBuildDirectories()
	if err != nil {
		panic(err)
	}

	manifestFile := make(map[string]string)

	var wg sync.WaitGroup
	errChan := make(chan error, 100) //Larger than number of lambdas
	sem := make(chan struct{}, 10)   // Limit concurrent executions

	for _, dir := range buildDirs {
		zipPath := filepath.Join(buildPath, dir, "bootstrap.zip")
		_, err = os.Stat(zipPath)
		if err != nil {
			continue
		}

		hexStr, err := hash.GetBinarySHA256Hex(zipPath)
		if err != nil {
			panic(err)
		}

		key := fmt.Sprintf("lambda_binaries/%s.zip", hexStr)
		exists, err := doesFileExist(ctx, s3Client, key, bucket)
		if err != nil {
			panic(err)
		}

		manifestFile[dir] = key
		if exists {
			fmt.Printf("Binary for %s already exists in S3\n", dir)
			continue
		}
		fmt.Printf("Binary for %s does not exist in S3, uploading...\n", dir)

		wg.Add(1)

		go func() {
			defer wg.Done()
			sem <- struct{}{} // Acquire a token
			defer func() { <-sem }()

			err = uploadFile(ctx, s3Client, zipPath, key, bucket)
			if err != nil {
				log.New(os.Stderr, "", 0).Printf("failed to upload lambda binary from %s: %s", dir, err.Error())
				errChan <- fmt.Errorf("failed to upload lambda binary from %s", dir)
				return
			}
			fmt.Printf("Binary for %s uploaded successfully\n", dir)
		}()
	}

	wg.Wait()

	if len(errChan) > 0 {
		os.Exit(1)
	}

	err = putManifest(ctx, s3Client, manifestFile, "default", bucket)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Manifest for %s uploaded successfully\n", "default")
}

func putManifest(ctx context.Context, s3Client *s3.Client, manifest map[string]string, workspace, bucket string) error {
	b, err := json.Marshal(manifest)
	if err != nil {
		return err
	}

	manifestKey := fmt.Sprintf("lambda_manifests/%s.json", workspace)
	_, err = s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      &bucket,
		Key:         &manifestKey,
		Body:        bytes.NewReader(b),
		ContentType: ptr("application/json"),
	})
	if err != nil {
		return err
	}

	//Write local copy
	b, err = json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return err
	}
	file, err := os.OpenFile("build/manifest.json", os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		return err
	}
	defer func(file *os.File) {
		_ = file.Close()
	}(file)
	_, _ = file.Write(b)

	return nil
}

func ptr[T any](v T) *T {
	return &v
}

func getBucketForEnv() string {
	return "ockendenjo-beerienteering-tfstate-rghv9t93fw"
}

func doesFileExist(ctx context.Context, s3Client *s3.Client, key string, bucket string) (bool, error) {
	_, err := s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: &bucket,
		Key:    &key,
	})
	if err != nil {
		var nf *s3Types.NotFound
		if errors.As(err, &nf) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func uploadFile(ctx context.Context, s3Client *s3.Client, filePath, key, bucket string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: &bucket,
		Key:    &key,
		Body:   file,
	})
	return err
}

func listBuildDirectories() ([]string, error) {
	entries, err := os.ReadDir(buildPath)
	if err != nil {
		return nil, err
	}

	buildDirs := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			buildDirs = append(buildDirs, entry.Name())
		}
	}

	return buildDirs, nil
}
