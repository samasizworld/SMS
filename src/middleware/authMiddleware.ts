import { connection } from '../common/connection';
import { UserLoginInfoService } from '../services/modelServices/userlogininfoService';
import { isGuid, calculateTotalSeconds } from '../utils/helper';
import moment from 'moment';

export const auth = async (req, res, next) => {
  var authentication: string = req.get('Authorization');
  var authExpireTime = 1;
  authentication = authentication.replace('"', '').replace('"', '');
  var authString = authentication.split('=')[0];
  var authKey = authentication.split('=')[1];

  if (isGuid(authKey)) {
    if (authString == 'TOKEN') {
      try {
        const sequelize = await connection();
        const userlogininfoService = new UserLoginInfoService(sequelize);
        const userlogininfo = await userlogininfoService.getLoginInfoDetailsById(
          authKey
        );

        if (userlogininfo && userlogininfo.guid) {
          const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
          // const dateTimeExpiry = moment(userlogininfo.loggedindatetime)
          //   .add(authExpireTime, 'minutes')
          //   .format('YYYY-MM-DD HH:mm:ss');

          const dateofDB: any = moment(userlogininfo.loggedindatetime).format(
            'YYYY-MM-DD HH:mm:ss'
          );
          // if (dateTimeExpiry > currentTime) {
          //   console.log('Valid');
          // } else {
          //   console.log('Invalid');
          // }
          const secOfcurrentTime = calculateTotalSeconds(currentTime);
          const secOfloggedindatetime = calculateTotalSeconds(dateofDB);
          const diff = secOfcurrentTime - secOfloggedindatetime;
          if (diff >= 120 * 60) {
            res.json({ message: 'Token expires' });
            return;
          } else {
            const updatedUserLoginInfo = await userlogininfoService.updateAuthKeyValidity(
              userlogininfo
            );

            req.loginUserInfo = updatedUserLoginInfo;
            next();
          }
        } else {
          res.json({ message: 'Token may be already expired' });
        }
      } catch (err) {
        throw err;
      }
    } else {
      res.json({ message: 'Invalid Auth String' });
    }
  } else {
    res.json({ err: 'Not authorized' });
  }
};
