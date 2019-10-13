import mongoose, { Document, Schema, Model, model } from 'mongoose';
import mongooseDelete from 'mongoose-delete';
import mongoosePaginateV2 from 'mongoose-paginate-v2';
const autoIncrement = require('mongoose-sequence')(mongoose);

export interface IConnection extends Document {
  _id: string;
  as: string;
  city: string;
  continent: string;
  continentCode: string;
  country: string;
  countryCode: string;
  isp: string;
  lat: number;
  lon: number;
  mobile: boolean;
  org: string;
  proxy: boolean;
  query: string;
  region: string;
  regionName: string;
  status: string;
  timezone: string;
  zip: string;
}

// tslint:disable-next-line:variable-name
const ConnectionSchema: Schema = new Schema({
  as: {
    type: String,
  },
  city: {
    type: String,
  },
  continent: {
    type: String,
  },
  continentCode: {
    type: String,
  },
  country: {
    type: String,
  },
  countryCode: {
    type: String,
  },
  isp: {
    type: String,
  },
  lat: {
    type: Number,
  },
  lon: {
    type: Number,
  },
  mobile: {
    type: Boolean,
  },
  org: {
    type: String,
  },
  proxy: {
    type: Boolean,
  },
  query: {
    type: String,
  },
  region: {
    type: String,
  },
  regionName: {
    type: String,
  },
  status: {
    type: String,
  },
  timezone: {
    type: String,
  },
  zip: {
    type: String,
  },
},                                          { timestamps: { createdAt: 'created_at' } });

ConnectionSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });
ConnectionSchema.plugin(mongoosePaginateV2);
ConnectionSchema.plugin(autoIncrement, { inc_field: 'connectionId' });

// tslint:disable-next-line:variable-name
export const Connection: Model<IConnection> = model<IConnection>('Connection', ConnectionSchema);
