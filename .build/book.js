"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUpload = exports.parseBookMetadata = exports.writeMetadataToDB = void 0;
var AWS = require("aws-sdk");
var handler_lib_1 = require("./libs/handler-lib");
var file_type_1 = require("file-type");
var epub2_1 = require("epub2");
var fork_pdf_parse_with_pagepertext_1 = require("fork-pdf-parse-with-pagepertext");
var dynamoDb = new AWS.DynamoDB.DocumentClient();
var fs = require("fs").promises;
var s3 = new AWS.S3();
var getDirName = require('path').dirname;
// a function to write the files to tmp on the lambda
var writeBookToTemp = function (book) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("writing cached books to /tmp", "/tmp/" + book.url, book.fileContents);
                return [4 /*yield*/, fs.mkdir("/tmp/" + getDirName(book.url), { recursive: true })];
            case 1:
                _a.sent();
                return [4 /*yield*/, fs.writeFile("/tmp/" + book.url, book.fileContents)];
            case 2:
                _a.sent();
                console.log("Book written to /tmp");
                return [2 /*return*/];
        }
    });
}); };
// a function to read the cached files from tmp
// async function readFileFromTemp(url) {
//     const file = await fs.readFile(`/tmp/${url}`);
//     console.log("readFileFromTemp", url, file);
//     return {
//         url: url,
//         fileContents: file,
//     };
// }
// a function to pull the files from an s3 bucket before caching them locally
function readFileFromS3Bucket(url) {
    return __awaiter(this, void 0, void 0, function () {
        var object, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('readFileFromS3Bucket', url);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, s3
                            .getObject({
                            Key: url,
                            Bucket: 'summaraize-book'
                        })
                            .promise()];
                case 2:
                    object = _a.sent();
                    console.log("Got object!");
                    console.log("Returning: ", object);
                    return [2 /*return*/, {
                            url: url,
                            fileContents: object.Body,
                            id: object.ETag
                        }];
                case 3:
                    err_1 = _a.sent();
                    console.log("Problem getting S3 object:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var getBookFromFileSystemOrS3 = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var book, metadata;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, readFileFromS3Bucket(url)];
            case 1:
                book = _a.sent();
                return [4 /*yield*/, getBookMetadata(book)];
            case 2:
                metadata = _a.sent();
                return [4 /*yield*/, writeBookToTemp(book)];
            case 3:
                _a.sent();
                return [2 /*return*/, {
                        url: url,
                        fileContents: book.fileContents,
                        metadata: metadata,
                        id: book.id
                    }];
        }
    });
}); };
var isEpub = function (fileType) {
    return fileType && fileType.mime === "application/epub+zip";
};
var isPdf = function (fileType) {
    return fileType && fileType.mime === "application/pdf";
};
var numberOfWords = function (text) {
    return text.split(" ").length;
};
// This method is called by the client to get the book metadata
var getEpubMetadata = function (book) { return __awaiter(void 0, void 0, void 0, function () {
    var epub, title, chapters;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, epub2_1.EPub.createAsync(book.fileContents)];
            case 1:
                epub = _a.sent();
                title = epub.metadata.title;
                chapters = [];
                epub.flow.forEach(function (chapter) {
                    epub.getChapterRaw(chapter.id, function (err, text) {
                        if (err) {
                            console.log("Error getting chapter", err);
                        }
                        else {
                            chapter.numberOfWords = numberOfWords(text);
                        }
                        chapters.push({
                            id: chapter.id,
                            title: chapter.title,
                            numWords: numberOfWords(text),
                            firstFewWords: text.split(" ").slice(0, 50).join(" ")
                        });
                    });
                });
                return [2 /*return*/, { title: title, chapters: chapters }];
        }
    });
}); };
var findChapterBreaks = function (doc) {
    var numPages = doc.textPerPage.length;
    console.log("Number of pages", numPages);
    var chapterBreaks = [];
    for (var i = 0; i < numPages; i++) {
        var page = doc.textPerPage[i];
        var lines = page.text.match(/[^\r\n]+/g);
        var chapterCount = 0;
        // Loop through the lines on the page and look for "Chapter" keyword
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            var line = lines[lineIndex];
            if (line.toLowerCase().includes('chapter')) {
                chapterCount += 1;
                chapterBreaks.push({
                    page: i,
                    chapter: chapterCount,
                    firstFewWords: lines.slice(lineIndex, lineIndex + 3).join(" ")
                });
                break;
            }
        }
    }
    return chapterBreaks;
};
var getPdfMetadata = function (book) { return __awaiter(void 0, void 0, void 0, function () {
    var doc, title, chapters, info, metadata;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, fork_pdf_parse_with_pagepertext_1.default)(book.fileContents)];
            case 1:
                doc = _a.sent();
                title = doc.info.Title || getTitleFromUrl(book.url) || "Untitled";
                chapters = findChapterBreaks(doc);
                info = doc.info;
                metadata = doc.metadata;
                console.log("PDF metadata", { title: title, chapters: chapters, info: info, metadata: metadata });
                console.log("chapters", chapters);
                return [2 /*return*/, {
                        title: title,
                        chapters: chapters,
                    }];
        }
    });
}); };
var getTitleFromUrl = function (url) {
    return url.split("/").pop().split(".")[0];
};
var getKeyFromUrl = function (url) {
    return url.split("/").pop();
};
var getGenericMetadata = function (book) {
    return {
        title: getTitleFromUrl(book.url),
        chapters: [{
                id: 1,
                title: 'main',
                numWords: numberOfWords(book.fileContents)
            }]
    };
};
//This method is called by the client to get the book metadata
var getBookMetadata = function (book) { return __awaiter(void 0, void 0, void 0, function () {
    var fileType, metadata;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, file_type_1.fileTypeFromBuffer)(book.fileContents)];
            case 1:
                fileType = _a.sent();
                metadata = {};
                if (!isEpub(fileType)) return [3 /*break*/, 3];
                return [4 /*yield*/, getEpubMetadata(book)];
            case 2:
                metadata = _a.sent();
                return [3 /*break*/, 6];
            case 3:
                if (!isPdf(fileType)) return [3 /*break*/, 5];
                return [4 /*yield*/, getPdfMetadata(book)];
            case 4:
                metadata = _a.sent();
                return [3 /*break*/, 6];
            case 5:
                //Generic metadata for other file types
                metadata = getGenericMetadata(book);
                _a.label = 6;
            case 6:
                console.log("Got book metadata", {
                    fileType: fileType,
                    title: metadata.title,
                    chapters: metadata.chapters
                });
                console.log("chapters", JSON.stringify(metadata.chapters));
                return [2 /*return*/, {
                        fileType: fileType,
                        title: metadata.title,
                        chapters: metadata.chapters
                    }];
        }
    });
}); };
var writeMetadataToDB = function (userId, book) { return __awaiter(void 0, void 0, void 0, function () {
    var params, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                params = {
                    TableName: process.env.booksTableName,
                    Item: {
                        // The attributes of the item to be created
                        userId: userId,
                        bookId: book.id,
                        format: book.metadata.fileType.ext,
                        title: book.metadata.title,
                        chapters: book.metadata.chapters,
                        key: getKeyFromUrl(book.url),
                        sizeInBytes: book.fileContents.length,
                        createdAt: Date.now(), // Current Unix timestamp
                    },
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                console.log("Writing to DB", params);
                return [4 /*yield*/, dynamoDb.put(params).promise()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                console.log("Problem writing to DB:", err_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.writeMetadataToDB = writeMetadataToDB;
//This method is called by the client to get the book metadata
exports.parseBookMetadata = (0, handler_lib_1.default)(function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, body, bookUrl, book;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = event.requestContext.authorizer.claims.sub;
                body = JSON.parse(event.body);
                bookUrl = body.bookUrl;
                return [4 /*yield*/, getBookFromFileSystemOrS3(bookUrl)];
            case 1:
                book = _a.sent();
                return [4 /*yield*/, (0, exports.writeMetadataToDB)(userId, book)];
            case 2:
                _a.sent();
                return [2 /*return*/, {
                        statusCode: 200,
                        book: book
                    }];
        }
    });
}); });
exports.onUpload = (0, handler_lib_1.default)(function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var object, key, userId, book;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                object = event.Records[0].s3.object;
                key = object.key;
                userId = key.split("/")[0];
                console.log("onUpload things", userId, key);
                return [4 /*yield*/, getBookFromFileSystemOrS3(key)];
            case 1:
                book = _a.sent();
                console.log("got book", book);
                return [4 /*yield*/, (0, exports.writeMetadataToDB)(userId, book)];
            case 2:
                _a.sent();
                return [2 /*return*/, {
                        statusCode: 200,
                        book: book
                    }];
        }
    });
}); });
//# sourceMappingURL=book.js.map