# Cloud E-Commerce — Microservices on Docker

> **MSc in Computer Engineering — Mobile Computing**  
> Cloud Computing discipline project  

A full-stack e-commerce application rebuilt from a monolith into a **microservices architecture** running entirely inside Docker. The project explores cloud-native patterns such as event-driven messaging, server-sent events, cloud blob storage, and API gateway routing — all runnable locally with a single command.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Services](#services)
3. [Key Engineering Decisions](#key-engineering-decisions)
4. [Prerequisites](#prerequisites)
5. [Running the Application](#running-the-application)
   - [Production mode](#production-mode)
   - [Development mode (hot-reload)](#development-mode-hot-reload)
6. [Environment Variables](#environment-variables)
7. [Debugging](#debugging)
8. [Adding a New Feature](#adding-a-new-feature)
9. [Adding a New Service](#adding-a-new-service)
10. [Project Structure](#project-structure)

---

## Architecture Overview

```
Browser
  │
  ├── :3000  →  frontend (React / Nginx in prod, CRA dev-server in dev)
  │
  └── :5000  →  Nginx API Gateway
                  ├── /api/orders        →  orders-service        :3000
                  ├── /api/products      →  products-service      :3000
                  ├── /api/uploads       →  products-service      :3000
                  ├── /api/users         →  users-service         :3000
                  ├── /api/notifications →  notifications-service :3000  (SSE)
                  └── /storage/          →  azurite-storage-emulator :10000

Internal event bus (not exposed to the browser):
  orders-service  ──publish──►  RabbitMQ  ──consume──►  notifications-service
```

Every backend service connects to a shared **MongoDB** instance and communicates through an internal Docker network. No service port is exposed to the host in production — all traffic enters through the Nginx gateway.

---

## Services

| Service | Responsibility |
|---|---|
| **orders-service** | Cart checkout, order lifecycle, PayPal integration. Publishes `ORDER_CREATED` and `ORDER_PAID` events to RabbitMQ. |
| **products-service** | Product catalogue CRUD and image uploads. Stores images in Azure Blob Storage (Azurite locally). |
| **users-service** | Registration, authentication, JWT issuance. |
| **notifications-service** | Consumes RabbitMQ events and pushes real-time notifications to connected browsers via SSE. |
| **nginx** | API gateway — path-based routing, SSE passthrough, static storage proxy. |
| **frontend** | React + Redux SPA. Served by Nginx in production; CRA dev-server in development. |
| **mongo-db** | Shared MongoDB 5 instance (one DB per logical domain). |
| **rabbitmq** | AMQP message broker with management UI. |
| **azurite-storage-emulator** | Local Azure Blob Storage emulator used by products-service for image uploads. |

---

## Key Engineering Decisions

### 1. Production vs. Development Compose split

The project uses two Compose files:

- `docker.compose.yml` — production baseline: no host ports for internal services, frontend served as a static Nginx build, Azurite credentials omitted.
- `docker.compose.dev.yml` — development overrides merged on top: every service port is exposed to the host (so you can hit them directly with Postman or a debugger), the frontend is replaced with the CRA dev-server with hot-module replacement, and Azurite's well-known dev key is inlined.

Keeping these separate means the production file never leaks debug ports or dev credentials, and the dev file never requires duplicating the entire service graph. You merge them at startup:

```bash
# development
docker compose -f docker.compose.yml -f docker.compose.dev.yml up --build

# production
docker compose -f docker.compose.yml up -d --build
```

### 2. RabbitMQ health-check dependency chain

`notifications-service` depends on RabbitMQ with `condition: service_healthy`, backed by a `rabbitmq-diagnostics ping` health check that retries every 10 seconds. This prevents the service from crashing on startup because the broker is not yet accepting connections — a race condition that is common in multi-container environments and invisible until load or a slow machine exposes it.

```yaml
# docker.compose.yml (excerpt)
rabbitmq:
  healthcheck:
    test: ["CMD", "rabbitmq-diagnostics", "ping"]
    interval: 10s
    retries: 5

notifications-service:
  depends_on:
    rabbitmq:
      condition: service_healthy   # ← waits for the broker to be ready
```

### 3. Nginx SSE passthrough configuration

Server-Sent Events require the proxy to flush frames to the client immediately and keep the connection open indefinitely. The default Nginx proxy behaviour buffers responses, which silently breaks SSE. The notifications location block disables that:

```nginx
location /api/notifications {
    proxy_pass              http://notifications;
    proxy_buffering         off;          # deliver frames immediately
    proxy_cache             off;
    proxy_set_header        Connection '';
    proxy_http_version      1.1;
    chunked_transfer_encoding on;
}
```

Without these directives the browser's `EventSource` connection would appear to connect successfully but never receive any events.

### 4. Azurite mirrors real Azure Blob Storage

`products-service` uses the official `@azure/storage-blob` SDK and reads the connection string from `AZURE_BLOB_CONNECTION_STRING`. Locally, that string points to Azurite. In a real Azure deployment, replacing the string with an actual Storage Account connection string is the only change required — no code changes, no conditional logic. The container automatically creates the blob container on first upload:

```js
// backend/products-service/src/infrastructure/file-storage.js
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_BLOB_CONNECTION_STRING || 'UseDevelopmentStorage=true'
);
```

This makes local development parity with the cloud a first-class concern.

---

## Prerequisites

| Tool | Version |
|---|---|
| Docker Desktop | 4.x or later |
| Docker Compose | v2 (bundled with Docker Desktop) |
| Node.js *(dev only, optional)* | 18.x |

---

## Running the Application

### Production mode

```bash
# 1. Clone the repo
git clone https://github.com/PequeChianca/node-react-ecommerce
cd node-react-ecommerce

# 2. Create a .env file (see Environment Variables section)
cp .env.example .env   # edit as needed

# 3. Build and start all containers in the background
docker compose -f docker.compose.yml up -d --build

# 4. Open the app
#    Frontend  → http://localhost:3000
#    API       → http://localhost:5000
```

### Development mode (hot-reload)

```bash
docker compose -f docker.compose.yml -f docker.compose.dev.yml up --build
```

In dev mode:
- Every backend service is reachable directly on the host (see port table below).
- The RabbitMQ management UI is available at `http://localhost:15672` (credentials: `guest` / `guest`).

| Service | Dev host port |
|---|---|
| MongoDB | `27017` |
| orders-service | `5001` |
| products-service | `5002` |
| users-service | `5003` |
| notifications-service | `5004` |
| RabbitMQ AMQP | `5672` |
| RabbitMQ management | `15672` |
| Azurite Blob | `10000` |
| Azurite Queue | `10001` |
| Azurite Table | `10002` |
| orders-service debugger | `9229` |
| products-service debugger | `9230` |
| users-service debugger | `9231` |
| notifications-service debugger | `9232` |

### First-run setup

After the stack is up, create the admin user:

```bash
curl http://localhost:5000/api/users/createadmin
# returns { "email": "...", "password": "..." }
```

Then sign in at `http://localhost:3000/signin` and navigate to `http://localhost:3000/products` to create products.

---

## Environment Variables

Create a `.env` file at the project root. In dev mode the Azurite connection string is already inlined in `docker.compose.dev.yml`; in production you must supply a real Azure Storage connection string.

```dotenv
# PayPal REST API client ID (sandbox or live)
PAYPAL_CLIENT_ID=your_paypal_client_id

# Azure Blob Storage — real account for production, omit for dev (Azurite is used)
AZURE_BLOB_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
```

#### TODO: Frontend Profile (pending to fix)

```bash
 docker compose -f docker.compose.yml -f docker.compose.dev.yml --profile frontend up --build -d
```
- The React app is served by the CRA dev-server on `http://localhost:3000` with **hot-module replacement** — edits to `frontend/src` are reflected in the browser instantly without rebuilding the container.
---

## Debugging

### Attach the VS Code debugger to a backend service

In dev mode every backend service starts Node.js with `--inspect` and exposes its debugger on a dedicated host port:

| Service | Inspector port |
|---|---|
| orders-service | `9229` |
| products-service | `9230` |
| users-service | `9231` |
| notifications-service | `9232` |

**Steps:**

1. Start the stack in dev mode:
   ```bash
   docker compose -f docker.compose.yml -f docker.compose.dev.yml up --build -d
   ```

2. Set breakpoints in any file under `backend/` in VS Code.

3. Open the **Run & Debug** panel (`Ctrl+Shift+D`), choose one of:
   - **Attach: orders-service** / **products-service** / **users-service** / **notifications-service** — attach to a single service.
   - **Attach: All Services** — attach to all four at once.

4. Press **F5**. VS Code will pause execution at your breakpoints.

The source-map paths are configured in [.vscode/launch.json](.vscode/launch.json): `localRoot` maps `backend/` on the host to `/app` inside the container, so breakpoints in both service code and the shared `common/` library resolve correctly.

### View logs for a specific service

```bash
docker compose -f docker.compose.yml logs -f orders-service
```

### Inspect the MongoDB database

Connect from any MongoDB client (e.g., MongoDB Compass or `mongosh`) to `mongodb://localhost:27017` while running in dev mode.

### Inspect RabbitMQ queues

Open `http://localhost:15672` (dev mode only). Login with `guest` / `guest`. The **Queues** tab shows pending messages; the **Connections** tab shows which services are connected.

### Inspect Azurite blob storage

Use [Azure Storage Explorer](https://azure.microsoft.com/en-us/products/storage/storage-explorer/) and connect to `http://127.0.0.1:10000/devstoreaccount1` with account name `devstoreaccount1` and the well-known dev key found in `docker.compose.dev.yml`.

### Check service health endpoints

Each backend service exposes a `/status` route proxied through the gateway:

```bash
curl http://localhost:5000/api/orders/status
curl http://localhost:5000/api/products/status
curl http://localhost:5000/api/users/status
curl http://localhost:5000/api/notifications/status
```

### Restart a single service without rebuilding the stack

```bash
docker compose -f docker.compose.yml restart orders-service
```

---

## Adding a New Feature

### Backend (existing service)

1. Add route handler in `backend/<service>/src/routes/`.
2. Register it in `backend/<service>/src/server.js`.
3. If the feature publishes a message, create a message class under `backend/<service>/src/messages/` following the `type` + `payload` shape used by `publishMessage()` from `common`.
4. If another service must react, add a handler in that service's `message-handlers/` directory and register it in its message consumer.
5. Restart the affected service: `docker compose -f docker.compose.yml restart <service-name>`.

### Frontend

1. Add constants in `frontend/src/constants/`.
2. Add action creators in `frontend/src/actions/`.
3. Add reducer cases in `frontend/src/reducers/`.
4. Create or update screen components in `frontend/src/screens/`.
5. Register new routes in `frontend/src/App.js`.

In dev mode, changes are reflected immediately via HMR. In production, rebuild the frontend container: `docker compose -f docker.compose.yml up -d --build frontend`.

---

## Adding a New Service

1. Create `backend/<new-service>/` with a `dockerfile`, `package.json`, and `src/server.js` (use an existing service as a reference).
2. Add the service to `docker.compose.yml` following the same pattern: build context, environment variables, `depends_on`.
3. Add a `ports` override in `docker.compose.dev.yml` for local debugging.
4. Add an upstream and `location` block to `backend/nginx/nginx.conf`.
5. Rebuild: `docker compose -f docker.compose.yml up -d --build`.

---

## Project Structure

```
.
├── docker.compose.yml          # Production service graph
├── docker.compose.dev.yml      # Dev overrides (ports, HMR frontend, dev credentials)
├── backend/
│   ├── common/                 # Shared library: config, messaging, data-access helpers
│   ├── nginx/                  # API gateway config and Dockerfile
│   ├── orders-service/
│   ├── products-service/
│   ├── users-service/
│   └── notifications-service/
└── frontend/                   # React + Redux SPA
    ├── dockerfile              # Multi-stage: build → Nginx static server
    └── src/
        ├── actions/
        ├── reducers/
        ├── screens/
        └── components/
```