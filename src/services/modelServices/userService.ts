import { User } from '../../models/userModel';
import { Repository } from '../../repo/Repository';
import { GenericService } from '../GenericService';
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
      return err;
    }
  }
}
