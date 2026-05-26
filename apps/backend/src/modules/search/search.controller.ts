
import { auditService } from '../../services/audit.service';
import { sendSuccess } from '../../utils/response';

import { searchIndexer } from './search.indexer';
import { searchService } from './search.service';

import type { SearchQuery } from './search.schemas';
import type { Request, Response } from 'express';

export const searchController = {
  async search(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as SearchQuery;
    const result = await searchService.search(query);
    sendSuccess(res, result);
  },

  async suggest(req: Request, res: Response): Promise<void> {
    const q = String(req.query.q ?? '');
    const limit = Number(req.query.limit ?? 8);
    const suggestions = await searchService.suggest(q, limit);
    sendSuccess(res, { suggestions });
  },

  async reindex(req: Request, res: Response): Promise<void> {
    const result = await searchIndexer.reindexAll();
    await auditService.fromRequest(req, {
      action: 'update',
      targetType: 'SearchIndex',
      metadata: result,
    });
    sendSuccess(res, result);
  },
};
