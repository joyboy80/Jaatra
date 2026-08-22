import { apiRequest } from "./api.js";

export const suggestedQuestions = [
  "What buses are available?",
  "Show my scheduled trips",
  "Do I have a reservation?",
  "Where is my bus?",
  "Show my tickets",
];

export async function getAIContext() {
  return (await apiRequest("/ai/context")).context;
}

export async function askSafarAI(question, conversation = []) {
  return (await apiRequest("/ai/chat", { method: "POST", body: { question, conversation } })).response;
}
