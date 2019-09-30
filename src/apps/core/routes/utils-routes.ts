import { BaseRouter } from '../../../utils/base-router';
import { UtilsController } from '../controller/utils-controller';

export class UtilsRoutes extends BaseRouter {

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
    this._router.get('/file/:board?/:type?/:fileName?', UtilsController.getFile);

    this._router.get('/statistics', UtilsController.getStatistics);

    this._router.get('/randomimages', UtilsController.getRandomImage);

    this._router.get('/icons/:key', UtilsController.getIcon);
  }
}
