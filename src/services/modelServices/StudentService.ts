import { GenericService } from '../GenericService';
import { Repository } from '../../repo/Repository';
import { MergeModel } from '../../models/modelAssociation';
import { QueryTypes } from 'sequelize';
import * as log from '../../utils/logger';

export class StudentService<T> extends GenericService<T> {
  protected sequelize: any;
  private Subject: any;
  constructor(sequelize:any) {
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
      log.error(
        'Error while executing query in studentservice',
        '/executeQuery',
        err,
        null
      );
      return err;
    }
  }
  async getAllStudents(pN, pS) {
    try {
      const students = await this.loadAll(
        this.Subject,
        [['firstname', 'ASC']],
        pN,
        pS
      );
      return students;
    } catch (err) {
      log.error(
        'Error while executing getallstudents in studentservice',
        '/getallstudents',
        err,
        null
      );
      return err;
    }
  }

  async getOneStudentbyId(guid) {
    try {
      const student = await this.loadOne(guid, this.Subject);
      return student;
    } catch (err) {
      log.error(
        'Error while executing getstudentbyid in studentservice',
        '/getstudentbyid',
        err,
        null
      );
      return err;
    }
  }

  async insertStudent(data) {
    try {
      const info = await this.insert(data);
      return info;
    } catch (err) {
      log.error(
        'Error while inserting in studentservice',
        '/insertStudent',
        err,
        null
      );
      return err;
    }
  }
  async getStudentDetails(firstname) {
    try {
      const where = { datedeleted: null, firstname: firstname };
      const info = await this.loadResultByAny(where);
      return info;
    } catch (err) {
      log.error(
        'Error while getting studentdetails in studentservice',
        '/insertStudent',
        err,
        null
      );
      return err;
    }
  }
  async updateStudent(data, guid) {
    try {
      const where = { datedeleted: null, guid: guid };
      const info = await this.update(data, where);
      return info;
    } catch (err) {
      log.error(
        'Error while updatestudent in studentservice',
        '/updatestudents',
        err,
        null
      );
      return err;
    }
  }

  async deleteStudent(guid) {
    try {
      return await this.delete(guid);
    } catch (err) {
      log.error(
        'Error while deletestudent in studentservice',
        '/deleteStudent',
        err,
        null
      );
      return err;
    }
  }
}
