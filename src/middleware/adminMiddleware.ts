import { connection } from '../common/connection';
import { UserService } from '../services/modelServices/userService';
export const admin = async (req, res, next) => {
  try {
    const sequelize = await connection();
    const userService = new UserService(sequelize);
    const user = await userService.getUserDetails(req.loginUserInfo.username);
    if (user.userrole === 'admin') {
      next();
    } else {
      res.json({ error: 'No admin ,No authorized' });
    }
  } catch (err) {
    return err;
  }
};
