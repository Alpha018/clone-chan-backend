import { UploadedFile } from 'express-fileupload';
import mongoose from 'mongoose';
import axios from 'axios';
import path from 'path';
import uniqid from 'uniqid';
import config from '../config';
import expressBrute from 'express-brute';
import { IComment } from '../apps/model/comment';
import { errors } from './errors';
// @ts-ignore
import getVideoDimensions from 'get-video-dimensions';
import imageSize from 'image-size';
const mongooseStore = require('express-brute-mongoose');
const bruteForceSchema = require('express-brute-mongoose/dist/schema');


export class Utils {
  public static countType(list: IComment[], type: string) {
    let count = 0;
    list.forEach((data: IComment) => {
      if (data.file) {
        // @ts-ignore
        if (data.file.type === type) {
          count = count + 1;
        }
      }
    });
    return count;
  }

  public static bytesToSize(bytes: number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))), 10);
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  }

  public static generateRandomFileName(file: UploadedFile) {
    return `${this.generateUid()}${this.extractFormatFile(file)}`;
  }

  public static extractFormatFile(file: UploadedFile) {
    return path.extname(file.name);
  }

  public static generateUid() {
    return uniqid(`${config.appName}-`);
  }

  public static extractType(file: UploadedFile) {
    return file.mimetype.split('/')[0];
  }

  public static verifyExtension(file: UploadedFile) {
    const extension = this.extractFormatFile(file).toLocaleLowerCase();
    return extension === '.jpg' ||
      extension === '.jpeg' ||
      extension === '.gif' ||
      extension === '.png' ||
      extension === '.swf' ||
      extension === '.webm' ||
      extension === '.ogg' ||
      extension === '.pdf' ||
      extension === '.mp3' ||
      extension === '.mp4';
  }

  public static removeMeta(object: any, params: String[]) {
    for (const prop in object) {
      if (params.indexOf(prop) > -1) {
        delete object[prop];
      } else if (typeof object[prop] === 'object') {
        this.removeMeta(object[prop], params);
      }
    }
    return object;
  }

  public static getStoreBruteForce() {
    if (config.env === 'development') {
      return new expressBrute.MemoryStore();
    }
    const model = mongoose.model(
      'bruteforce',
      new mongoose.Schema(bruteForceSchema),
    );
    return new mongooseStore(model);
  }

  public static getIpInformation(ip: string | string[]) {
    return axios.get(`${config.api.ipInformationBaseUrl}/${ip}`, {
      params: {
        fields: config.api.returnedInformationCode,
      },
    });
  }

  public static async getVideoResolution(path: string) {
    try {
      const dimensions = await getVideoDimensions(path);
      return `${dimensions.width}X${dimensions.height}`;
    } catch (e) {
      throw errors.FILE_ERROR();
    }
  }

  public static async getImagenResolution(path: string) {
    try {
      // @ts-ignore
      const dimensions = imageSize(path);
      return `${dimensions.width}X${dimensions.height}`;
    } catch (e) {
      console.log(e);
      throw errors.FILE_ERROR();
    }
  }
}
