import { DataTypes } from 'sequelize';

export class Subjects {
  public SubjectModel(sequelize) {
    return sequelize.define(
      'subject',
      {
        subjectid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        guid: {
          type: DataTypes.UUID,
        },
        subjectname: {
          type: DataTypes.STRING,
        },
        subjectcode: {
          type: DataTypes.STRING,
        },

        datecreated: { type: DataTypes.DATE },
        datemodified: {
          type: DataTypes.DATE,
        },
        datedeleted: {
          type: DataTypes.DATE,
        },
      },
      { timestamps: false }
    );
  }
}
