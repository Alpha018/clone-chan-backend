import { ThreadController } from '../controller/thread-controller';
import { BaseRouter } from '../../../utils/base-router';

export class ThreadRoutes extends BaseRouter {

  public static path = '/api';

  configRoute() {
    /**
     * @swagger
     * /api/user:
     *   get:
     *     tags:
     *       - user
     *       - core
     *     summary: get all users
     *     produces:
     *       - application/json
     *     consumes:
     *       - application/json
     *     parameters:
     *     responses:
     *       200:
     *         description: return access token
     *         schema:
     *           $ref: '#/definitions/User'
     *       403:
     *         description: unauthorized
     *         schema:
     *           $ref: '#/definitions/Error'
     *     security:
     *       - Bearer: []
     */
    this._router.put('/thread', ThreadController.createNewThread);

    this._router.get('/thread', ThreadController.getThreads);

    this._router.get('/thread/latest', ThreadController.getLatestThreads);

    this._router.get('/thread/file', ThreadController.getReferenceFromImage);
  }
}
