/**
 * TEST: Test local Whisper transcription
 *
 * Run this to make sure whisper.cpp is working:
 *   npm run test-whisper
 *
 * It will record 10 seconds of audio and try to transcribe it.
 * Say something into your mic (or play audio through VB-Cable) to test.
 */

import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { config } from "./config";
import { transcribeAudio } from "./transcribe";
import { detectPlayer } from "./detect";

async function main() {
  const testFile = path.join(__dirname, "..", "test_audio.wav");

  console.log("=== Whisper.cpp Test ===");
  console.log(`Whisper executable: ${config.whisper.executablePath}`);
  console.log(`Model file: ${config.whisper.modelPath}`);
  console.log(`Audio device: ${config.audio.deviceName}`);
  console.log();

  // Check whisper.cpp exists
  if (!fs.existsSync(config.whisper.executablePath)) {
    console.error(`ERROR: whisper.cpp not found at ${config.whisper.executablePath}`);
    console.error("Follow the setup guide to download whisper.cpp first.");
    process.exit(1);
  }

  // Check model exists
  if (!fs.existsSync(config.whisper.modelPath)) {
    console.error(`ERROR: Model not found at ${config.whisper.modelPath}`);
    console.error("Run download-model.bat to download the model first.");
    process.exit(1);
  }

  console.log("Recording 10 seconds of audio...");
  console.log("(Play some audio or speak to test)\n");

  // Record 10 seconds
  await new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-f", "dshow",
      "-i", `audio=${config.audio.deviceName}`,
      "-t", "10",
      "-ar", "16000",
      "-ac", "1",
      "-y",
      testFile,
    ]);

    ffmpeg.stderr?.on("data", (data: Buffer) => {
      const msg = data.toString();
      if (msg.includes("Error")) {
        console.error(msg);
      }
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  if (!fs.existsSync(testFile)) {
    console.error("Recording failed - no audio file created.");
    console.error("Make sure VB-Cable is installed and set as default playback.");
    process.exit(1);
  }

  console.log("Recording done. Running local Whisper transcription...\n");

  const transcript = await transcribeAudio(testFile);

  if (transcript) {
    console.log("\n=== TRANSCRIPT ===");
    console.log(transcript);
    console.log("==================\n");

    const detections = detectPlayer(transcript);
    if (detections.length > 0) {
      console.log(`Player detected! Found ${detections.length} mention(s)`);
      for (const d of detections) {
        console.log(`  - "${d.term}" in: ${d.context}`);
      }
    } else {
      console.log(
        `No mentions of ${config.player.lastName} / #${config.player.jerseyNumber} found.`
      );
    }
  } else {
    console.log("No speech detected. Try speaking louder or check your audio device.");
  }

  // Cleanup
  fs.unlinkSync(testFile);
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
