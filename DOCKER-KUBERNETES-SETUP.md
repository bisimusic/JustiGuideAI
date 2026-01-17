# Docker & Kubernetes Setup Guide

This guide will help you set up and deploy the JustiGuide AI platform using Docker or Kubernetes.

## Prerequisites

### For Docker:
- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)
- At least 4GB of available RAM
- API keys for:
  - Anthropic (Claude)
  - OpenAI
  - Google AI

### For Kubernetes:
- A Kubernetes cluster (local with minikube/kind, or cloud provider)
- `kubectl` installed and configured
- Helm (optional, for advanced deployments)
- Same API keys as above

## Quick Start

### Docker Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/bisimusic/JustiGuideAI.git
   cd JustiGuideAI
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Run the setup script**:
   ```bash
   chmod +x setup-docker.sh
   ./setup-docker.sh
   ```

   Or manually:
   ```bash
   docker-compose up -d
   ```

4. **Verify services are running**:
   ```bash
   docker-compose ps
   ```

5. **Access the services**:
   - API: http://localhost:8000
   - RabbitMQ Management: http://localhost:15672 (guest/guest)
   - PostgreSQL: localhost:5432

### Kubernetes Setup

1. **Ensure kubectl is configured**:
   ```bash
   kubectl cluster-info
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Run the setup script**:
   ```bash
   chmod +x setup-kubernetes.sh
   ./setup-kubernetes.sh
   ```

   Or manually:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/postgres.yaml
   kubectl apply -f k8s/rabbitmq.yaml
   kubectl apply -f k8s/api-deployment.yaml
   kubectl apply -f k8s/processor-deployment.yaml
   ```

4. **Verify deployments**:
   ```bash
   kubectl get all -n justiguide
   ```

## Architecture

### Docker Compose Services

- **lead-api**: Main API server (port 8000)
- **lead-processor**: Background worker processes (3 replicas)
- **db**: PostgreSQL database (port 5432)
- **rabbitmq**: Message queue (ports 5672, 15672)
- **nginx**: Load balancer (ports 80, 443)

### Kubernetes Components

- **Namespace**: `justiguide` (isolates all resources)
- **PostgreSQL**: StatefulSet with PersistentVolume
- **RabbitMQ**: Deployment with service
- **API**: Deployment with service
- **Processor**: Deployment with multiple replicas

## Configuration

### Environment Variables

Required environment variables (set in `.env` or Kubernetes secrets):

```bash
# Database
DATABASE_URL=postgresql://postgres:justiguide@db:5432/justiguide

# API Keys
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
GOOGLE_AI_API_KEY=your_key_here

# Server
PORT=8000
NODE_ENV=production

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

### Docker Compose Configuration

Edit `docker-compose.yml` to:
- Change port mappings
- Adjust resource limits
- Modify replica counts
- Add additional services

### Kubernetes Configuration

Edit files in `k8s/` directory:
- `configmap.yaml`: Non-sensitive configuration
- `configmap.yaml` (Secret section): Sensitive data (API keys)
- `*-deployment.yaml`: Deployment specifications
- `postgres.yaml`: Database configuration

## Common Operations

### Docker

**View logs**:
```bash
docker-compose logs -f [service-name]
```

**Restart a service**:
```bash
docker-compose restart [service-name]
```

**Stop all services**:
```bash
docker-compose down
```

**Stop and remove volumes**:
```bash
docker-compose down -v
```

**Rebuild after code changes**:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Kubernetes

**View pods**:
```bash
kubectl get pods -n justiguide
```

**View logs**:
```bash
kubectl logs -f <pod-name> -n justiguide
```

**Scale deployments**:
```bash
kubectl scale deployment lead-processor --replicas=5 -n justiguide
```

**Port forward to access services**:
```bash
kubectl port-forward svc/api-service 8000:8000 -n justiguide
```

**Delete everything**:
```bash
kubectl delete namespace justiguide
```

## Troubleshooting

### Docker Issues

**Port already in use**:
- Change port mappings in `docker-compose.yml`
- Or stop the service using the port

**Out of memory**:
- Increase Docker Desktop memory allocation
- Reduce replica counts in docker-compose.yml

**Database connection errors**:
- Ensure database container is running: `docker-compose ps`
- Check database logs: `docker-compose logs db`
- Verify DATABASE_URL in .env matches docker-compose.yml

### Kubernetes Issues

**Pods not starting**:
```bash
kubectl describe pod <pod-name> -n justiguide
kubectl logs <pod-name> -n justiguide
```

**Image pull errors**:
- Ensure images are built and pushed to a registry
- Or use local images with `imagePullPolicy: Never`

**PersistentVolume issues**:
- Check storage class: `kubectl get storageclass`
- Verify PVC status: `kubectl get pvc -n justiguide`

## Production Considerations

### Security

1. **Change default passwords**:
   - PostgreSQL password
   - RabbitMQ credentials

2. **Use secrets management**:
   - Kubernetes Secrets
   - External secret managers (AWS Secrets Manager, HashiCorp Vault)

3. **Enable SSL/TLS**:
   - Configure nginx with SSL certificates
   - Use Ingress with TLS in Kubernetes

### Performance

1. **Resource limits**:
   - Set appropriate CPU/memory limits
   - Monitor resource usage

2. **Scaling**:
   - Use horizontal pod autoscaling in Kubernetes
   - Adjust replica counts based on load

3. **Database optimization**:
   - Configure connection pooling
   - Set up database backups

### Monitoring

1. **Health checks**:
   - All services have health check endpoints
   - Monitor `/api/health` endpoint

2. **Logging**:
   - Centralize logs with ELK stack or similar
   - Use structured logging

3. **Metrics**:
   - Set up Prometheus/Grafana
   - Monitor application metrics

## Next Steps

- [ ] Set up CI/CD pipeline
- [ ] Configure monitoring and alerting
- [ ] Set up database backups
- [ ] Configure SSL certificates
- [ ] Set up staging environment
- [ ] Review and update security settings

## Support

For issues or questions:
- Check the logs first
- Review this documentation
- Open an issue on GitHub
