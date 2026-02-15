/**
 * TEST: Send a test text message
 *
 * Run this to make sure your Twilio setup is working:
 *   npm run test-sms
 *
 * You should get a text message on your phone within a few seconds.
 */

import { sendTestAlert } from "./alert";

async function main() {
  console.log("Sending test text message...");
  await sendTestAlert();
  console.log("Done! Check your phone.");
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
