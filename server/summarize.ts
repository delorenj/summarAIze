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
        return JSON.stringify({
            statusCode: 200,
            body: response
        });
    } catch (e) {
        console.log("Error parsing summaryform payload", e);
        return JSON.stringify({
            statusCode: 400,
            body: {error: "Error parsing summary form payload"}
        })
    }
});
