// Define the interface for the document strategies
class DocumentStrategy {
  async getPage(pageNumber: number) : Promise<string> {
    throw new Error('Not implemented');
  };
  get pageCount() : number {
    throw new Error('Not implemented');
  };
}
