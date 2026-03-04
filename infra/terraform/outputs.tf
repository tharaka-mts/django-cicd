output "public_ip" {
  value = aws_instance.app.public_ip
}

output "ssh_command" {
  value = "ssh -i /path/to/key.pem ec2-user@${aws_instance.app.public_ip}"
}

output "bucket_name" {
  value = aws_s3_bucket.uploads.bucket
}
