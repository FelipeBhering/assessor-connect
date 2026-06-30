import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getGroq } from "@/lib/server/groq";

export const transcribeAudio = createServerFn({ method: "POST" })
  .validator(
    z.object({
      audioBase64: z.string().min(1),
      mimeType: z.string().default("audio/webm"),
      filename: z.string().default("recording.webm"),
    }),
  )
  .handler(async ({ data }) => {
    const groq = getGroq();

    // Converter base64 → File compatível com a API do Groq
    const binaryStr = atob(data.audioBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: data.mimeType });
    const file = new File([blob], data.filename, { type: data.mimeType });

    const response = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3",
      language: "pt",
      response_format: "text",
    });

    return { transcript: typeof response === "string" ? response : (response as { text: string }).text };
  });
