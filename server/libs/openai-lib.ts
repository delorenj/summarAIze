import {Configuration, CreateCompletionRequest, OpenAIApi} from 'openai';
import {IChapterText, ISummarizeOptions, ISummarizeResult, ISummaryFormPayload, IUser } from "../../types/summaraizeTypes";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

export interface OpenAILibParams {
  user: IUser;
}

const descriptionPrompt = "With a complexity of {complexity} of 1.0 and a depth of {depth} of 1.0, give me a description of the summary defined by those parameters when those parameters are defined as meaning complexity determines the level of education needed to understand the summary and depth is the amount of detail given in the summary. Write the description as it would appear above the summary it is describing and make it at most 3 sentences."
const OpenAILib = (params: OpenAILibParams) => {
  const { user } = params;
  const defaultOptions : ISummarizeOptions = {
      model: "text-davinci-003",
      temperature: 0.5,
      prompt: "",
      max_tokens: 60,
      top_p: 1.0,
      frequency_penalty: 0.8,
      presence_penalty: 0.0,
  }

  const getSummarizeOptionsByPayload = (payload: ISummaryFormPayload) : ISummarizeOptions => {
    return defaultOptions
  }

  const composePromptByOptions = (chapterText: IChapterText, options: ISummarizeOptions) : string => {
    console.log("About to compose prompt by options: ", options, chapterText);
    return "Summarize the following text: " + chapterText.text;
  }

  const generateDescriptionByPayload = async (payload: ISummaryFormPayload) : Promise<string> => {
    console.log("About to generate description by payload: ", payload);
    const options = getSummarizeOptionsByPayload(payload);
    const subDescriptionPrompt = descriptionPrompt.replace("{complexity}", payload.complexity.toString()).replace("{depth}", payload.depth.toString());
    console.log("description prompt", subDescriptionPrompt);
    const request: CreateCompletionRequest = {
        model: options.model,
        prompt: subDescriptionPrompt,
        max_tokens: options.max_tokens,
        temperature: options.temperature,
        top_p: options.top_p,
        frequency_penalty: options.frequency_penalty,
        presence_penalty: options.presence_penalty
    }
    console.log("request", request);
    const description = await openai.createCompletion(request);

    console.log("description", description);

    if(!description.data.choices ||
        description.data.choices.length === 0 ||
        !description.data.choices[0].text) {
        throw new Error("No description returned from OpenAI API");
    }
    return description.data.choices[0].text;
  }

  const summarizeChapter = async (chapterText: IChapterText, options: ISummarizeOptions) : Promise<ISummarizeResult> => {
    console.log("About to summarize chapter: ", chapterText);
    console.log("options", options);
    const prompt = composePromptByOptions(chapterText, options);

    const summary = await openai.createCompletion({
        model: options.model,
        prompt,
        max_tokens: options.max_tokens,
        temperature: options.temperature,
        top_p: options.top_p,
        frequency_penalty: options.frequency_penalty,
        presence_penalty: options.presence_penalty
    });

    console.log("summary", summary);

    if(!summary.data.choices ||
        summary.data.choices.length === 0 ||
        !summary.data.choices[0].text) {
        throw new Error("No summary returned from OpenAI API");
    }
    const result: IChapterText = {
        text: summary.data.choices[0].text,
        chapter: chapterText.chapter,
    }

    return {
        summarizationId: "mock",
        userId: user.userId,
        bookId: "mock",
        options,
        summary: result,
        createdAt: new Date().toISOString(),
    }
  }

  const summarize = async (payload:ISummaryFormPayload, chapterTexts: IChapterText[]) : Promise<ISummarizeResult[]> => {
    console.log("About to summarize payload: ", payload);
    const options = getSummarizeOptionsByPayload(payload);
    console.log("options", options);
    const summarizations : ISummarizeResult[] = [];
    for(const chapterText of chapterTexts) {
        const summary : ISummarizeResult = await summarizeChapter(chapterText, options);
        summarizations.push(summary);
    }
    return summarizations;
  };

  return {
    summarize, generateDescriptionByPayload
  };
};

export default OpenAILib;
