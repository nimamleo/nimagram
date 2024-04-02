export interface IPaginatedResult<T> {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
}
