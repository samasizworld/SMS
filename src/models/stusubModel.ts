import { DataTypes } from 'sequelize';
export class StudentSubject {
  public StudentSubjectModel(sequelize) {
    return sequelize.define(
      'studentsubject',
      {
        studentsubjectid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        guid: {
          type: DataTypes.UUID,
        },

        datecreated: { type: DataTypes.DATE },
        datemodified: {
          type: DataTypes.DATE,
        },
        datedeleted: {
          type: DataTypes.DATE,
        },
        marks: {
          type: DataTypes.FLOAT,
        },
      },
      { timestamps: false }
    );
  }
}
