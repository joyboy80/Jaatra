import { answerTransportQuestion, getAuthorizedAiContext } from "../services/aiService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const aiContext = asyncHandler(async (req, res) => sendSuccess(res, { data: { context: await getAuthorizedAiContext(req.user) } }));
export const askAi = asyncHandler(async (req, res) => sendSuccess(res, { data: { response: await answerTransportQuestion(req.user, req.body?.question, req.body?.conversation) } }));
