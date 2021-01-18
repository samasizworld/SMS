import { LogInfo } from '../../models/loginfoModel';
import { Repository } from '../../repo/Repository';
import { GenericService } from '../GenericService';
export class LogInfoService<T> extends GenericService<T> {
  protected sequelize: any;
  constructor(sequelize) {
    const loginfo = new LogInfo().LogInfoModel(sequelize);
    super(new Repository(loginfo));
    this.sequelize = sequelize;
  }

  async insertloginfo(createClause) {
    try {
      const loginfo = await this.insert(createClause);
      return loginfo;
    } catch (error) {
      return error;
    }
  }
}
