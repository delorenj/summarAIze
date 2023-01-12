const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

module.exports.summarizeChunk = async (event) => {
  const userId = event.requestContext.identity.cognitoIdentityId;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "",
    temperature: 0.5,
    max_tokens: 60,
    top_p: 1.0,
    frequency_penalty: 0.8,
    presence_penalty: 0.0,
  });

  return {
    statusCode: 200,
    userId,
    body: JSON.stringify(response.data.choices[0])
  };
};
