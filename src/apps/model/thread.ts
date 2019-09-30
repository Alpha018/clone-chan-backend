import mongoose, { Document, Schema, Model, model } from 'mongoose';
import mongooseDelete from 'mongoose-delete';
import mongoosePaginateV2 from 'mongoose-paginate-v2';
import { IComment } from './comment';

export interface IThread extends Document {
  _id: string;
  boardId: mongoose.Schema.Types.ObjectId;
  title: string;
  option: string;
  comment: string;
  file: mongoose.Schema.Types.ObjectId;
  comments: IComment[];
  threadId: number;
  countComment: number;
  countImage: number;
  countVideo: number;
  userInformation: mongoose.Schema.Types.ObjectId;
}

// tslint:disable-next-line:variable-name
const ThreadSchema: Schema = new Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  option: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true,
  },
  userInformation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection',
  },
},                                      { timestamps: { createdAt: 'created_at' } });

ThreadSchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });
ThreadSchema.plugin(mongoosePaginateV2);

// tslint:disable-next-line:variable-name
export const Thread: Model<IThread> = model<IThread>('Thread', ThreadSchema);
