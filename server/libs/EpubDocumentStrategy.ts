// Define the PDF document strategy class

class EpubDocumentStrategy extends DocumentStrategy {
    epub: any;

    constructor(epub: any) {
        super();
        this.epub = epub;
    };

    async getPage(pageNumber:number) : Promise<string> {
        return await this.epub.getPage(pageNumber);
    };

    get pageCount() : number {
        return this.epub.numPages;
    }
}
