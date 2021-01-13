import { GenericService } from '../GenericService';
import { UserLoginInfo } from '../../models/userLoginInfoModel';
import { Repository } from '../../repo/Repository';
const dateTime = require('node-datetime');
export class UserLoginInfoService<T> extends GenericService<T> {
  constructor(sequelize) {
    const userLoginInfo = new UserLoginInfo().UserLoginInfoModel(sequelize);
    super(new Repository(userLoginInfo));
  }

  async insertUserLoginInfoDetails(data) {
    try {
      const userLoginDetails = await this.insert(data);
      return userLoginDetails;
    } catch (err) {
      return err;
    }
  }

  async getLoginInfoDetailsById(guid) {
    try {
      const userLoginDetail = await this.loadResultByAny({
        datedeleted: null,
        loggedoutdatetime: null,
        guid: guid,
      });
      return userLoginDetail;
    } catch (err) {
      return err;
    }
  }
  async getLoginInfoUserDetails(username) {
    try {
      const userLoginDetail = await this.loadResultByAny({
        datedeleted: null,
        loggedoutdatetime: null,
        username: username,
      });
      return userLoginDetail;
    } catch (err) {
      return err;
    }
  }

  async updateAuthKeyValidity(userLoginInfo) {
    var loggedinDateTime = dateTime.create();

    try {
      const loginInfo = await this.update(
        { loggedindatetime: loggedinDateTime.format('Y-m-d H:M:S') },
        {
          guid: userLoginInfo.guid,
          loggedoutdatetime: userLoginInfo.loggedoutdatetime,
          datedeleted: null,
        }
      );

      return loginInfo;
    } catch (error) {
      return error;
    }
  }
  async logout(userLoginInfo) {
    try {
      const loginInfoAfterUpdate = await this.update(
        { loggedoutdatetime: dateTime.create().format('Y-m-d H:M:S') },
        {
          guid: userLoginInfo.guid,
          loggedoutdatetime: null,
          datedeleted: null,
        }
      );

      return loginInfoAfterUpdate;
    } catch (error) {
      return error;
    }
  }
}
