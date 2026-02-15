import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import { config } from "./config";

/**
 * Transcribes audio using whisper.cpp running locally on your PC.
 *
 * whisper.cpp is a free, open-source version of OpenAI's Whisper.
 * It runs entirely on your computer - no internet, no API keys, $0 cost.
 *
 * First run downloads a ~400MB model file. After that, it works offline.
 * A 30-second chunk takes about 5-15 seconds to transcribe depending on your PC.
 */
export async function transcribeAudio(filePath: string): Promise<string> {
  console.log(`[Whisper] Transcribing: ${filePath}`);

  const whisperPath = config.whisper.executablePath;

  if (!fs.existsSync(whisperPath)) {
    console.error(`[Whisper] Cannot find whisper.cpp at: ${whisperPath}`);
    console.error(
      `[Whisper] Make sure you downloaded whisper.cpp and set WHISPER_EXECUTABLE_PATH in .env`
    );
    return "";
  }

  const modelPath = config.whisper.modelPath;

  if (!fs.existsSync(modelPath)) {
    console.error(`[Whisper] Cannot find model at: ${modelPath}`);
    console.error(
      `[Whisper] Download it by running: download-model.bat (see SETUP.md)`
    );
    return "";
  }

  try {
    const text = await runWhisper(whisperPath, modelPath, filePath);

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

function runWhisper(
  whisperPath: string,
  modelPath: string,
  audioPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // whisper.cpp command-line arguments:
    //   -m <model>   : path to the .bin model file
    //   -f <file>    : audio file to transcribe
    //   -l en        : language = English
    //   -nt          : no timestamps (just give us the text)
    //   --no-prints  : suppress progress output
    const args = [
      "-m", modelPath,
      "-f", audioPath,
      "-l", "en",
      "-nt",
      "--no-prints",
    ];

    execFile(whisperPath, args, { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        // If whisper just found no speech, that's fine
        if (stderr && stderr.includes("no speech")) {
          resolve("");
          return;
        }
        reject(error);
        return;
      }

      // whisper.cpp outputs the transcript to stdout
      const text = stdout.trim();
      resolve(text);
    });
  });
}
