import { IPaginatedResult } from './pagination.model';
import { ILimitationOptions } from './limitation.interface';

export class PaginatedResult<T> implements IPaginatedResult<T> {
  constructor(queryResult: T[], total: number, limitation: ILimitationOptions) {
    this.list = queryResult;
    this.total = total;
    this.page = limitation.skip / limitation.limit + 1;
    this.pageSize = limitation.limit;
  }

  list: T[];
  page: number;
  pageSize: number;
  total: number;
}
