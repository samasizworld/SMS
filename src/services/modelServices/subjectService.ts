import { GenericService } from '../GenericService';
import { Repository } from '../../repo/Repository';
import { MergeModel } from '../../models/modelAssociation';
export class SubjectService<T> extends GenericService<T> {
  protected sequelize;
  private Student;
  constructor(s) {
    const { stu, sub } = new MergeModel(s);
    super(new Repository(sub));
    this.sequelize = s;
    this.Student = stu;
  }

  async insertSubject(data) {
    try {
      const info = await this.insert(data);
      return info;
    } catch (err) {
      return err;
    }
  }
  async updateSubject(data, guid) {
    try {
      const where = { datedeleted: null, guid: guid };
      const info = await this.update(data, where);
      return info;
    } catch (err) {
      return err;
    }
  }
  async getSubjectById(guid) {
    try {
      const info = await this.loadOne(guid, this.Student);
      return info;
    } catch (err) {
      return err;
    }
  }

  async getAllSubjects() {
    try {
      return await this.loadAll(
        this.Student,
        [['subjectname', 'ASC']],
        null,
        null
      );
    } catch (err) {
      return err;
    }
  }

  async deleteSubject(guid) {
    try {
      const info = await this.delete(guid);
      return info;
    } catch (err) {
      return err;
    }
  }

  async getSubjectDetails(subjectname) {
    try {
      const subjects = await this.loadResultByAny({
        datedeleted: null,
        subjectname: subjectname,
      });
      return subjects;
    } catch (err) {
      return err;
    }
  }
}
