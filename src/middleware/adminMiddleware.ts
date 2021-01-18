import { connection } from '../common/connection';
import { UserService } from '../services/modelServices/userService';
import * as log from '../utils/logger';
export const admin = async (req, res, next) => {
  try {
    const sequelize = await connection();
    const userService = new UserService(sequelize);
    const user = await userService.getUserDetails(req.loginUserInfo.username);
    if (user.userrole === 'admin') {
      next();
    } else {
      log.error('Not an Admin', '/admin', null, user.userid);
      return res.json({ error: 'No admin ,No authorized' });
    }
  } catch (err) {
    log.error(err.message, '/admin', err.stack, null);
  }
};
