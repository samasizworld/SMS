import { GenericService } from '../GenericService';
import { Repository } from '../../repo/Repository';
import { QueryTypes } from 'sequelize';
export class StudentSubjectService<T> extends GenericService<T> {
  constructor(sequelize) {
    super(new Repository(sequelize));
  }

  async linkStudentSubject(guid, subjectLists) {
    try {
      const result = await this.executeRawQuery(
        `select * from stusub('${guid}','${subjectLists}') as message;`,
        { type: QueryTypes.SELECT }
      );
      return result;
    } catch (err) {
      return err;
    }
  }
}
