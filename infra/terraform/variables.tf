variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "notes-app"
}

variable "key_name" {
  description = "Existing EC2 key pair name for SSH"
  type        = string
}

variable "my_ip_cidr" {
  description = "Public CIDR allowed to SSH (example: 203.0.113.10/32)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "bucket_name_prefix" {
  description = "Globally unique prefix for S3 bucket naming"
  type        = string
}
