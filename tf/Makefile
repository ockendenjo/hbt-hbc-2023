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
	cd .. && make upload
