import handler from "./libs/handler-lib";
import OpenAILib from "./libs/openai-lib";
import {APIGatewayProxyWithCognitoAuthorizerEvent} from "aws-lambda";
import {ISummaryFormPayload} from "../types/summaraizeTypes";

export const onGenerateSummary = handler(async (event: APIGatewayProxyWithCognitoAuthorizerEvent) => {
    const userId = event.requestContext.authorizer.claims.sub;

    try {
        const payload: ISummaryFormPayload = JSON.parse(event.body as string);
        console.log("payload", payload);

        const response = await OpenAILib().summarize(payload);
        return {
            statusCode: 200,
            userId,
            body: response
        };
    } catch (e) {
        console.log("Error parsing summaryform payload", e);
        return {
            statusCode: 400,
            body: {error: "Error parsing summary form payload"}
        }
    }
});
