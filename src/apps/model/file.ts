import mongoose, { Document, Schema, Model, model } from 'mongoose';
import mongooseDelete from 'mongoose-delete';
import mongoosePaginateV2 from 'mongoose-paginate-v2';
const autoIncrement = require('mongoose-sequence')(mongoose);

export interface IFile extends Document {
  _id: string;
  nameFileOriginal: string;
  nameFile: string;
  type: string;
  eTag: string;
  key: string;
  fileId: number;
  md5: string;
  mimeType: string;
  size: string;
  dimension: string;
}

// tslint:disable-next-line:variable-name
const FileSchema: Schema = new Schema({
  nameFileOriginal: {
    type: String,
    required: true,
  },
  nameFile: {
    type: String,
    index: true,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  eTag: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  md5: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  dimension: {
    type: String,
  },
},                                    { timestamps: { createdAt: 'created_at' } });

FileSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });
FileSchema.plugin(mongoosePaginateV2);
FileSchema.plugin(autoIncrement, { inc_field: 'fileId' });

// tslint:disable-next-line:variable-name
export const File: Model<IFile> = model<IFile>('File', FileSchema);
