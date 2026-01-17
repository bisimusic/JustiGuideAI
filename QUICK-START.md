# Quick Start Guide

Get JustiGuide AI up and running in minutes!

## Option 1: Docker (Recommended for Local Development)

### Prerequisites
- Docker Desktop installed and running
- API keys (Anthropic, OpenAI, Google AI)

### Steps

1. **Create `.env` file**:
   ```bash
   cat > .env << 'EOF'
   DATABASE_URL=postgresql://postgres:justiguide@db:5432/justiguide
   ANTHROPIC_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   GOOGLE_AI_API_KEY=your_key_here
   PORT=8000
   NODE_ENV=production
   RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
   EOF
   ```

2. **Run setup script**:
   ```bash
   ./setup-docker.sh
   ```

3. **Access the application**:
   - API: http://localhost:8000
   - RabbitMQ UI: http://localhost:15672 (guest/guest)

## Option 2: Kubernetes (For Production/Cloud)

### Prerequisites
- Kubernetes cluster (minikube, kind, or cloud)
- kubectl configured
- API keys

### Steps

1. **Create `.env` file** (same as Docker)

2. **Run setup script**:
   ```bash
   ./setup-kubernetes.sh
   ```

3. **Access services**:
   ```bash
   kubectl port-forward svc/api-service 8000:8000 -n justiguide
   # Then access at http://localhost:8000
   ```

## Option 3: Local Development (Without Docker)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up PostgreSQL** (locally or use cloud service)

3. **Create `.env` file** with your database URL

4. **Run migrations**:
   ```bash
   npm run db:push
   ```

5. **Start dev server**:
   ```bash
   npm run dev
   ```

## Troubleshooting

- **Port conflicts**: Change ports in docker-compose.yml or .env
- **Database connection**: Verify DATABASE_URL matches your setup
- **API errors**: Check that all API keys are set correctly
- **Docker not starting**: Ensure Docker Desktop is running

For detailed setup, see [DOCKER-KUBERNETES-SETUP.md](./DOCKER-KUBERNETES-SETUP.md)
