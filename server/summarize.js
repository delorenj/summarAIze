import handler from "./libs/handler-lib";
import OpenAILib from "./libs/openai-lib";

export const onGenerateSummary = handler(async (event, context) => {
  const userId = event.requestContext.identity.cognitoIdentityId;

  const response = await OpenAILib().summarize(event.body);

  return {
    statusCode: 200,
    userId,
    body: JSON.stringify(response)
  };
});
