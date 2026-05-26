
import { HttpError } from '../../utils/http-error';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response';

import { usersService } from './users.service';

import type { Request, Response } from 'express';

export const usersController = {
  async getMe(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const user = await usersService.getProfile(req.auth.userId);
    sendSuccess(res, { user });
  },

  async updateMe(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const user = await usersService.updateProfile(req.auth.userId, req.body as Record<string, string>);
    sendSuccess(res, { user });
  },

  async updatePreferences(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const prefs = await usersService.updatePreferences(req.auth.userId, req.body as Record<string, unknown>);
    sendSuccess(res, { preferences: prefs });
  },

  async listAddresses(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const addresses = await usersService.listAddresses(req.auth.userId);
    sendSuccess(res, { addresses });
  },

  async createAddress(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const address = await usersService.createAddress(
      req.auth.userId,
      req.body as Parameters<typeof usersService.createAddress>[1],
    );
    sendCreated(res, { address });
  },

  async updateAddress(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const { addressId } = req.params as { addressId: string };
    const address = await usersService.updateAddress(
      req.auth.userId,
      addressId,
      req.body as Record<string, unknown>,
    );
    sendSuccess(res, { address });
  },

  async deleteAddress(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const { addressId } = req.params as { addressId: string };
    await usersService.deleteAddress(req.auth.userId, addressId);
    sendNoContent(res);
  },

  async setDefaultAddress(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const { addressId } = req.params as { addressId: string };
    const address = await usersService.setDefaultAddress(req.auth.userId, addressId);
    sendSuccess(res, { address });
  },

  async deleteAccount(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    await usersService.softDeleteAccount(req.auth.userId);
    sendNoContent(res);
  },
};
