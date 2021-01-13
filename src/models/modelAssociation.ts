import { Students } from './studentModel';
import { Subjects } from './subjectModel';
import { StudentSubject } from './stusubModel';

export class MergeModel {
  public stu;
  public sub;
  public stusub;
  public sequelize;
  constructor(sequelize) {
    const stu: any = new Students().studentModel(sequelize);
    const sub: any = new Subjects().SubjectModel(sequelize);
    const stusub: any = new StudentSubject().StudentSubjectModel(sequelize);
    this.stu = stu;
    this.sub = sub;
    this.stusub = stusub;
    this.sequelize = sequelize;
    this.stu.belongsToMany(this.sub, {
      through: this.stusub,
      foreignKey: 'studentid',
    });
    this.sub.belongsToMany(this.stu, {
      through: this.stusub,
      foreignKey: 'subjectid',
    });
  }
}
