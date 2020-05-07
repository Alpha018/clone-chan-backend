import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from '@reignmodule/utils';

import config from './config';
import { errors } from './utils/errors';
import mongoose from 'mongoose';

import { HealthRoutes } from './apps/health/routes';
import { ThreadRoutes } from './apps/core/routes/thread-routes';
import { SwaggerRoutes } from './apps/docs/routes';
import { buildPrefix } from '@reignmodule/utils/utils/logger';
import expressFileupload from 'express-fileupload';
import pusher from 'pusher';
import path from 'path';
import { UtilsController } from './apps/core/controller/utils-controller';
import { UtilsRoutes } from './apps/core/routes/utils-routes';
import { CommentRoutes } from './apps/core/routes/commet-routes';
import { BoardRoutes } from './apps/core/routes/board-routes';
import { checkIpInformation } from './apps/core/midleware/midleware-request';

const logParentPrefix = path.basename(__filename, '.ts');

// Create Express server
class Server {
  public app: express.Application;

  constructor() {
    this.app = express();

    this.config();
    this.swaggerSetup();
    this.routes();
    this.errorSetup();
    this.mongooseConfig();
  }

  public static bootstrap(): Server {
    return new Server();
  }

  config() {
    // Express configuration
    this.app.use(bodyParser.urlencoded(
      {
        limit: '50mb',
        extended: true,
      },
    ));
    this.app.use(checkIpInformation);
    this.app.use(bodyParser.json(
      {
        limit: '50mb',
        inflate: true,
      },
    ));
    this.app.use(expressFileupload({
      useTempFiles: true,
      tempFileDir: '/tmp/',
      limits: { fileSize: 50 * 1024 * 1024 },
      abortOnLimit: true,
      limitHandler: UtilsController.tooLarge,
    }));

    // Allow Cross-Origin Resource Sharing and basic security
    this.app.use(cors({
      origin: [
        'https://ucnchan.org',
        'https://www.ucnchan.org',
        'https://qa.ucnchan.org',
        'https://www.qa.ucnchan.org',
      ],
    }));
    this.app.use(helmet());
  }

  private swaggerSetup() {

  }

  private static handleFatalError(err: any): void {
    logger.error(`'[fatal error]' ${err && err.message}`);
    logger.error(`'[fatal error]' ${err && err.stack}`);
    process.exit(1);
  }

  private errorSetup(): void {
    process.on('uncaughtException', Server.handleFatalError);
    process.on('unhandledRejection', Server.handleFatalError);

    this.app.use((err: any, req: express.Request, res: express.Response,
                  next: express.NextFunction) => {
      if (err.name === 'UnauthorizedError') {
        logger.error(err);
        next(new errors.UNAUTHORIZED({}));
      } else {
        next(err);
      }
    });

    this.app.use((err: any, req: express.Request, res: express.Response,
                  next: express.NextFunction) => {
      let responseError = err;

      if (!(responseError instanceof errors.BaseError)) {
        logger.error(err.stack);
        responseError = new errors.UNEXPECTED_ERROR({});

        /* istanbul ignore next */
        if (['development', 'test'].indexOf(config.env) >= 0) {
          responseError = new errors.UNEXPECTED_ERROR(err.toString());
        }
      }

      const errorMsg = [`${responseError.status}`, `${responseError.description}`,
        `${req.originalUrl}`, `${req.method}`, `${req.ip}`];
      logger.error(errorMsg.join(' - '));

      return res.status(responseError.status).json(responseError);
    });
  }

  routes() {
    /**
     * Primary app routes.
     */
    this.app.use(SwaggerRoutes.path, new SwaggerRoutes().router);
    this.app.use(HealthRoutes.path, new HealthRoutes().router);
    this.app.use(ThreadRoutes.path, new ThreadRoutes().router);
    this.app.use(CommentRoutes.path, new CommentRoutes().router);
    this.app.use(BoardRoutes.path, new BoardRoutes().router);
    this.app.use(UtilsRoutes.path, new UtilsRoutes().router);
  }

  async mongooseConfig() {
    const logPrefix = buildPrefix(logParentPrefix, this.mongooseConfig.name);
    logger.info(`${logPrefix} Init connection to mongoDB`);
    try {
      const options = {
        sslCA: config.mongo.cert,
        useUnifiedTopology: true,
      };
      if (config.mongo.uri) {
        await mongoose.connect(config.mongo.uri, options);
      }
      logger.info(`${logPrefix} Connecting to mongoDB Success!`);
      this.configPusher();
    } catch (e) {
      console.log(e);
      logger.error(`${logPrefix} Error in connection to mongoDB`);
    }
  }

  configPusher() {
    const push = new pusher({
      appId: '844330',
      key: '2010b69467c64da7918e',
      secret: 'd6b464b8119c8b352583',
      cluster: 'us2',
      useTLS: true,
    });

    const channelComment = 'comment';
    const channelThread = 'thread';
    const channelBoard = 'board';

    const db = mongoose.connection;
    db.once('open', () => {

      const commentCollection = db.collection('comment');
      const threadCollection = db.collection('thread');
      const boardCollection = db.collection('board');

      const changeStreamComment = commentCollection.watch();
      const changeStreamThread = threadCollection.watch();
      const changeStreamBoard = boardCollection.watch();

      changeStreamComment.on('change', (change) => {

      });

      changeStreamThread.on('change', (change) => {

      });

      changeStreamBoard.on('change', (change) => {

      });
    });
  }
}

export default new Server().app;
