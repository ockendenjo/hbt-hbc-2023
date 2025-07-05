terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.81.0, != 6.1.0"
    }
  }

  backend "s3" {
    bucket = "ockendenjo-beerienteering-tfstate-rghv9t93fw"
    key    = "state.tfstate"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = "eu-west-1"
}

provider "aws" {
  # This is  because we're going to deploy our ACM to us-east-1 so we can later use with CloudFront
  alias  = "us-east-1"
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}
