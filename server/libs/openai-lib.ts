// const {Configuration, OpenAIApi} = require("openai");

import { ISummaryFormPayload } from "../../types/summaraizeTypes";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY
// });

//const openai = new OpenAIApi(configuration);

const OpenAILib = (defaultValues = {}) => {
  const summarize = async (input:ISummaryFormPayload) => {
    console.log("About to summarize", input);

    // const response = await openai.createCompletion({
    //   model: "text-davinci-003",
    //   prompt: "",
    //   temperature: 0.5,
    //   max_tokens: 60,
    //   top_p: 1.0,
    //   frequency_penalty: 0.8,
    //   presence_penalty: 0.0,
    // });

    return "This is a mock summary for the input: " + input;
  };

  return {
    summarize
  };
};

export default OpenAILib;
