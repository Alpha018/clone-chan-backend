import { Request, Response, NextFunction } from 'express';
import { SpaceManager } from '../manager/space-manager';
import { UploadedFile } from 'express-fileupload';
import { errors } from '../../../utils/errors';
import { Board } from '../../model/board';
import { Thread, IThread } from '../../model/thread';
import logger, { buildPrefix } from '@reignmodule/utils/utils/logger';
import { IFile } from '../../model/file';
import { Utils } from '../../../utils/utils';
import { MongoManager } from '../manager/mongo-manager';
import { Comment } from '../../model/comment';
import { ObjectIndex } from '../../model/objectIndex';
import { ancestorWhere } from 'tslint';

export class ThreadController {
  static async getThreads(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    const { page = 1, board = '' } = req.query;

    const paginateOptions = {
      page,
      limit: 15,
      lean: true,
      leanWithId: false,
      select:   '-deleted -updatedAt -__v',
      sort:     { created_at: -1 },
      populate: [{
        path: 'boardId',
        select: '-deleted -updatedAt -__v -created_at',
      }, {
        path: 'file',
        select: '_id type nameFile fileId key nameFileOriginal type mimeType size dimension',
      }, {
        path: 'userInformation',
        select: 'country countryCode',
      }],
    };

    const query = board ? { boardId: board } : {};
    try {
      // @ts-ignore
      const threads = await Thread.paginate(query, paginateOptions);
      await MongoManager.getComments(threads);
      await MongoManager.getCountComment(threads);

      for (let i = 0; i < threads.docs.length; i = i + 1) {
        await MongoManager.getIdCommentThread(threads.docs[i]);
        for (let j = 0; j < threads.docs[i].comments.length; j = j + 1) {
          await MongoManager.getIdCommentThread(threads.docs[i].comments[j]);
        }
      }
      res.status(200).send(threads);
    } catch (e) {
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
      return;
    }
  }

  static async getLatestThreads(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    try {
      logger.info(`${logPrefix} Getting latest post from threads`);

      const threads = await Thread.find()
      .select('-deleted -updatedAt -__v -userInformation')
      .populate([{
        path: 'boardId',
        select: '-deleted -updatedAt -__v -created_at',
      }, {
        path: 'file',
        select: '_id type nameFile fileId key nameFileOriginal type mimeType size dimension',
      }])
      .sort({ created_at: -1 })
      .limit(20);

      res.status(200).send({ threads });
    } catch (e) {
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
      return;
    }
  }

  static async getReferenceFromImage(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    const { fileid } = req.query;

    if (!fileid) {
      logger.error(`${logPrefix} Some param not found in request`);
      next(new errors.BAD_REQUEST());
      return;
    }

    try {
      let thread: IThread;
      thread = await MongoManager.searchThreadByFileOrId(fileid);
      if (!thread) {
        const comment = await Comment.findOne({ file: fileid })
          .populate('threadId');
        if (!comment) {
          next(new errors.NOT_FOUND({ id: fileid }));
          return;
        }
        // @ts-ignore
        thread = await MongoManager.searchThreadByFileOrId(comment.threadId._id);
      }

      res.status(200).send({ thread });
    } catch (e) {
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
      return;
    }
  }

  static async createNewThread(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    const { board, title, comment, option = 'Anonymous' } = req.body;

    if (!req.files) {
      logger.error(`${logPrefix} Some param not found in request`);
      next(new errors.BAD_REQUEST({ missing: 'file' }));
      return;
    }

    const image: UploadedFile = req.files.image as UploadedFile;

    if (!(board && title && comment && image)) {
      logger.error(`${logPrefix} Some param not found in request`);
      next(new errors.BAD_REQUEST());
      return;
    }

    if (!Utils.verifyExtension(image)) {
      logger.error(`${logPrefix} file extension is invalid`);
      next(new errors.UNSUPPORTED_MEDIA_TYPE());
      return;
    }
    console.log(image);
    try {
      const boardTable = await Board.findById(board);

      if (!boardTable) {
        logger.error(`${logPrefix} Board not found in database`);
        next(new errors.NOT_FOUND({ type: 'id', id: 'board' }));
        return;
      }

      const uploadFile: IFile = await SpaceManager.uploadFile(image, boardTable.name) as IFile;

      const thread: IThread = new Thread({
        comment,
        option,
        title,
        boardId: boardTable,
        file: uploadFile,
        userInformation: res.locals.session,
      });

      await thread.save();

      const objectReference = new ObjectIndex({
        objectReference: thread._id,
        type: 'thread',
      });

      await objectReference.save();

      const dataSend = Utils.removeMeta(
        thread.toObject(),
        ['deleted', 'created_at', 'updatedAt', '__v', 'userInformation'],
      );

      res.status(200).send({ thread: await MongoManager.getIdCommentThread(dataSend) });

    } catch (e) {
      if (e.status === 500) {
        logger.error(`${logPrefix} Error File exist: ${e.message}`);
        next(e);
        return;
      }
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
    }
  }
}
