.PHONY: clean format deploy tsc test

clean:
	find lib/ -name "*.d.ts" -delete
	find lib/ -name "*.js" -delete
	find test/ -name "*.d.ts" -delete
	find test/ -name "*.js" -delete
	find ui/ -name "*.d.ts" -delete
	find ui/ -name "*.js" -delete

format:
	npx prettier --write .

build:
	go run scripts/build/main.go

synth: build
	cdk synth

deploy: build
	cdk deploy

tsc:
	npx tsc lib/*.ts

test:
	npm test
