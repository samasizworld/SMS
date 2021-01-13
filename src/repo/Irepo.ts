export interface Irepo<T> {
  loadAll(modelName, orderBy, pageSize, pageNummber): Promise<T[]>;
  loadOnebyGUID(guid, modelName): Promise<T>;
  loadByUUID(guid): Promise<T>;
  update(data, whereClause): Promise<T>;
  delete(guid): Promise<T>;
  insert(data): Promise<T>;
  loadResultByAny(whereClause): Promise<T>;
  executeQuery(queryString, QueryTypes): Promise<T[]>;
}
