import { BaseRouter } from '../../../utils/base-router';
import { CommentController } from '../controller/commet-controller';

export class CommentRoutes extends BaseRouter {

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
    this._router.put('/comment', CommentController.createNewComment);
    this._router.get('/comment', CommentController.getComments);
  }
}
