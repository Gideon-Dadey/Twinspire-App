# scripts/

Operational scripts. Populated through Phases 2-10:

| File                  | Phase | Purpose                              |
| --------------------- | ----- | ------------------------------------ |
| `seed.ts`             | 2     | Seed Mongo with sample data          |
| `reset-db.ts`         | 2     | Drop + reseed                        |
| `rotate-secrets.ts`   | 3     | Rotate JWT + cookie secrets          |
| `index-products.ts`   | 4     | Bulk-index products into Elasticsearch |
| `backup-mongo.sh`     | 10    | Scheduled Mongo Atlas backup helper  |
| `lighthouse-ci.sh`    | 9     | Run Lighthouse against preview URL   |
