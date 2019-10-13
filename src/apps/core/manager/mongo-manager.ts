import { Comment, IComment } from '../../model/comment';
import logger, { buildPrefix } from '@reignmodule/utils/utils/logger';
import path from 'path';
import { IThread, Thread } from '../../model/thread';
import { Utils } from '../../../utils/utils';
import { IObjectIndex, ObjectIndex } from '../../model/objectIndex';
import { errors } from '../../../utils/errors';

const logParentPrefix = path.basename(__filename, '.js');

export class MongoManager {
  public static async getComments(paginateObject: any, limit: number = 3) {
    const logPrefix = buildPrefix(logParentPrefix, this.getComments.name);

    logger.info(`${logPrefix} Init process to get comments`);
    for (let i = 0; i < paginateObject.docs.length; i = i + 1) {
      try {
        const data = await Comment.find({
             threadId: paginateObject.docs[i]._id,
           })
          .limit(limit)
          .select('_id option comment commentId created_at')
          .populate({
            path: 'file',
            select: '_id type nameFile fileId key nameFileOriginal type mimeType size dimension',
          }) as IComment[];

        const result: IComment[] = [];
        data.forEach((data) => {
          result.push(data.toObject());
        });

        paginateObject.docs[i].comments = result;
      } catch (e) {
        logger.error(`${logPrefix} Error in get comments: ${e.message}`);
      }
    }
  }

  public static async getCountComment(paginateObject: any) {
    const logPrefix = buildPrefix(logParentPrefix, this.getCountComment.name);

    logger.info(`${logPrefix} Init process to get count comment`);
    for (let i = 0; i < paginateObject.docs.length; i = i + 1) {
      try {
        const comments: IComment[] = await Comment.find({
          threadId: paginateObject.docs[i]._id,
        }).populate({
          path: 'file',
        });
        paginateObject.docs[i].countComment = comments.length;
        paginateObject.docs[i].countImage = Utils.countType(comments, 'image');
        paginateObject.docs[i].countVideo = Utils.countType(comments, 'video');
      } catch (e) {
        logger.error(`${logPrefix} Error in get comments: ${e.message}`);
      }
    }
  }

  public static async getIdCommentThread(threadComment: any) {
    const logPrefix = buildPrefix(logParentPrefix, this.getIdCommentThread.name);

    const index: IObjectIndex = await ObjectIndex.findOne({
      objectReference: threadComment._id,
    });

    if (!index) {
      logger.error(`${logPrefix} Error in put id in thread or comment`);
      return;
    }

    if (index.type === 'thread') {
      threadComment.threadId = index.objectId;
    } else if (index.type === 'comment') {
      threadComment.commentId = index.objectId;
    }
    return threadComment;
  }

  public static async getCommentThread(id: string) {
    const logPrefix = buildPrefix(logParentPrefix, this.getCommentThread.name);

    const objectIndex = await ObjectIndex.findOne({ objectId: id });

    if (!objectIndex) {
      logger.error(`${logPrefix} Error in put id in thread or comment`);
      throw new errors.NOT_FOUND({ id, error: 'Thread not found' });
    }

    if (objectIndex.type === 'thread') {
      return await this.getThreadWithComments(objectIndex.objectReference);
    }  if (objectIndex.type === 'comment') {
      const comment = await Comment.findOne({ _id: objectIndex.objectReference });
      // @ts-ignore
      return await this.getThreadWithComments(comment.threadId);
    }
  }

  public static async getThreadWithComments(id: string) {
    const thread = await Thread.findOne({ _id: id })
      .select('-deleted -updatedAt -__v')
      .populate([{
        path: 'boardId',
        select: '-deleted -updatedAt -__v -created_at',
      }, {
        path: 'file',
        select: '_id type nameFile fileId key nameFileOriginal type mimeType size dimension',
      }, {
        path: 'userInformation',
        select: 'country countryCode',
      }]);
    const threadObject = thread.toObject();
    threadObject.comments = await Comment.find({ threadId: thread._id })
      .select('_id option comment commentId created_at')
      .populate({
        path: 'file',
        select: '_id type nameFile fileId key nameFileOriginal type mimeType size dimension',
      });
    threadObject.countComment = threadObject.comments.length;
    threadObject.countImage = Utils.countType(threadObject.comments, 'image');
    threadObject.countVideo = Utils.countType(threadObject.comments, 'video');
    for (let j = 0; j < threadObject.comments.length; j = j + 1) {
      threadObject.comments[j] = threadObject.comments[j].toObject();
      threadObject.comments[j] = await MongoManager.getIdCommentThread(threadObject.comments[j]);
    }
    return threadObject;
  }

  public static async getCommentsByOne(threadObject: IThread) {
    const logPrefix = buildPrefix(logParentPrefix, this.getCommentsByOne.name);

    logger.info(`${logPrefix} Init process to get comments`);
    try {
      threadObject.comments = await Comment.find({
           threadId: threadObject._id,
         })
        .select('_id option comment commentId')
        .populate({
          path: 'file',
          select: '_id type nameFile key fileId dimension',
        }) as unknown as IComment[];
    } catch (e) {
      logger.error(`${logPrefix} Error in get comments: ${e.message}`);
    }
  }

  public static async searchThreadByFileOrId(fileThread: string) {
    const logPrefix = buildPrefix(logParentPrefix, this.searchThreadByFileOrId.name);

    try {
      let result: IThread = await Thread.findOne({
           $or: [{
             _id: fileThread,
           }, {
             file: fileThread,
           }],
         })
        .select('_id title option comment')
        .populate([{
          path: 'boardId',
          select: '-deleted -updatedAt -__v -created_at',
        }, {
          path: 'file',
          select: '_id type nameFile fileId key dimension',
        }, {
          path: 'userInformation',
          select: 'country countryCode',
        }]);
      if (result) {
        result = result.toObject();
        await this.getCommentsByOne(result);
      }
      return result;
    } catch (e) {
      logger.error(`${logPrefix} Error in get thread: ${e.message}`);
      throw e;
    }
  }
}
