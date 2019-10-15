import { UploadedFile } from 'express-fileupload';
import * as aws from 'aws-sdk';
import config from '../../../config';
import path from 'path';
import logger, { buildPrefix } from '@reignmodule/utils/utils/logger';
import { Utils } from '../../../utils/utils';
import { File, IFile } from '../../model/file';
import { errors } from '../../../utils/errors';
import * as fs from 'fs';

const logParentPrefix = path.basename(__filename, '.js');

export class SpaceManager {
  public static async uploadFile(file: UploadedFile, board: String) {
    const logPrefix = buildPrefix(logParentPrefix, this.uploadFile.name);

    const existFile = await File.findOne({ md5: file.md5 });

    if (existFile) {
      logger.error(`${logPrefix} Error file exist in DB`);
      throw new errors.EXIST_FILE();
    }

    const fileName = Utils.generateRandomFileName(file);

    try {
      logger.info(`${logPrefix} Upload file to Space or S3`);
      const spacesEndpoint = new aws.Endpoint(config.s3.endpint);
      const s3 = new aws.S3({
        // @ts-ignore
        endpoint: spacesEndpoint,
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secretKey,
      });

      const fileType = Utils.extractType(file);
      let dimension: string = '';
      if (fileType === 'video') {
        logger.info(`${logPrefix} Get video resolution`);
        dimension = await Utils.getVideoResolution(file.tempFilePath);
      }

      if (fileType === 'image') {
        logger.info(`${logPrefix} Get image resolution`);
        dimension = await Utils.getImagenResolution(file.tempFilePath);
      }

      const params = {
        Body: fs.readFileSync(file.tempFilePath),
        Bucket: `${config.s3.bucket}/${board}/${fileType}`,
        Key: fileName,
      };

      return new Promise((resolve, reject) => {
        s3.putObject(params, (err: any, data: any) => {
          if (err) {
            logger.info(`${logPrefix} Error in S3 or Space: ${err}`);
            return reject({ message: err.code });
          }

          logger.info(`${logPrefix} Upload File Success`);
          logger.info(`${logPrefix} Creating object to save in mongodb`);

          const uploadFile: IFile = new File({
            dimension,
            nameFile: `${fileName}`,
            nameFileOriginal: file.name,
            type: fileType,
            eTag: data.ETag.replace(/"/g, ''),
            key: `${board}/${fileType}/${fileName}`,
            md5: file.md5,
            mimeType: file.mimetype,
            size: Utils.bytesToSize(file.size),
          });

          return resolve(uploadFile.save());
        });
      });
    } catch (e) {
      logger.error(`${logPrefix} Error in amazon push file to S3: ${e.message}`);
      throw e;
    }
  }

  public static async getFile(key: string) {
    const logPrefix = buildPrefix(logParentPrefix, this.getFile.name);
    logger.info(`${logPrefix} Getting image from Amazon S3 service`);

    try {
      const spacesEndpoint = new aws.Endpoint(config.s3.endpint);
      const s3 = new aws.S3({
        // @ts-ignore
        endpoint: spacesEndpoint,
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secretKey,
      });

      const options = {
        Bucket: config.s3.bucket,
        Key: key,
      };
      await s3.headObject(options).promise();
      return s3.getObject(options).createReadStream();
    } catch (e) {
      if (e.code === 'NotFound') {
        logger.error(`${logPrefix} Error in amazon get file (NOT FOUND) from S3`);
        throw e;
      }
      logger.error(`${logPrefix} Error in amazon get file from S3: ${e.message}`);
      throw e;
    }
  }
}
