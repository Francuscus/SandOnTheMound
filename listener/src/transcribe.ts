import Replicate from "replicate";
import fs from "fs";
import { config } from "./config";

const replicate = new Replicate({
  auth: config.replicate.apiToken,
});

/**
 * Sends a .wav audio file to Whisper (via Replicate) and gets back text.
 *
 * Whisper is an AI made by OpenAI that converts speech to text.
 * It's very good at understanding sports commentary, names, and numbers.
 *
 * Cost: roughly $0.01-0.02 per 30-second chunk
 */
export async function transcribeAudio(filePath: string): Promise<string> {
  console.log(`[Whisper] Transcribing: ${filePath}`);

  const audioData = fs.readFileSync(filePath);
  const base64Audio = audioData.toString("base64");
  const dataUri = `data:audio/wav;base64,${base64Audio}`;

  try {
    const output = await replicate.run(
      "openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c65c7c18e397c4c750bd07",
      {
        input: {
          audio: dataUri,
          model: "large-v3",
          language: "en",
          translate: false,
          temperature: 0,
          transcription: "plain text",
          suppress_tokens: "-1",
          logprob_threshold: -1.0,
          no_speech_threshold: 0.6,
          condition_on_previous_text: true,
          compression_ratio_threshold: 2.4,
        },
      }
    );

    // Replicate returns an object with a "transcription" field
    const result = output as { transcription?: string } | string;
    let text = "";

    if (typeof result === "string") {
      text = result;
    } else if (result && typeof result === "object" && "transcription" in result) {
      text = result.transcription || "";
    }

    if (text) {
      console.log(`[Whisper] Got text: "${text.substring(0, 100)}..."`);
    } else {
      console.log("[Whisper] No speech detected in this chunk");
    }

    return text;
  } catch (error) {
    console.error("[Whisper] Transcription failed:", error);
    return "";
  }
}
