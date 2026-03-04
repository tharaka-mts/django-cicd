# Notes CRUD + AWS Deployment (EC2 + Docker Compose + S3) — Architecture

## Goal
Deliver a minimal CRUD app (Notes) to demonstrate production-ready infrastructure, security, containerization, and AWS deployment practices on Free Tier.

Primary focus: **infra + security + deployment**, not complex app features.

---

## System Overview

### Components
- **Frontend**: React (Vite, Yarn) + TailwindCSS + Axios + React hooks state
- **Backend**: Django + Django REST Framework (CRUD API + upload endpoint)
- **Database**: PostgreSQL (private, internal Docker network only)
- **Reverse Proxy**: Nginx (single public entrypoint)
- **Uploads**: S3 bucket (private) using **pre-signed URLs**
- **AWS Deployment**: EC2 instance running Docker Compose
- **IaC**: Terraform provisions EC2 + Security Group + IAM Role + S3

### Public Exposure Rules
Only **Nginx** is exposed publicly:
- HTTP 80 (for Let’s Encrypt validation / redirect)
- HTTPS 443
Database must never be publicly exposed.

---

## Runtime Architecture (Production)

User Browser -> HTTPS(443) -> Nginx (EC2, container)
  - "/" serves React static build
  - "/api/*" proxies to Django backend container (Gunicorn)

Django backend connects to:
- PostgreSQL container via Docker network (host: `db`, port: 5432)
- S3 bucket via IAM Role attached to EC2 (no access keys stored)

---

## API Contract

### Notes CRUD
- GET  /api/notes/
- POST /api/notes/
- GET  /api/notes/{id}/
- PUT/PATCH /api/notes/{id}/
- DELETE /api/notes/{id}/

Note fields:
- id
- title (required)
- description (optional)
- created_at (auto)

### Upload
- POST /api/upload/ (multipart/form-data, file field name: "file")
- GET /api/uploads/ (recent uploaded files with fresh presigned URLs)
- DELETE /api/uploads/{id}/ (delete S3 object + app record)
Behavior:
- Upload file to S3 path: `${AWS_S3_PREFIX}${uuid}_${original_filename}`
- Return:
  - key
  - bucket
  - presigned_url (GET) valid for short duration (e.g., 10 minutes)

---

## Configuration & Secrets

### Environment Variables
All secrets/config via environment variables. No secrets in git.

Required backend env vars:
- DJANGO_SECRET_KEY
- DJANGO_DEBUG (false in prod)
- DJANGO_ALLOWED_HOSTS (e.g., "myapp.duckdns.org,localhost")
- DJANGO_CORS_ALLOWED_ORIGINS (prod restrict to duckdns domain)
- DB_NAME, DB_USER, DB_PASSWORD, DB_HOST=db, DB_PORT=5432
- AWS_REGION
- AWS_S3_BUCKET
- AWS_S3_PREFIX (default: uploads/)

Frontend env vars:
- VITE_API_BASE_URL (default: "/api")

Frontend state management:
- Keep UI state in plain React hooks (`useState`, `useEffect`)
- After create/update/delete, update local state from API response and re-sync list
- No extra client-side query caching library

### What must NOT be committed
- .env, .env.prod, .env.dev
- AWS access keys
- ssh keys (*.pem)
- SSL cert files
- terraform.tfstate / tfstate backups

---

## Docker & Compose Design

### Development
- docker-compose.yml runs:
  - db (postgres)
  - backend (django dev or gunicorn—choose simplest for dev)
  - nginx (routes /api + serves frontend)
  - frontend (either dev server or built into nginx; prefer prod-like approach)

### Production
- docker-compose.prod.yml runs:
  - db
  - backend (gunicorn)
  - nginx (serves built frontend + proxies /api)
Only nginx exposes ports.

---

## Nginx Responsibilities
- reverse proxy: `/api/` -> `http://backend:8000/`
- serve React static build for `/`
- SPA fallback to `/index.html`
- add basic security headers
- gzip enabled
- upload body size limit: `10MB`
- SSL termination in production (certbot on host; nginx uses mounted certs)

---

## AWS Infrastructure (Terraform)

Provision:
- S3 bucket (private; block public access ON)
- IAM role + instance profile for EC2:
  - ListBucket on bucket
  - Get/Put/DeleteObject on bucket/*
- EC2 instance (t3.micro/t2.micro) in default VPC/subnet
- Security group:
  - inbound 80/443 from 0.0.0.0/0
  - inbound 22 from `my_ip_cidr` only
  - outbound all

Outputs:
- public_ip
- ssh command
- bucket_name

---

## SSL with DuckDNS
- DuckDNS subdomain points to EC2 public IP
- certbot used to obtain Let’s Encrypt certificate
- nginx configured to use certs and redirect HTTP->HTTPS

---

## Future Scaling (high level)
- Move from EC2+Compose to ECS Fargate + ALB
- Use ACM for TLS
- Move Postgres from container to RDS (automated backups)
- Use task roles for S3 access
- Optional CloudFront/S3 hosting for frontend

---

## Backups (MVP vs production)
MVP:
- pg_dump nightly to S3 + retention policy
- optional EBS snapshot

Production:
- RDS automated backups + point-in-time restore
- snapshots before migrations

---

## Free Tier Considerations
- Single micro EC2 instance
- avoid NAT Gateway, avoid ALB for MVP
- small EBS volume
- minimal CloudWatch usage
