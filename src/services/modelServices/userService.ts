import { User } from '../../models/userModel';
import { Repository } from '../../repo/Repository';
import { GenericService } from '../GenericService';
import * as log from '../../utils/logger';

export class UserService<T> extends GenericService<T> {
  constructor(sequelize) {
    const user = new User().UserModel(sequelize);
    super(new Repository(user));
  }
  async getUserDetails(username) {
    try {
      const user = await this.loadResultByAny({
        datedeleted: null,
        username: username,
      });
      return user;
    } catch (err) {
      log.error(
        'Error while getting userinfo by username in userservice',
        '/getuserinfo',
        err,
        null
      );
      return err;
    }
  }
}
