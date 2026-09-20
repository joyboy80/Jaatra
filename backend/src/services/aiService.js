import { listBuses, listReservations, listTickets, listTracking, listTrips } from "./transportService.js";
import AppError from "../utils/AppError.js";
import { GoogleGenAI } from "@google/genai";

function cleanQuestion(value) {
  const question = String(value || "").trim();
  if (!question) throw new AppError(400, "Ask a transport question.", "AI_QUESTION_REQUIRED");
  if (question.length > 600) throw new AppError(400, "Questions must be 600 characters or fewer.", "AI_QUESTION_TOO_LONG");
  return question;
}

export async function getAuthorizedAiContext(user) {
  const [buses, trips, reservations, tickets, tracking] = await Promise.all([
    listBuses(user), listTrips(user), listReservations(user.profileId), listTickets(user), listTracking(user),
  ]);
  return { buses, trips, reservations, tickets, tracking };
}

export async function answerTransportQuestion(user, rawQuestion, conversation = []) {
  const question = cleanQuestion(rawQuestion);
  const context = await getAuthorizedAiContext(user);
  
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError(500, "Gemini API key is not configured.", "AI_NOT_CONFIGURED");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemInstruction = `You are Safar AI, a helpful and concise transportation assistant.
You prioritize answering questions about bus routes, schedules, availability, live tracking, reservations, and university transportation.
Here is the real-time authorized transport data for the user:
${JSON.stringify(context, null, 2)}
Answer based on this context. Give concise answers when simple, but be detailed when necessary.
Gracefully handle questions you cannot answer. Never expose raw API responses or keys.
`;

  const history = Array.isArray(conversation) 
    ? conversation.filter(msg => msg.id !== "welcome").map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(msg.text || "") }]
      })) 
    : [];

  let response;
  let attempts = 0;
  let lastError;

  while (attempts < 3) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: question }] }
        ],
        config: { systemInstruction }
      });
      
      return { question, answer: response.text, generatedAt: new Date().toISOString() };
    } catch (error) {
      lastError = error;
      attempts++;
      
      const isNetworkError = error.code === 'ECONNRESET' || error.cause?.code === 'ECONNRESET' || error.message?.includes('fetch failed');
      
      if (attempts >= 3 || !isNetworkError) {
        break; // Stop retrying if max attempts reached or it's not a network error
      }
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.error("Gemini API Error after retries:", lastError);
  const msg = lastError?.message || "Sorry, I couldn't process your request right now. Please try again.";
  throw new AppError(500, msg, "AI_SERVICE_ERROR");
}

