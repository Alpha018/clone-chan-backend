import { NextFunction, Request, RequestHandler, Response } from 'express';
import { expressHandleAsync } from '@reignmodule/utils';
import { Utils } from '../../../utils/utils';
import { errors } from '../../../utils/errors';
import { Connection } from '../../model/connection';

export class UserMidleware {
  public static getIpInformation(): RequestHandler {
    return expressHandleAsync(
      async (req: Request, res: Response, next: NextFunction) => {
        const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;

        if (!ip) {
          return next(new errors.UNAUTHORIZED({ message: 'Verification IP Fail' }));
        }

        try {
          const information = (await Utils.getIpInformation(ip)).data;

          if (information.status === 'fail') {
            return next(new errors.UNAUTHORIZED({ message: 'Verification IP Fail' }));
          }

          const ipInformation = new Connection(information);
          await ipInformation.save();
          res.locals.session = ipInformation;
          next();
        } catch (e) {
          return next(new errors.UNAUTHORIZED({ message: 'Verification IP Fail' }));
        }
      },
      undefined,
    );
  }
}

export const checkIpInformation = UserMidleware.getIpInformation();
