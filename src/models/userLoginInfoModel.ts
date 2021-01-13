import { DataTypes } from 'sequelize';
export class UserLoginInfo {
  public UserLoginInfoModel(sequelize) {
    return sequelize.define(
      'userlogininfo',
      {
        userlogininfoid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        guid: {
          type: DataTypes.UUID,
        },
        loggedindatetime: {
          type: DataTypes.DATE,
        },
        loggedoutdatetime: {
          type: DataTypes.DATE,
        },
        datecreated: {
          type: DataTypes.DATE,
        },
        datemodified: {
          type: DataTypes.DATE,
        },
        datedeleted: {
          type: DataTypes.DATE,
        },
        username: {
          type: DataTypes.STRING,
        },
        userid: {
          type: DataTypes.INTEGER,
        },
      },
      {
        tableName: 'userlogininfos',
        timestamps: false,
      }
    );
  }
}
