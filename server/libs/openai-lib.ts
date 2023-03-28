import { AxiosError } from "axios";
import { Configuration, CreateCompletionRequest, OpenAIApi } from "openai";
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
    model: "gpt-4-32k",
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
    console.log("About to generate description by payload: ", payload);
    const options = getSummarizeOptionsByPayload(payload);
    const subDescriptionPrompt = descriptionPrompt
      .replace("{complexity}", payload.complexity.toString())
      .replace("{depth}", payload.depth.toString());
    console.log("description prompt", subDescriptionPrompt);
    const request: CreateCompletionRequest = {
      model: options.model,
      prompt: subDescriptionPrompt,
      max_tokens: options.max_tokens,
      temperature: options.temperature,
      top_p: options.top_p,
      frequency_penalty: options.frequency_penalty,
      presence_penalty: options.presence_penalty,
    };
    console.log("request", request);
    const description = await openai.createCompletion(request);

    console.log("description", description);

    if (
      !description.data.choices ||
      description.data.choices.length === 0 ||
      !description.data.choices[0].text
    ) {
      throw new Error("No description returned from OpenAI API");
    }
    return description.data.choices[0].text;
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
    const prompt = composePromptByOptions(chapterText, options);

    try {
      const summary = await openai.createCompletion({
        model: options.model,
        prompt,
        max_tokens: options.max_tokens,
        temperature: options.temperature,
        top_p: options.top_p,
        frequency_penalty: options.frequency_penalty,
        presence_penalty: options.presence_penalty,
      });

      console.log("summary", summary);
      if (
        !summary.data.choices ||
        summary.data.choices.length === 0 ||
        !summary.data.choices[0].text
      ) {
        throw new Error("No summary returned from OpenAI API");
      }
      const result: IChapterText = {
        text: summary.data.choices[0].text,
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
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        const axiosError = error as AxiosError;
        console.error("Error:", axiosError.response?.data.error);
      } else {
        console.error("Unknown error:", error);
      }
    }
    throw new Error("Unable to summarize chapter");
  };

  const summarize = async (
    payload: ISummaryFormPayload,
    chapterTexts: IChapterText[]
  ): Promise<ISummarizeResult[]> => {
    console.log("About to summarize payload: ", payload);
    const options = getSummarizeOptionsByPayload(payload);
    console.log("options", options);
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
