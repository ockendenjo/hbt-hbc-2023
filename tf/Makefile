.PHONY: plan apply format build upload

plan: build upload
	terraform plan

apply: build upload
	terraform apply --auto-approve

format:
	terraform fmt -recursive -write .

build:
	cd .. && make build

upload:
	aws s3 cp ../build/get-stashes/bootstrap.zip "s3://ockendenjo-beerienteering-tfstate-rghv9t93fw/lambdas/get-stashes.zip" --no-progress
