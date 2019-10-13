import mongoose, { Document, Schema, Model, model } from 'mongoose';
import mongooseDelete from 'mongoose-delete';
import mongoosePaginateV2 from 'mongoose-paginate-v2';
const autoIncrement = require('mongoose-sequence')(mongoose);

export interface IBoard extends Document {
  _id: string;
  name: string;
  slug: string;
  nsfw: boolean;
  icon: string;
  subMessage: string;
  boardId: number;
}

// tslint:disable-next-line:variable-name
const BoardSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  nsfw: {
    type: Boolean,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  subMessage: {
    type: String,
  },
},                                     { timestamps: { createdAt: 'created_at' } });

BoardSchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });
BoardSchema.plugin(mongoosePaginateV2);
BoardSchema.plugin(autoIncrement, { inc_field: 'boardId' });

// tslint:disable-next-line:variable-name
export const Board: Model<IBoard> = model<IBoard>('Board', BoardSchema);
