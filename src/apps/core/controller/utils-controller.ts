import { NextFunction, Request, Response } from 'express';
import logger, { buildPrefix } from '@reignmodule/utils/utils/logger';
import { errors } from '../../../utils/errors';
import { SpaceManager } from '../manager/space-manager';
import { File, IFile } from '../../model/file';
import { Thread } from '../../model/thread';
import { Connection } from '../../model/connection';
import moment from 'moment';
import { MongoManager } from '../manager/mongo-manager';

const imageThumbnail = require('image-thumbnail');
const strs = require('stringstream');

export class UtilsController {
  static async getIcon(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    const { key } = req.params;

    console.log(key);
    if (!key) {
      logger.error(`${logPrefix} Some param not found in request`);
      next(new errors.BAD_REQUEST());
      return;
    }

    try {
      console.log(`/icons/${key}`);
      const result = await SpaceManager.getFile(`icons/${key}`);

      res.header('Content-Disposition', `inline; filename="${key}"`);
      res.header('Content-type', 'image/svg+xml');
      result
        .pipe(res);
    } catch (e) {
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
      return;
    }
  }

  static async getFile(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    const { board, type, fileName } = req.params;
    const { id, namefile } = req.query;

    if (!(board && type && fileName)) {
      if (!(id || namefile)) {
        logger.error(`${logPrefix} Some param not found in request`);
        next(new errors.BAD_REQUEST());
        return;
      }
    }

    const fileMongo: IFile = await File.findOne({
      $or: [{
        _id: id,
      }, {
        nameFile: namefile,
      }, {
        nameFile: fileName,
      }],
    }) as IFile;

    if (!fileMongo) {
      logger.error(`${logPrefix} File not found in database`);
      next(new errors.NOT_FOUND({ type: 'file' }));
      return;
    }

    try {
      const result = await SpaceManager.getFile(fileMongo.key);

      res.header('Content-Disposition', `inline; filename="${fileMongo.nameFileOriginal}"`);
      res.header('Content-type', fileMongo.mimeType);
      result.pipe(res);
    } catch (e) {
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
      return;
    }
  }

  static async getStatistics(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    try {
      const posts = await Thread.count({});

      const users = (await Connection.count({ created_at: {
        $gte: moment().startOf('day'),
          $lt: moment().endOf('day'),
      } }).distinct('query')).length;

      const online = (await Connection.count({ created_at: {
          $gte: moment().subtract(40, 'minutes'),
          $lt: moment(),
        } }).distinct('query')).length;

      res.status(200).send({ posts, users, online });
    } catch (e) {
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
      return;
    }
  }

  static async getThreadOrCommentById(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    const { id } = req.query;

    if (!id) {
      logger.error(`${logPrefix} Some param not found in request`);
      next(new errors.BAD_REQUEST());
      return;
    }

    try {
      const objectIndex = await MongoManager.getCommentThread(id);

      if (!objectIndex) {
        logger.error(`${logPrefix} Index not found in database`);
        next(new errors.NOT_FOUND({ type: 'file' }));
        return;
      }

      const thread = await MongoManager.getIdCommentThread(objectIndex);

      res.status(200).send(thread);
    } catch (e) {
      next(e);
    }
  }

  static async getRandomImage(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    try {
      const count = await File.count({});
      const randomLimit = Math.floor(Math.random() * count);
      const images = await File.find({ type: 'image' })
        .select('_id nameFile key')
        .skip(randomLimit)
        .limit(5);

      res.status(200).send({ images });
    } catch (e) {
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
      return;
    }
  }

  static async tooLarge(req: Request, res: Response, next: NextFunction) {
    next(new errors.PAYLOAD_TOO_LARGE());
    return;
  }
}
