import { connection } from '../common/connection';
import { UserService } from '../services/modelServices/userService';
import { HashPassword } from '../utils/helper';
//import { generateToken } from '../utils/generateToken';
const dateTime = require('node-datetime');
import { UserLoginInfoService } from '../services/modelServices/userlogininfoService';
import * as log from '../utils/logger';

export const loginUser = async (req, res) => {
  // const { username, password } = req.body;
  // const encryptedCredential = generateToken(username, password);
  // console.log(encryptedCredential);
  // req.setHeader('Authorization', `Basic ${encryptedCredential}`);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Basic')
  ) {
    const token = req.headers.authorization.split(' ')[1];

    const decryptedkey = Buffer.from(token, 'base64');
    const credentialString = decryptedkey.toString('ascii');
    const uname = credentialString.split(':')[0];

    const pwd = credentialString.split(':')[1];

    try {
      const sequelize = await connection();
      const userService = new UserService(sequelize);
      const user = await userService.getUserDetails(uname);
      const { password, userid } = user;
      if (user) {
        try {
          const userlogininfoService = new UserLoginInfoService(sequelize);
          const encrytedPassword = HashPassword(10, pwd);

          if (password == encrytedPassword) {
            const loginDate = dateTime.create().format('Y-m-d H:M:S');
            // const userlogininfoExists = await userlogininfoService.getLoginInfoUserDetails(
            //   username
            // );
            // if (!userlogininfoExists) {
            const result = await userlogininfoService.insertUserLoginInfoDetails(
              {
                username: uname,
                loggedindatetime: loginDate,
                userid,
              }
            );
            if (result) {
              log.info('LoginSuccessful', '/login', null, result.userid);
              res.json({ message: 'Login Successful', tokenid: result.guid });
            }
            // } else {
            //   res.json({ message: 'Already log in' });
            // }
          } else {
            log.error('Invalid Credentials', '/login', null, user.userid);
            res.json({ message: 'Invalid Credentials' });
          }
        } catch (err) {
          log.error(err.message, '/login', err.stack, null);
          throw err;
        }
      } else {
        return;
      }
    } catch (err) {
      log.error(err.message, '/login', err.stack, null);
      throw err;
    }
  } else {
    log.error('No Authorized', '/login', null, null);
    res.json({ error: 'No Authorized user' });
  }
};

export const logout = async (req, res) => {
  try {
    const sequelize = await connection();
    const userloginInfoService = new UserLoginInfoService(sequelize);
    const updatedResult = userloginInfoService.logout(req.loginUserInfo);
    if (updatedResult) {
      log.info('LogoutSuccessfully', '/logout', null, req.loginUserInfo.userid);
      res.json({ message: 'Logout Sucessfully' });
    }
  } catch (err) {
    log.error(err.message, '/logout', err.stack, null);
    return err;
  }
};
