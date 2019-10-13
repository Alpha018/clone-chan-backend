import mongoose, { Document, Schema, Model, model } from 'mongoose';
const autoIncrement = require('mongoose-sequence')(mongoose);
import mongooseDelete from 'mongoose-delete';

export interface IObjectIndex extends Document{
  _id: string;
  objectId: number;
  objectReference: string;
  type: string;
}

// tslint:disable-next-line:variable-name
const ObjectIndexSchema: Schema = new Schema({
  objectReference: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
  },
},                                           { timestamps: { createdAt: 'created_at' } });

ObjectIndexSchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });
ObjectIndexSchema.plugin(autoIncrement, { inc_field: 'objectId' });

// tslint:disable-next-line:variable-name max-line-length
export const ObjectIndex: Model<IObjectIndex> = model<IObjectIndex>('ObjectIndex', ObjectIndexSchema);
