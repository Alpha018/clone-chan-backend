import { NextFunction, Request, Response } from 'express';
import logger, { buildPrefix } from '@reignmodule/utils/utils/logger';
import { Thread } from '../../model/thread';
import { errors } from '../../../utils/errors';
import { UploadedFile } from 'express-fileupload';
import { IFile } from '../../model/file';
import { SpaceManager } from '../manager/space-manager';
import { Utils } from '../../../utils/utils';
import { IComment, Comment } from '../../model/comment';
import { IObjectIndex, ObjectIndex } from '../../model/objectIndex';
import { MongoManager } from '../manager/mongo-manager';

export class CommentController {
  static async getComments(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    const { thread } = req.query;

    if (!thread) {
      logger.error(`${logPrefix} Some param not found in request`);
      next(new errors.BAD_REQUEST({ missing: 'file' }));
      return;
    }
    try {
      const comments = await Comment.find({
        threadId: thread,
      })
        .select('_id option comment commentId')
        .populate([{
          path: 'file',
          select: '_id type nameFile fileId key nameFileOriginal type mimeType size dimension',
        }, {
          path: 'userInformation',
          select: 'country countryCode',
        }]);
      const result: IComment[] = [];
      comments.forEach((data) => {
        result.push(data.toObject());
      });

      for (let i = 0; i < result.length; i = i + 1) {
        await MongoManager.getIdCommentThread(result[i]);
      }

      res.status(200).send({ comments: result });
    } catch (e) {
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
      return;
    }
  }

  static async createNewComment(req: Request, res: Response, next: NextFunction) {
    const logPrefix = buildPrefix(req.method, req.path);

    const { thread, comment, option = 'Anonymous' } = req.body;

    const commentReference: IObjectIndex = await ObjectIndex.findOne({
      objectId: thread,
    });

    if (!commentReference) {
      logger.error(`${logPrefix} file extension is invalid`);
      next(new errors.BAD_REQUEST());
      return;
    }

    const commentReferenceId = commentReference.objectReference;

    let image: UploadedFile;
    if (req.files) {
      image = req.files.image as UploadedFile;
      if (!Utils.verifyExtension(image)) {
        logger.error(`${logPrefix} file extension is invalid`);
        next(new errors.UNSUPPORTED_MEDIA_TYPE());
        return;
      }
    }

    if (!(thread && commentReferenceId)) {
      logger.error(`${logPrefix} Some param not found in request`);
      next(new errors.BAD_REQUEST());
      return;
    }

    try {
      // @ts-ignore
      const threadTable = await Thread.findById(commentReferenceId)
        .populate('boardId');

      if (!threadTable) {
        logger.error(`${logPrefix} Board not found in database`);
        next(new errors.NOT_FOUND({ type: 'id', id: 'board' }));
        return;
      }

      let uploadFile: IFile;
      if (image) {
        uploadFile = await SpaceManager.uploadFile(
          image,
          // @ts-ignore
          threadTable.boardId.name,
        ) as IFile;
      }

      const commentFinal: IComment = new Comment({
        option,
        comment,
        threadId: threadTable,
        file: uploadFile,
        userInformation: res.locals.session,
      });

      await commentFinal.save();

      const objectReference = new ObjectIndex({
        objectReference: commentFinal._id,
        type: 'comment',
      });

      await objectReference.save();

      const commentSend = Utils.removeMeta(
        commentFinal.toObject(),
        ['deleted', 'created_at', 'updatedAt', '__v', 'userInformation'],
      );
      res.status(200).send({ comment: await MongoManager.getIdCommentThread(commentSend) });

    } catch (e) {
      logger.error(`${logPrefix} Error: ${e.message}`);
      next(new errors.NOT_FOUND({ error: e.message }));
      return;
    }
  }
}
