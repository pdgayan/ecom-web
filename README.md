# The Project
This is a simulation of how a microservices e-commerce application is deployed and operated on AWS. Six independently deployed services run on Amazon Elastic Kubernetes Service (EKS), with each service owning its own RDS PostgreSQL database for strict data isolation. The wider infrastructure leans on AWS native tooling throughout ECR for container image storage, S3 for static frontend hosting and product assets, Secrets Manager for credential management, and IAM with IRSA for fine grained, pod level access control, no long lived credentials anywhere in the system.

# ecom-web

React frontend and the CI/CD pipeline that deploys it. The application communicates with the backend microservices through a single API URL configured at build time via `VITE_API_URL`, which points to the ALB Ingress controller in front of the EKS cluster. When a change is pushed to `main`, GitHub Actions builds the Vite production bundle and syncs the output to an S3 bucket configured for static website hosting — no server required.

---

## System Context

```
                          ┌─────────────────────────────────────┐
                          │         User's Browser              │
                          └──────────────┬──────────────────────┘
                                         │  HTTPS
                                         ▼
                          ┌─────────────────────────────────────┐
                          │     S3 Static Website Hosting       │
                          │     (React / Vite production build) │
                          │                                     │
                          │  Pages:                             │
                          │   / ─────────────► ProductList      │
                          │   /cart ──────────► CartPage        │
                          │   /checkout ──────► CheckoutPage    │
                          │   /login ─────────► AuthPage        │
                          │   /orders ────────► OrdersPage      │
                          └──────────────┬──────────────────────┘
                                         │  VITE_API_URL  (injected at build)
                                         │  → https://<alb-dns>/api/*
                                         ▼
                          ┌─────────────────────────────────────┐
                          │     AWS ALB (Ingress Controller)    │
                          │     in front of EKS Cluster         │
                          └──────────────┬──────────────────────┘
                                         │
                 ┌───────────────────────┼────────────────────────────┐
                 ▼                       ▼                            ▼
          auth-service           catalog-service               cart / order /
          /api/auth/*            /api/products/*               payment services
```

---

## CI/CD Pipeline — Sequence Diagram

```
  Developer         GitHub           GitHub Actions          AWS S3
      │                │                   │                    │
      │──git push─────►│                   │                    │
      │  main          │                   │                    │
      │                │──── trigger ─────►│                    │
      │                │  (web_cicd.yml)   │                    │
      │                │                   │                    │
      │                │                   │── npm install      │
      │                │                   │── npm run build    │
      │                │                   │   VITE_API_URL=    │
      │                │                   │   ${{ vars.API }}  │
      │                │                   │                    │
      │                │                   │── OIDC assume role►│
      │                │                   │   (no stored creds)│
      │                │                   │                    │
      │                │                   │── aws s3 sync ────►│
      │                │                   │   dist/ → bucket   │
      │                │                   │   --delete         │
      │                │                   │                    │
      │                │                   │                    │  ✓ live
      │◄───────────────────────────────────────────────────────►│
      │     user sees updated app via S3 static hosting URL     │
```

---

## Frontend Component Map

```
  src/
  ├── api/
  │   └── client.js          # axios instance — baseURL = VITE_API_URL
  │                            all requests go through here
  │
  ├── pages/
  │   ├── ProductList.jsx    ──► GET  /api/products          (catalog-service)
  │   ├── CartPage.jsx       ──► GET/POST/DELETE /api/cart   (cart-service)
  │   ├── CheckoutPage.jsx   ──► POST /api/orders            (order-service)
  │   │                          POST /api/payment           (payment-service)
  │   ├── AuthPage.jsx       ──► POST /api/auth/login        (auth-service)
  │   │                          POST /api/auth/register
  │   └── OrdersPage.jsx     ──► GET  /api/orders            (order-service)
  │
  └── components/
      ├── Navbar.jsx         # Cart count, user name, logout
      ├── ProductCard.jsx    # Image (S3 URL), price, add to cart
      └── ...
```

---

## Build & Environment Configuration

```
  Build time:
  ┌─────────────────────────────────────────────────────────────┐
  │  VITE_API_URL=https://<alb-dns-name>                        │
  │                                                             │
  │  npm run build  →  dist/                                    │
  │    index.html                                               │
  │    assets/index-<hash>.js   ← API URL baked into bundle     │
  │    assets/index-<hash>.css                                  │
  └─────────────────────────────────────────────────────────────┘

  Runtime (S3):
  ┌─────────────────────────────────────────────────────────────┐
  │  S3 bucket: static website hosting enabled                  │
  │  index document: index.html                                 │
  │  error document: index.html  (SPA fallback routing)         │
  │  No server → no runtime environment variables               │
  └─────────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
ecom-web/
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route-level components
│   │   │   ├── ProductList.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   └── OrdersPage.jsx
│   │   ├── components/      # Shared UI components (Navbar, ProductCard, etc.)
│   │   └── api/             # API client (uses VITE_API_URL env var)
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── .github/
    └── workflows/
        └── web_cicd.yml     # CI/CD: build Vite app → sync dist/ to S3 via OIDC
```

---

**Deployment pipeline:**
1. Triggered on `push` to `main`
2. Installs dependencies and runs `npm run build` with `VITE_API_URL` injected from GitHub Actions variables
3. Authenticates to AWS via OIDC (no stored credentials)
4. Syncs the `dist/` output to the S3 frontend bucket with `--delete` to remove stale files
5. The S3 bucket serves the static app directly — no server required
