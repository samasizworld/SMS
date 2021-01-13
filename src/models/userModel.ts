import { DataTypes } from 'sequelize';
export class User {
  public UserModel(sequelize) {
    return sequelize.define(
      'user',
      {
        userid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        guid: {
          type: DataTypes.UUID,
        },
        username: {
          type: DataTypes.STRING,
        },
        password: {
          type: DataTypes.STRING,
        },
        userrole: {
          type: DataTypes.ENUM,
          values: ['admin', 'user'],
          defaultValue: 'user',
        },
        datecreated: { type: DataTypes.DATE },
        datemodified: {
          type: DataTypes.DATE,
        },
        datedeleted: {
          type: DataTypes.DATE,
        },
      },
      {
        timestamps: false,
        tableName: 'users',
      }
    );
  }
}
