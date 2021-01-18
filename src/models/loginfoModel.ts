import { DataTypes } from 'sequelize';
export class LogInfo {
  public LogInfoModel(sequelize) {
    return sequelize.define(
      'loginfo',
      {
        loginfoid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        guid: {
          type: DataTypes.UUID,
        },
        processname: {
          type: DataTypes.STRING,
        },
        description: {
          type: DataTypes.TEXT,
        },
        message: { type: DataTypes.STRING },
        additionaldetails: { type: DataTypes.TEXT },
        severity: {
          type: DataTypes.CHAR,
        },
        userid: { type: DataTypes.INTEGER },
        datecreated: { type: DataTypes.DATE },
        datemodified: {
          type: DataTypes.DATE,
        },
        datedeleted: {
          type: DataTypes.DATE,
        },
      },
      { timestamps: false, tableName: 'loginfos' }
    );
  }
}
