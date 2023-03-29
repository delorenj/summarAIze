import { AxiosError } from "axios";
import {
  Configuration,
  CreateChatCompletionRequest,
  CreateCompletionRequest,
  OpenAIApi,
} from "openai";
import {
  IChapterText,
  ISummarizeOptions,
  ISummarizeResult,
  ISummaryFormPayload,
  IUser,
} from "../../types/summaraizeTypes";
import { stripNewlinesAndCollapseSpaces } from "./book-lib";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export interface OpenAILibParams {
  user?: IUser;
  mock?: boolean;
}

const descriptionPrompt =
  "With a complexity of {complexity} of 1.0 and a depth of {depth} of 1.0, give me a description of the summary defined by those parameters when those parameters are defined as meaning complexity determines the level of education needed to understand the summary and depth is the amount of detail given in the summary. Write the description as it would appear above the summary it is describing and make it at most 3 sentences.";
const OpenAILib = (params: OpenAILibParams) => {
  const { user } = params;
  const mock = params.mock || false;

  const defaultOptions: ISummarizeOptions = {
    model: "gpt-4",
    temperature: 0.5,
    prompt: "",
    max_tokens: 60,
    top_p: 1.0,
    frequency_penalty: 0.8,
    presence_penalty: 0.0,
  };

  const getSummarizeOptionsByPayload = (
    payload: ISummaryFormPayload
  ): ISummarizeOptions => {
    return defaultOptions;
  };

  const composePromptByOptions = (
    chapterText: IChapterText,
    options: ISummarizeOptions
  ): string => {
    console.log("About to compose prompt by options: ", options, chapterText);
    return "Summarize the following text: " + chapterText.text;
  };

  const generateDescriptionByPayload = async (
    payload: ISummaryFormPayload
  ): Promise<string> => {
    if (mock) {
      console.log("About to MOCK generate description by payload: ", payload);
      return (
        "This is a mock description of the summary defined by the payload: " +
        JSON.stringify(payload)
      );
    }
    return "This is a simple summary of the chapter";
  };

  const countTokens = (text: string) => {
    return text.split(/\s+/).length;
  };

  const splitText = async (chapterText: string, maxTokens = 4000) => {
    const chunks = [];
    let currentChunk = "";

    const words = chapterText.split(/\s+/);
    for (const word of words) {
      if (countTokens(currentChunk + " " + word) <= maxTokens) {
        currentChunk += " " + word;
      } else {
        chunks.push({ role: "user", content: currentChunk.trim() });
        currentChunk = word;
      }
    }

    if (currentChunk) {
      chunks.push({ role: "user", content: currentChunk.trim() });
    }

    return chunks;
  };

  const combineSummaryParts = (summaryParts: string[]) => {
    return summaryParts.join(" ").trim();
  };

  const summarizeChapter = async (
    chapterText: IChapterText,
    options: ISummarizeOptions
  ): Promise<ISummarizeResult> => {
    if (!user) throw new Error("No user provided to summarizeChapter");
    if (mock) {
      console.log("About to MOCK summarize a chapter: ", chapterText);
      const result: IChapterText = {
        text: "This is a mock summary of the chapter: " + chapterText.text,
        chapter: chapterText.chapter,
      };
      return {
        summarizationId: "mock",
        userId: user.userId,
        bookId: "mock",
        options,
        summary: result,
        createdAt: new Date().toISOString(),
      };
    }
    console.log("options", options);
    //const prompt = composePromptByOptions(chapterText, options);
    const summaryParts = [];
    const textChunks = await splitText(chapterText.text);
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const messages = [
        {
          role: "system",
          content: `You are college professor of literature that summarizes the following text for your students. This is part ${i} of ${
            textChunks.length - 1
          }:`,
        },
        chunk as any,
      ];
      console.log("messages", messages);
      const summary = await openai.createChatCompletion({
        model: options.model,
        messages,
      });

      console.log("summary", summary);
      if (
        !summary.data.choices ||
        summary.data.choices.length === 0 ||
        !summary.data.choices[0].message
      ) {
        throw new Error("No summary returned from OpenAI API");
      }
      summaryParts.push(summary.data.choices[0].message.content);
    }
    const result: IChapterText = {
      text: combineSummaryParts(summaryParts),
      chapter: chapterText.chapter,
    };

    console.log("result", result);
    return {
      summarizationId: "todo",
      userId: user.userId,
      bookId: "todo",
      options,
      summary: result,
      createdAt: new Date().toISOString(),
    };
  };

  const summarize = async (
    payload: ISummaryFormPayload,
    chapterTexts: IChapterText[]
  ): Promise<ISummarizeResult[]> => {
    console.log("About to summarize payload: ", payload);
    const options = getSummarizeOptionsByPayload(payload);
    const summarizations: ISummarizeResult[] = [];
    for (const chapterText of chapterTexts) {
      const summary: ISummarizeResult = await summarizeChapter(
        chapterText,
        options
      );
      summarizations.push(summary);
    }
    return summarizations;
  };

  const askGPTToFindAuthor = async (text: string): Promise<string> => {
    const prompt =
      "find the author of the following text. Respond with only the author's name or 'Unknown'";
    return askGPT(prompt, text);
  };

  const askGPTToFindTitle = async (text: string): Promise<string> => {
    const prompt =
      "find the title of the following document using only this first page of text. Respond with only the title or 'Unknown'";
    return askGPT(prompt, text);
  };

  const askGPT = async (prompt: string, content: string): Promise<string> => {
    const options = {
      model: defaultOptions.model,
      prompt: '"' + prompt + ': "\n"' + content + '"',
      max_tokens: 20,
      temperature: 0,
      top_p: defaultOptions.top_p,
      frequency_penalty: defaultOptions.frequency_penalty,
      presence_penalty: defaultOptions.presence_penalty,
      timeout: 30,
    };

    console.log("options", options);
    try {
      const result = await openai.createCompletion(options);
      console.log("result", result);
      console.log("result", result.data.choices[0].text as string);
      return stripNewlinesAndCollapseSpaces(
        result.data.choices[0].text as string
      );
    } catch (e) {
      console.log("Error asking GPT to find title", e);
      return "Unknown";
    }
  };

  return {
    summarize,
    generateDescriptionByPayload,
    askGPTToFindAuthor,
    askGPTToFindTitle,
  };
};

export default OpenAILib;
