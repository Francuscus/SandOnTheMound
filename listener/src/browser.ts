import puppeteer, { Browser, Page } from "puppeteer";
import { config } from "./config";

let browser: Browser | null = null;
let page: Page | null = null;

/**
 * Opens Chrome, logs into FloCollege, and navigates to the game stream.
 *
 * This uses Puppeteer, which controls Chrome like a robot.
 * It types your username/password and clicks the buttons for you.
 */
export async function openFloCollegeStream(gameUrl: string): Promise<void> {
  console.log("[Browser] Launching Chrome...");

  browser = await puppeteer.launch({
    headless: false, // We want to SEE the browser (and hear the audio!)
    defaultViewport: null,
    args: [
      "--start-maximized",
      "--autoplay-policy=no-user-gesture-required", // Auto-play video
    ],
  });

  page = (await browser.pages())[0] || (await browser.newPage());

  // Step 1: Go to FloSports login
  console.log("[Browser] Going to FloSports login...");
  await page.goto("https://www.flosports.tv/login", {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  // Step 2: Log in
  console.log("[Browser] Logging in...");
  try {
    // Type email
    await page.waitForSelector('input[type="email"], input[name="email"]', {
      timeout: 10000,
    });
    await page.type(
      'input[type="email"], input[name="email"]',
      config.flocollege.email
    );

    // Type password
    await page.type(
      'input[type="password"], input[name="password"]',
      config.flocollege.password
    );

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 });
    console.log("[Browser] Logged in successfully");
  } catch (error) {
    console.error(
      "[Browser] Login might have changed. Trying to continue anyway..."
    );
  }

  // Step 3: Navigate to the game stream
  console.log(`[Browser] Opening game: ${gameUrl}`);
  await page.goto(gameUrl, {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  // Step 4: Try to click the play button if the video doesn't auto-play
  try {
    await page.waitForSelector("video", { timeout: 10000 });
    // Try clicking play if it exists
    const playButton = await page.$('[aria-label="Play"], .play-button, button.vjs-big-play-button');
    if (playButton) {
      await playButton.click();
      console.log("[Browser] Clicked play button");
    }
  } catch {
    console.log(
      "[Browser] Could not find video element yet - stream may not have started"
    );
  }

  console.log("[Browser] Stream page loaded. Audio capture will start now.");
  console.log(
    "[Browser] IMPORTANT: Make sure VB-Cable is your default playback device!"
  );
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
    console.log("[Browser] Chrome closed");
  }
}
