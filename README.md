# Notes CRUD + AWS Deployment (EC2 + Docker Compose + S3)

Minimal full-stack Notes CRUD app with production-focused infrastructure and deployment patterns.

## Stack
- Frontend: React (Vite, Yarn) + TailwindCSS + Axios + React hooks state
- Backend: Django + DRF (Notes CRUD + S3 upload endpoint)
- DB: PostgreSQL (private Docker network)
- Reverse proxy: Nginx (single public entrypoint)
- Storage: S3 private bucket via EC2 IAM role
- IaC: Terraform (`infra/terraform`)

## API
- `GET /api/notes/`
- `POST /api/notes/`
- `GET /api/notes/{id}/`
- `PUT/PATCH /api/notes/{id}/`
- `DELETE /api/notes/{id}/`
- `POST /api/upload/` (multipart field: `file`)

Upload response:
- `key`
- `bucket`
- `presigned_url` (GET, 10 min)

## One-Command Local Run
1. Copy env file:
```bash
cp .env.example .env
```
2. Set required values in `.env` (at minimum `DJANGO_SECRET_KEY`, `DB_PASSWORD`, `AWS_*`).
3. Start everything:
```bash
docker compose up --build
```
4. Open `http://localhost`

Frontend now uses a minimal deterministic data flow:
- no client query caching library
- create/update/delete always refetch the notes list from backend
- simpler behavior for local debugging and deployment demos

## Production Compose on EC2
### 1) Provision infra with Terraform
```bash
cd infra/terraform
terraform init
terraform apply \
  -var="key_name=YOUR_EC2_KEYPAIR_NAME" \
  -var="my_ip_cidr=YOUR_PUBLIC_IP/32" \
  -var="bucket_name_prefix=YOUR_UNIQUE_BUCKET_PREFIX"
```
Use outputs:
- `public_ip`
- `ssh_command`
- `bucket_name`

### 2) SSH to EC2 and deploy
```bash
ssh -i /path/to/key.pem ec2-user@<EC2_PUBLIC_IP>
```
Then on EC2:
```bash
git clone <your-repo-url>
cd django-cicd
cp .env.example .env.prod
```
Update `.env.prod`:
- `DJANGO_DEBUG=false`
- `DJANGO_ALLOWED_HOSTS=<your-subdomain>.duckdns.org`
- `DJANGO_CORS_ALLOWED_ORIGINS=https://<your-subdomain>.duckdns.org`
- `AWS_S3_BUCKET=<terraform bucket output>`
- `DOMAIN_NAME=<your-subdomain>.duckdns.org`

### 3) DuckDNS
- Create/update DuckDNS subdomain.
- Point it to EC2 public IP.
- Verify DNS resolves before cert issuance.

### 4) Obtain Let’s Encrypt certificate (Certbot)
Create certbot dirs:
```bash
mkdir -p certbot/www certbot/conf
```
Start app stack once so HTTP 80 serves challenge path:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
Request certificate:
```bash
docker run --rm \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d <your-subdomain>.duckdns.org \
  --email <your-email> --agree-tos --no-eff-email
```
Restart nginx:
```bash
docker compose -f docker-compose.prod.yml restart nginx
```

### 5) Run production stack
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## IAM Model
Terraform creates:
- EC2 IAM role + instance profile
- Policy allowing:
  - `s3:ListBucket` on bucket
  - `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on `bucket/*`

This removes the need for static AWS access keys in app env files.

## Security Group Rules
Inbound:
- `80/tcp` from `0.0.0.0/0`
- `443/tcp` from `0.0.0.0/0`
- `22/tcp` from `my_ip_cidr` only

Outbound:
- all traffic allowed

## Security Notes
- In production, only nginx publishes ports.
- PostgreSQL is internal-only; no public port mapping.
- Secrets are env-based; do not commit `.env*` (except `.env.example`).
- S3 bucket blocks all public access.

## Backups
MVP:
- Run nightly `pg_dump` and upload dumps to S3.
- Optional EBS snapshots.

Production path:
- Migrate PostgreSQL to RDS with automated backups + PITR.

## Free Tier Considerations
- Prefer single `t3.micro`/`t2.micro` EC2.
- Keep EBS small (e.g., 16GB).
- Avoid NAT Gateway and ALB for MVP cost control.

## Future Scaling
- ECS Fargate + ALB
- ACM-managed TLS
- RDS for PostgreSQL
- Task roles for S3 access
- CloudFront for frontend acceleration
