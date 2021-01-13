import { Sequelize } from 'sequelize';
import { config } from '../appConfig';

const sequelize = new Sequelize(
  config.databaseName,
  config.dbUserName,
  config.databasePassword,
  {
    dialect: 'postgres',
    host: 'localhost',
  }
);

export const connection = async () => {
  await sequelize.authenticate();
  console.log('Database Connection OK');
  return sequelize;
};
