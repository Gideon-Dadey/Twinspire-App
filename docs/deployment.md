# Deployment notes (preview)

Full deployment automation lands in Phase 10. This file captures the target
topology so Phase 2-9 work stays compatible.

## Target topology

```
                       ┌──────────────────────────┐
                       │        Cloudflare        │
                       │   (DNS · CDN · WAF)      │
                       └─────────────┬────────────┘
                                     │
                ┌────────────────────┴────────────────────┐
                ▼                                         ▼
       ┌────────────────┐                       ┌──────────────────┐
       │     Vercel     │                       │    AWS (ECS)     │
       │  Next.js 15    │ ─── server actions ─▶ │  Express API     │
       │  ISR + Edge    │                       │  behind ALB      │
       └────────────────┘                       └────────┬─────────┘
                                                         │
                          ┌──────────────────────────────┼──────────────────────────────┐
                          ▼                              ▼                              ▼
                 ┌──────────────────┐         ┌───────────────────┐          ┌────────────────────┐
                 │ MongoDB Atlas    │         │  Redis Cloud      │          │  AWS S3 + CloudFront│
                 │ (replicated)     │         │  (cache+sessions) │          │  (assets, invoices) │
                 └──────────────────┘         └───────────────────┘          └────────────────────┘

                          AWS OpenSearch (managed Elasticsearch) for search and autocomplete.
```

## Required GitHub secrets (added in Phase 10)

| Name                          | Used by                |
| ----------------------------- | ---------------------- |
| `VERCEL_TOKEN`                | Frontend deployments   |
| `VERCEL_PROJECT_ID`           | Frontend deployments   |
| `VERCEL_ORG_ID`               | Frontend deployments   |
| `AWS_DEPLOY_ROLE_ARN`         | Backend deployments    |
| `AWS_ECR_REGISTRY`            | Backend image push     |
| `MONGODB_URI_PROD`            | Backend runtime config |
| `REDIS_URL_PROD`              | Backend runtime config |
| `STRIPE_LIVE_SECRET_KEY`      | Backend runtime config |
| `JWT_ACCESS_SECRET_PROD`      | Backend runtime config |
| `JWT_REFRESH_SECRET_PROD`     | Backend runtime config |

## Smoke tests after deploy

1. `GET https://<host>/api/v1/health` returns 200 + `status: ok`
2. `GET https://<host>/` returns 200 and the homepage renders
3. `GET https://<host>/_next/static/...` is cached at the CDN edge
4. Synthetic Lighthouse run from CI scores >= 95 on performance & accessibility
