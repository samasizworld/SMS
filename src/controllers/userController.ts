import { connection } from '../common/connection';
import { UserService } from '../services/modelServices/userService';
import { HashPassword } from '../utils/helper';
//import { generateToken } from '../utils/generateToken';
const dateTime = require('node-datetime');
import { UserLoginInfoService } from '../services/modelServices/userlogininfoService';

export const loginUser = async (req, res) => {
  // const { username, password } = req.body;
  // const encryptedCredential = generateToken(username, password);
  // console.log(encryptedCredential);
  // res.setHeader('Authorization', `Basic ${encryptedCredential}`);
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
              res.json({ message: 'Login Successful', tokenid: result.guid });
            }
            // } else {
            //   res.json({ message: 'Already log in' });
            // }
          } else {
            res.json({ message: 'Invalid Credentials' });
          }
        } catch (err) {
          throw err;
        }
      } else {
        return;
      }
    } catch (err) {
      throw err;
    }
  } else {
    res.json({ error: 'No Authorized user' });
  }
};

export const logout = async (req, res) => {
  try {
    const sequelize = await connection();
    const userloginInfoService = new UserLoginInfoService(sequelize);
    const updatedResult = userloginInfoService.logout(req.loginUserInfo);
    if (updatedResult) {
      res.json({ message: 'Logout Sucessfully' });
    }
  } catch (err) {
    return err;
  }
};
