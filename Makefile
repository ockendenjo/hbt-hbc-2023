.PHONY: clean build upload

clean:
	rm -rf build/

build:
	go run ./scripts/build-cmd --zip

upload:
	go run ./scripts/upload-binaries
