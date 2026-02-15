import twilio from "twilio";
import { config } from "./config";
import { Detection } from "./detect";

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

// Track when we last sent an alert (so we don't spam you)
let lastAlertTime: Date | null = null;

/**
 * Sends you a text message when your player is detected.
 *
 * Includes a cooldown so you don't get 10 texts in a row
 * if the announcer keeps talking about your player.
 */
export async function sendAlert(detections: Detection[]): Promise<void> {
  // Cooldown check
  if (lastAlertTime) {
    const minutesSinceLastAlert =
      (Date.now() - lastAlertTime.getTime()) / 1000 / 60;
    if (minutesSinceLastAlert < config.alertCooldownMinutes) {
      console.log(
        `[Alert] Cooldown active (${Math.round(config.alertCooldownMinutes - minutesSinceLastAlert)} min remaining). Skipping alert.`
      );
      return;
    }
  }

  // Build the text message
  const bestMatch = detections[0];
  const message =
    `SAND ON THE MOUND!\n\n` +
    `${config.player.firstName} ${config.player.lastName} #${config.player.jerseyNumber} ` +
    `was just mentioned on the broadcast!\n\n` +
    `Heard: "${bestMatch.context}"\n\n` +
    `Tune in now!`;

  try {
    await client.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to: config.yourPhone,
    });

    lastAlertTime = new Date();
    console.log(`[Alert] TEXT SENT to ${config.yourPhone}`);
    console.log(`[Alert] Message: ${message}`);
  } catch (error) {
    console.error("[Alert] Failed to send text:", error);
  }
}

/**
 * Send a test text to make sure Twilio is working.
 */
export async function sendTestAlert(): Promise<void> {
  try {
    await client.messages.create({
      body:
        `Sand on the Mound - TEST\n\n` +
        `If you got this, your alerts are working!\n` +
        `Watching for: ${config.player.firstName} ${config.player.lastName} #${config.player.jerseyNumber}`,
      from: config.twilio.phoneNumber,
      to: config.yourPhone,
    });
    console.log(`Test text sent to ${config.yourPhone}`);
  } catch (error) {
    console.error("Failed to send test text:", error);
    throw error;
  }
}
