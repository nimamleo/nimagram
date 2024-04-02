export class PaginationHelper {
  private readonly page: number = 1;
  private readonly pageSize: number = 10;

  constructor(page: any, pageSize: any) {
    const pageNum = Number(page);
    if (!isNaN(pageNum) && pageNum > 0) {
      this.page = pageNum;
    }
    const pageSizeNum = Number(pageSize);
    if (!isNaN(pageSizeNum) && pageSizeNum > 1 && pageSizeNum <= 100) {
      this.pageSize = pageSizeNum;
    }
  }

  getPage(): number {
    return this.page;
  }

  getPageSize(): number {
    return this.pageSize;
  }

  getLimit(): number {
    return this.pageSize;
  }

  getSkip(): number {
    return (this.page - 1) * this.pageSize;
  }
}
