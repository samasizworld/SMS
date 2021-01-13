import { DataTypes } from 'sequelize';

export class Students {
  public studentModel(sequelize) {
    return sequelize.define(
      'student',
      {
        studentid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        guid: {
          type: DataTypes.UUID,
        },
        firstname: {
          type: DataTypes.STRING,
        },
        lastname: {
          type: DataTypes.STRING,
        },
        address: {
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
