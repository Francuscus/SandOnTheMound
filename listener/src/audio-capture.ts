import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { config } from "./config";

const CHUNKS_DIR = path.join(__dirname, "..", "chunks");

// Make sure the chunks folder exists
if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR, { recursive: true });
}

let ffmpegProcess: ChildProcess | null = null;
let chunkCounter = 0;

/**
 * Records system audio using FFmpeg + VB-Cable.
 *
 * HOW IT WORKS:
 * - VB-Cable creates a virtual speaker on your PC
 * - You set VB-Cable as your default playback device
 * - FloCollege audio goes into VB-Cable
 * - FFmpeg records FROM VB-Cable's output
 * - Every 30 seconds, it saves a .wav file for Whisper to transcribe
 */
export function startAudioCapture(
  onChunkReady: (filePath: string) => void
): void {
  console.log(`[Audio] Starting capture from: ${config.audio.deviceName}`);
  console.log(
    `[Audio] Saving ${config.audio.chunkSeconds}-second chunks to: ${CHUNKS_DIR}`
  );

  recordNextChunk(onChunkReady);
}

function recordNextChunk(onChunkReady: (filePath: string) => void): void {
  chunkCounter++;
  const outputFile = path.join(CHUNKS_DIR, `chunk_${chunkCounter}.wav`);

  // FFmpeg command to record from VB-Cable on Windows
  // -f dshow          = use DirectShow (Windows audio capture)
  // -i audio=...      = the VB-Cable virtual device
  // -t 30             = record for 30 seconds
  // -ar 16000         = 16kHz sample rate (what Whisper expects)
  // -ac 1             = mono audio (saves bandwidth, Whisper doesn't need stereo)
  ffmpegProcess = spawn("ffmpeg", [
    "-f",
    "dshow",
    "-i",
    `audio=${config.audio.deviceName}`,
    "-t",
    config.audio.chunkSeconds.toString(),
    "-ar",
    "16000",
    "-ac",
    "1",
    "-y", // overwrite if exists
    outputFile,
  ]);

  ffmpegProcess.stderr?.on("data", (data: Buffer) => {
    const msg = data.toString();
    // Only show errors, not the normal FFmpeg progress spam
    if (msg.includes("Error") || msg.includes("error")) {
      console.error(`[Audio] FFmpeg error: ${msg}`);
    }
  });

  ffmpegProcess.on("close", (code) => {
    if (code === 0 && fs.existsSync(outputFile)) {
      const stats = fs.statSync(outputFile);
      if (stats.size > 1000) {
        // Not an empty/silent file
        console.log(
          `[Audio] Chunk ${chunkCounter} saved (${Math.round(stats.size / 1024)}KB)`
        );
        onChunkReady(outputFile);
      } else {
        console.log(`[Audio] Chunk ${chunkCounter} was silent, skipping`);
        cleanupChunk(outputFile);
      }
    } else if (code !== null) {
      console.error(`[Audio] FFmpeg exited with code ${code}`);
    }

    // Record the next chunk (loop forever until stopped)
    recordNextChunk(onChunkReady);
  });
}

function cleanupChunk(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore cleanup errors
  }
}

export function stopAudioCapture(): void {
  if (ffmpegProcess) {
    ffmpegProcess.kill("SIGTERM");
    ffmpegProcess = null;
    console.log("[Audio] Capture stopped");
  }
}

/**
 * Clean up old chunk files (call periodically to save disk space)
 */
export function cleanupOldChunks(): void {
  const files = fs.readdirSync(CHUNKS_DIR);
  for (const file of files) {
    if (file.startsWith("chunk_") && file.endsWith(".wav")) {
      const filePath = path.join(CHUNKS_DIR, file);
      const stats = fs.statSync(filePath);
      const ageMinutes =
        (Date.now() - stats.mtimeMs) / 1000 / 60;
      if (ageMinutes > 10) {
        cleanupChunk(filePath);
      }
    }
  }
}
