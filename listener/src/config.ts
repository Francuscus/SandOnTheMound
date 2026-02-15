import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`\n  Missing required setting: ${name}`);
    console.error(`  Edit your .env file and add it.\n`);
    process.exit(1);
  }
  return value;
}

export const config = {
  // Player info
  player: {
    firstName: requireEnv("PLAYER_FIRST_NAME"),
    lastName: requireEnv("PLAYER_LAST_NAME"),
    jerseyNumber: requireEnv("PLAYER_JERSEY_NUMBER"),
    team: process.env.PLAYER_TEAM || "Rutgers",
    nicknames: (process.env.PLAYER_NICKNAMES || "")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean),
  },

  // Your phone
  yourPhone: requireEnv("YOUR_PHONE_NUMBER"),

  // Twilio
  twilio: {
    accountSid: requireEnv("TWILIO_ACCOUNT_SID"),
    authToken: requireEnv("TWILIO_AUTH_TOKEN"),
    phoneNumber: requireEnv("TWILIO_PHONE_NUMBER"),
  },

  // Whisper (local - free!)
  whisper: {
    executablePath:
      process.env.WHISPER_EXECUTABLE_PATH ||
      "C:\\whisper\\main.exe",
    modelPath:
      process.env.WHISPER_MODEL_PATH ||
      "C:\\whisper\\models\\ggml-base.en.bin",
  },

  // FloCollege
  flocollege: {
    email: requireEnv("FLOCOLLEGE_EMAIL"),
    password: requireEnv("FLOCOLLEGE_PASSWORD"),
  },

  // Audio settings
  audio: {
    chunkSeconds: parseInt(process.env.AUDIO_CHUNK_SECONDS || "30", 10),
    deviceName:
      process.env.AUDIO_DEVICE_NAME ||
      "CABLE Output (VB-Audio Virtual Cable)",
  },

  // Alert cooldown
  alertCooldownMinutes: parseInt(
    process.env.ALERT_COOLDOWN_MINUTES || "5",
    10
  ),
};

/**
 * Returns all the search terms we look for in transcripts.
 * Announcers might say: "Sand", "Chris Sand", "number 44", "#44", etc.
 */
export function getSearchTerms(): string[] {
  const terms: string[] = [
    config.player.lastName.toLowerCase(),
    `${config.player.firstName} ${config.player.lastName}`.toLowerCase(),
    `number ${config.player.jerseyNumber}`,
    `#${config.player.jerseyNumber}`,
  ];

  // Add nicknames
  for (const nick of config.player.nicknames) {
    terms.push(nick.toLowerCase());
  }

  return terms;
}
