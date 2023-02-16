// Define the document context class
class DocumentContext {
    strategy: DocumentStrategy;
  constructor(strategy : DocumentStrategy) {
    this.strategy = strategy;
  }

  async getPage(pageNumber: number) : Promise<string> {
    return await this.strategy.getPage(pageNumber);
  }

  get pageCount() : number {
    return this.strategy.pageCount;
  }
}
