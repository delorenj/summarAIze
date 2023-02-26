import { getLinkGoogle, getLinkGoodreads } from "./libs/CoverFinder/bookcover";

import Axios from "axios";
import Url from "url";
export const BOOKCOVER_NOT_FOUND = "Bookcover was not found.";
export const INVALID_ISBN = "Invalid ISBN (please use ISBN-13).";
export const METHOD_NOT_SUPPORTED = "Method not suported yet.";
type BookcoverResponse = {
  status: string;
  url: string;
  bookTitle?: string;
  authorName?: string;
  isbn?: string;
};

export interface BookCoverRequest {
  bookTitle?: string;
  authorName?: string;
}

export const getBookCoverByBookCoverRequest = async (req: BookCoverRequest) => {
  const bookTitle = req.bookTitle;
  const authorName = req.authorName;
  const googleQuery = `${bookTitle} ${authorName} site:goodreads.com/book/show`;
  const googleResponse = await Axios.get(
    `https://www.google.com/search?q=${googleQuery}&sourceid=chrome&ie=UTF-8`
  );

  const goodreadsLink = getLinkGoogle(googleResponse.data);
  if (!goodreadsLink) {
    console.log("Bookcover not found");
    throw new Error(BOOKCOVER_NOT_FOUND);
  }

  const goodreadsResponse = await Axios.get(goodreadsLink);
  const link = getLinkGoodreads(goodreadsResponse.data);
  console.log("link", link);
  return link;
};

export const getBookCoverFromISBN = async (isbn: string) => {
  isbn = isbn.replace(/-/g, "");
  if (isbn.length !== 13) {
    throw new Error(INVALID_ISBN);
  }

  const response = await Axios.get(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.googleBooksApiKey}`
  );
  if (!response.data.totalItems) {
    return [];
  }

  return response.data.items[0].volumeInfo.imageLinks.thumbnail;
};
