import mongoose, { Schema, Document, Model, model } from 'mongoose';
import mongooseDelete from 'mongoose-delete';
import mongoosePaginateV2 from 'mongoose-paginate-v2';

export interface IComment extends Document {
  _id: string;
  threadId: mongoose.Schema.Types.ObjectId;
  option: string;
  comment: Text;
  file: mongoose.Schema.Types.ObjectId;
  commentId: number;
  userInformation: mongoose.Schema.Types.ObjectId;
}

// tslint:disable-next-line:variable-name
const CommentSchema: Schema = new Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Thread',
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
  },
  userInformation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection',
  },
},                                       { timestamps: { createdAt: 'created_at' } });

CommentSchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });
CommentSchema.plugin(mongoosePaginateV2);

// tslint:disable-next-line:variable-name
export const Comment: Model<IComment> = model<IComment>('Comment', CommentSchema);
