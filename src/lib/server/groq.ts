import "@/lib/server/env";
import Groq from "groq-sdk";

export function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY não definida em .env.local");
  return new Groq({ apiKey });
}
