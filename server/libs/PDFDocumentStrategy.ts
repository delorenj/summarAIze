// Define the PDF document strategy class

class PDFDocumentStrategy extends DocumentStrategy {
    pdf: any;

    constructor(pdf: any) {
        super();
        this.pdf = pdf;
    };

    async getPage(pageNumber:number) : Promise<string> {
        return await this.pdf.getPage(pageNumber);
    };

    get pageCount() : number {
        return this.pdf.numPages;
    }
}
