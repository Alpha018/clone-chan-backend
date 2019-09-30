import { NextFunction, Request, Response } from 'express';
import { Board } from '../../model/board';
import logger, { buildPrefix } from '@reignmodule/utils/utils/logger';
import { errors } from '../../../utils/errors';

export class BoardController {
  static async getBoards(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    try {
      const agg = [
        {$group: {
          _id: '$category',
          board: { $push: {
            name: '$name',
            slug: '$slug',
            nsfw: '$nsfw',
            category: '$category',
            icon: '$icon',
            subMessage: '$subMessage',
          }},
        }},
      ];
      const boards = await Board.aggregate(agg);

      res.status(200).send({ boards });
    } catch (e) {
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
      return;
    }
  }

  static async getBoardBySlug(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    const { slug } = req.query;

    if (!slug) {
      logger.error(`${logPrefix} Some param not found in request`);
      next(new errors.BAD_REQUEST());
      return;
    }

    try {
      const board = await Board.findOne({
        slug,
      }).select('-deleted -created_at -updatedAt -__v');
      res.status(200).send({ board });
    } catch (e) {
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
      return;
    }
  }
}
