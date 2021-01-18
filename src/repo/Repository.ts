import { Irepo } from './Irepo';
import * as log from '../utils/logger';

export class Repository<T> implements Irepo<T> {
  private dbsequelize: any;
  constructor(sequelize) {
    this.dbsequelize = sequelize;
  }
  //useful for update and deletion
  async loadByUUID(uuid): Promise<T> {
    try {
      const result = await this.dbsequelize.findOne({
        where: { datedeleted: null, guid: uuid },
      });
      return result;
    } catch (err) {
      log.error(err.message, '/loadByUUId at repo', err.stack, null);
      return err;
    }
  }

  async executeQuery(queryString, queryTypes): Promise<T[]> {
    try {
      const results = await this.dbsequelize.query(queryString, queryTypes);
      return results;
    } catch (err) {
      log.error(
        JSON.stringify(err.message),
        '/executeQuery at repo',
        JSON.stringify(err.stack),
        null
      );
      return err;
    }
  }

  async loadResultByAny(whereClause): Promise<T> {
    try {
      const result = await this.dbsequelize.findOne({ where: whereClause });
      return result;
    } catch (err) {
      log.error(err.message, '/loadResultbyAny at repo', err.stack, null);
      return err;
    }
  }

  //insert data
  async insert(data): Promise<T> {
    try {
      const result = await this.dbsequelize.create(data);
      return result;
    } catch (err) {
      log.error(
        JSON.stringify(err.message),
        '/insert at repo',
        JSON.stringify(err.stack),
        null
      );
      return err;
    }
  }

  //update
  async update(data, whereClause): Promise<T> {
    try {
      await this.dbsequelize.update(data, {
        where: whereClause,
      });
      const result = await this.loadResultByAny(whereClause);
      return result;
    } catch (err) {
      log.error(err.message, '/update at repo', err.stack, null);
      return err;
    }
  }

  //deletion
  async delete(guid): Promise<T> {
    try {
      const data = { datedeleted: new Date() };
      return await this.dbsequelize.update(data, {
        where: { datedeleted: null, guid: guid },
      });
    } catch (err) {
      log.error(err.message, '/delete at repo', err.stack, null);
      return err;
    }
  }
  // loadAll data with eager loading
  async loadAll(modelName, orderBy, pageNumber, pageSize): Promise<T[]> {
    if (pageNumber && pageSize) {
      try {
        const results = await this.dbsequelize.findAll({
          where: { datedeleted: null },
          order: orderBy,
          include: [
            {
              model: modelName,
              through: {
                attributes: ['datedeleted'],
                where: { datedeleted: null },
              },
            },
          ],
          limit: pageSize,
          offset: (pageNumber - 1) * pageSize,
        });
        return results;
      } catch (err) {
        log.error(err.message, '/loadAll at repo', err.stack, null);
        return err;
      }
    } else {
      try {
        const results = await this.dbsequelize.findAll({
          where: { datedeleted: null },
          order: orderBy,
          include: [
            {
              model: modelName,
              through: {
                attributes: ['datedeleted'],
                where: { datedeleted: null },
              },
            },
          ],
        });
        return results;
      } catch (err) {
        log.error(
          err.message,
          '/loadAll at repo',
          JSON.stringify(err.stack),
          null
        );
        return err;
      }
    }
  }

  async loadOnebyGUID(guid, modelName): Promise<T> {
    try {
      const result = await this.dbsequelize.findOne({
        where: { datedeleted: null, guid: guid },
        include: [
          {
            model: modelName,
            through: {
              attributes: ['datedeleted'],
              where: { datedeleted: null },
            },
          },
        ],
      });
      return result;
    } catch (err) {
      log.error(err.message, '/loadOneByGuid at repo', err.stack, null);
      return err;
    }
  }
}
