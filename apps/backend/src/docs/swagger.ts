import { Router, type Request, type Response } from 'express';
import swaggerUi from 'swagger-ui-express';

import { buildOpenApiDocument } from './openapi';

export function buildDocsRouter(): Router {
  const router = Router();
  const document = buildOpenApiDocument();

  router.get('/openapi.json', (_req: Request, res: Response) => {
    res.type('application/json').send(document);
  });

  router.use('/', swaggerUi.serve);
  router.get(
    '/',
    swaggerUi.setup(document, {
      customSiteTitle: 'TwinSpire API',
      customCss: '.topbar { display: none; }',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    }),
  );

  return router;
}
