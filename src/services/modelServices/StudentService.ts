import { GenericService } from '../GenericService';
import { Repository } from '../../repo/Repository';
import { MergeModel } from '../../models/modelAssociation';
import { QueryTypes } from 'sequelize';
export class StudentService<T> extends GenericService<T> {
  protected sequelize: any;
  private Subject: any;
  constructor(sequelize) {
    // imported for eager loading
    const { stu, sub } = new MergeModel(sequelize);
    super(new Repository(stu)); // we can use all method from parent class
    this.sequelize = sequelize;
    this.Subject = sub;
  }

  async executeQuery(guid) {
    try {
      const students = await this.sequelize.query(
        `SELECT * from getstudentbyuuid('${guid}')`,
        {
          type: QueryTypes.SELECT,
        }
      );
      return students;
    } catch (err) {
      return err;
    }
  }
  async getAllStudents(pN, pS) {
    const students = await this.loadAll(
      this.Subject,
      [['firstname', 'ASC']],
      pN,
      pS
    );
    return students;
  }

  async getOneStudentbyId(guid) {
    try {
      const student = await this.loadOne(guid, this.Subject);
      return student;
    } catch (err) {
      return err;
    }
  }

  async insertStudent(data) {
    const info = await this.insert(data);
    return info;
  }
  async getStudentDetails(firstname) {
    const where = { datedeleted: null, firstname: firstname };
    const info = await this.loadResultByAny(where);
    return info;
  }
  async updateStudent(data, guid) {
    const where = { datedeleted: null, guid: guid };
    const info = await this.update(data, where);
    return info;
  }

  async deleteStudent(guid) {
    return await this.delete(guid);
  }
}
