import { Irepo } from '../repo/Irepo';
export class GenericService<T> {
  private repository: Irepo<T>; // repository obj i.e.(obj of method) can be used in inherited class
  constructor(repository: Irepo<T>) {
    this.repository = repository;
  }

  async executeRawQuery(queryString, queryTypes) {
    try {
      return await this.repository.executeQuery(queryString, queryTypes);
    } catch (err) {
      return err;
    }
  }
  async insert(data) {
    try {
      return await this.repository.insert(data);
    } catch (err) {
      return err;
    }
  }
  async update(data, where) {
    try {
      return await this.repository.update(data, where);
    } catch (err) {
      return err;
    }
  }
  async delete(guid) {
    try {
      return await this.repository.delete(guid);
    } catch (err) {
      return err;
    }
  }
  async loadOne(guid, model) {
    try {
      return await this.repository.loadOnebyGUID(guid, model);
    } catch (err) {
      return err;
    }
  }

  async loadAll(model, order, ps, pn) {
    try {
      return await this.repository.loadAll(model, order, ps, pn);
    } catch (err) {
      return err;
    }
  }
  async loadByUUID(guid) {
    try {
      return await this.repository.loadByUUID(guid);
    } catch (err) {
      return err;
    }
  }
  async loadResultByAny(where) {
    try {
      return await this.repository.loadResultByAny(where);
    } catch (err) {
      return err;
    }
  }
}
