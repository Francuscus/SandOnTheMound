import { config, getSearchTerms } from "./config";
import { startAudioCapture, stopAudioCapture, cleanupOldChunks } from "./audio-capture";
import { transcribeAudio } from "./transcribe";
import { detectPlayer } from "./detect";
import { sendAlert } from "./alert";
import { openFloCollegeStream, closeBrowser } from "./browser";
import fs from "fs";

/**
 * SAND ON THE MOUND - Main Listener
 *
 * This is the program that watches a baseball game for you.
 * It opens the stream, listens to the announcer, and texts you
 * when Chris Sand #44 is mentioned.
 *
 * HOW TO RUN:
 *   npm start -- "https://www.flocollege.com/live/your-game-url"
 *
 * WHAT HAPPENS:
 *   1. Chrome opens and logs into FloCollege
 *   2. It navigates to the game stream
 *   3. FFmpeg records the audio in 30-second chunks
 *   4. Each chunk is sent to Whisper AI for transcription
 *   5. The transcript is searched for "Sand", "Chris Sand", "#44", etc.
 *   6. If found → you get a text message!
 */

async function main() {
  const gameUrl = process.argv[2];

  console.log("===========================================");
  console.log("   SAND ON THE MOUND - Game Day Listener");
  console.log("===========================================");
  console.log();
  console.log(
    `  Player: ${config.player.firstName} ${config.player.lastName} #${config.player.jerseyNumber}`
  );
  console.log(`  Team:   ${config.player.team}`);
  console.log(`  Alerts: ${config.yourPhone}`);
  console.log(`  Search: ${getSearchTerms().join(", ")}`);
  console.log();

  if (!gameUrl) {
    console.log("USAGE:");
    console.log(
      '  npm start -- "https://www.flocollege.com/live/your-game-url"'
    );
    console.log();
    console.log("You can find the game URL by:");
    console.log("  1. Go to flocollege.com");
    console.log("  2. Find today's Rutgers baseball game");
    console.log("  3. Copy the URL from your browser");
    console.log();
    process.exit(1);
  }

  // Handle Ctrl+C gracefully
  process.on("SIGINT", async () => {
    console.log("\n[Main] Shutting down...");
    stopAudioCapture();
    await closeBrowser();
    process.exit(0);
  });

  // Step 1: Open the stream in Chrome
  try {
    await openFloCollegeStream(gameUrl);
  } catch (error) {
    console.error("[Main] Failed to open stream:", error);
    console.log(
      "\nTip: Make sure Chrome is installed and the game URL is correct."
    );
    process.exit(1);
  }

  // Give the stream a few seconds to start playing
  console.log("[Main] Waiting 5 seconds for stream to start...");
  await sleep(5000);

  // Step 2: Start recording and processing audio
  let chunksProcessed = 0;
  let totalDetections = 0;

  console.log("[Main] Starting audio capture. Listening for your player...");
  console.log("[Main] Press Ctrl+C to stop.\n");

  startAudioCapture(async (chunkFile: string) => {
    chunksProcessed++;

    // Transcribe the audio chunk
    const transcript = await transcribeAudio(chunkFile);

    // Clean up the audio file (we don't need it anymore)
    try {
      fs.unlinkSync(chunkFile);
    } catch {
      // ignore
    }

    if (!transcript) return;

    // Search for player mentions
    const detections = detectPlayer(transcript);

    if (detections.length > 0) {
      totalDetections += detections.length;
      console.log(
        `\n  *** PLAYER DETECTED! *** (${detections.length} mention(s))\n`
      );

      // Send text alert
      await sendAlert(detections);
    }

    // Status update every 10 chunks (~5 minutes)
    if (chunksProcessed % 10 === 0) {
      console.log(
        `[Main] Status: ${chunksProcessed} chunks processed, ${totalDetections} total detections`
      );
      cleanupOldChunks();
    }
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error("[Main] Fatal error:", error);
  process.exit(1);
});
