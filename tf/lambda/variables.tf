variable "name" {
  type = string
}

variable "env_vars" {
  type    = map(string)
  default = {}
}

variable "s3_bucket" {
  type = string
}

variable "s3_key" {
  type = string
}

variable "timeout" {
  type    = number
  default = 10
}
