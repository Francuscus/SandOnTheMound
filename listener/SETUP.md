# Sand on the Mound - Setup Guide

This guide assumes you have **zero coding experience**. Follow each step exactly.

## What This Does

When you run this program during a Rutgers baseball game:
1. Chrome opens and logs into your FloCollege account
2. It listens to the announcer in the background
3. If the announcer says "Sand", "Chris Sand", "number 44", etc.
4. You get a text message on your phone within ~45 seconds

## Cost: Basically Free

- **Whisper AI** runs locally on your PC — **$0**
- **Twilio** texts cost ~$0.01 each. Free trial gives you $15 credit (1,500 texts)
- **Everything else** is free and open source

## One-Time Setup (Do This Once)

### Step 1: Install Node.js

Node.js is what runs this program. Think of it like installing Microsoft Word before you can open a .docx file.

1. Go to https://nodejs.org
2. Click the big green **"LTS"** button (left one)
3. Run the installer, click Next through everything
4. To verify: open **Command Prompt** (search "cmd" in Start menu) and type:
   ```
   node --version
   ```
   You should see something like `v20.11.0`

### Step 2: Install FFmpeg

FFmpeg is what records the audio. It's a free tool used by YouTube, Netflix, etc.

1. Go to https://www.gyan.dev/ffmpeg/builds/
2. Under "Release builds", click **ffmpeg-release-essentials.zip**
3. Extract the zip file
4. Inside, find the `bin` folder. It contains `ffmpeg.exe`
5. Copy the full path to that `bin` folder (e.g., `C:\ffmpeg\bin`)
6. Add it to your system PATH:
   - Search "environment variables" in Start menu
   - Click "Edit the system environment variables"
   - Click "Environment Variables" button
   - Under "System variables", find **Path**, click Edit
   - Click "New" and paste the path to the bin folder
   - Click OK on everything
7. To verify: open a **new** Command Prompt and type:
   ```
   ffmpeg -version
   ```
   You should see version info (not "command not found")

### Step 3: Install VB-Cable

VB-Cable creates a virtual speaker that lets our program "hear" what your computer is playing.

1. Go to https://vb-audio.com/Cable/
2. Click **Download** (the orange button)
3. Extract the zip and right-click **VBCABLE_Setup_x64.exe** → Run as administrator
4. Click Install
5. **IMPORTANT - Set VB-Cable as default playback:**
   - Right-click the speaker icon in your taskbar (bottom right)
   - Click "Sound settings"
   - Under "Output", select **CABLE Input (VB-Audio Virtual Cable)**
   - Now all your computer audio goes through VB-Cable

   **NOTE:** You won't hear audio from your speakers while this is active!
   To hear audio AND capture it, see "Bonus: Hear Audio Too" at the bottom.

### Step 4: Install Whisper (FREE AI transcription)

Whisper is the AI that converts the announcer's voice to text. It runs on your PC — no cloud, no cost.

1. Go to https://github.com/ggerganov/whisper.cpp/releases
2. Scroll down to **Assets** under the latest release
3. Download **whisper-bin-x64.zip** (the Windows version)
4. Create a folder: `C:\whisper`
5. Extract the zip contents into `C:\whisper`
   - You should now have `C:\whisper\main.exe` (this is the program)
6. **Download the AI model** (one-time, ~150MB):
   - Double-click **download-model.bat** in the `listener` folder
   - OR manually download from: https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
   - Save it to: `C:\whisper\models\ggml-base.en.bin`
7. To verify: open Command Prompt and type:
   ```
   C:\whisper\main.exe --help
   ```
   You should see a list of options (not "not found")

**Which model to choose?**
- `base.en` (150MB) — Fast, good enough for catching names. **Start with this.**
- `small.en` (500MB) — More accurate, slower. Try if base misses too many mentions.
- `medium.en` (1.5GB) — Very accurate, needs a decent PC. Use if you have a gaming PC.

### Step 5: Sign Up for Twilio (sends text messages)

1. Go to https://www.twilio.com/try-twilio
2. Create a free account
3. Verify your phone number (this is the number that will RECEIVE texts)
4. On the dashboard, you'll see:
   - **Account SID** (starts with "AC...")
   - **Auth Token** (click to reveal)
5. Click "Get a Trial Number" - this gives you a phone number to SEND texts from
6. Write down all three: Account SID, Auth Token, and your Twilio phone number

### Step 6: Configure the App

1. Open the `listener` folder in File Explorer
2. Copy the file `.env.example` and rename the copy to `.env`
3. Open `.env` in Notepad and fill in your values:
   ```
   YOUR_PHONE_NUMBER=+12125551234    ← your actual phone, with +1
   TWILIO_ACCOUNT_SID=AC...          ← from Step 5
   TWILIO_AUTH_TOKEN=...             ← from Step 5
   TWILIO_PHONE_NUMBER=+1...         ← from Step 5
   FLOCOLLEGE_EMAIL=your@email.com   ← your FloCollege login
   FLOCOLLEGE_PASSWORD=yourpassword  ← your FloCollege password
   ```
   The Whisper paths default to `C:\whisper\main.exe` and `C:\whisper\models\ggml-base.en.bin`.
   Only change them if you put whisper.cpp somewhere else.
4. Save the file

### Step 7: Install the App Dependencies

1. Open Command Prompt
2. Navigate to the listener folder:
   ```
   cd C:\path\to\SandOnTheMound\listener
   ```
   (replace with your actual path - if you cloned to Desktop it might be
   `cd C:\Users\YourName\Desktop\SandOnTheMound\listener`)
3. Install dependencies:
   ```
   npm install
   ```
   This downloads the code libraries. Takes about a minute.

### Step 8: Test Everything

**Test texting:**
```
npm run test-sms
```
You should get a text on your phone. If not, double-check your Twilio settings.

**Test audio + transcription:**
```
npm run test-whisper
```
This records 10 seconds of audio and transcribes it locally using Whisper. Play some music or talk to test.

## Game Day! (Do This Each Game)

### Step 1: Get the Game URL

1. Go to flocollege.com in your browser
2. Find today's Rutgers baseball game
3. Copy the URL (e.g., `https://www.flocollege.com/live/12345-rutgers-vs-someone`)

### Step 2: Set VB-Cable as Output

1. Right-click speaker icon → Sound settings
2. Set output to **CABLE Input (VB-Audio Virtual Cable)**

### Step 3: Run the Listener

Open Command Prompt and run:
```
cd C:\path\to\SandOnTheMound\listener
npm start -- "https://www.flocollege.com/live/your-game-url-here"
```

### Step 4: Let It Run

- Chrome will open, log you in, and go to the game
- The program will start listening
- You'll see status updates in the Command Prompt window
- **Don't close the Command Prompt window or Chrome!**
- When you get a text, tune in!

### Step 5: Stop When Done

Press **Ctrl+C** in the Command Prompt window to stop.
Then change your audio output back to your normal speakers.

---

## Bonus: Hear Audio Too

By default, you can't hear the game audio because it all goes to VB-Cable.
To hear it AND capture it:

1. Right-click the speaker icon → Sound settings
2. Set output to your normal speakers/headphones
3. Search for "Sound" in Start menu, open the classic Sound control panel
4. Go to the **Recording** tab
5. Right-click "CABLE Output" → Properties
6. Go to the **Listen** tab
7. Check **"Listen to this device"**
8. Set "Playback through" to your normal speakers
9. Click OK

Now audio plays through speakers AND VB-Cable captures it.

## Troubleshooting

**"Cannot find whisper.cpp at C:\whisper\main.exe"**
→ You didn't extract whisper.cpp to the right place. Make sure `C:\whisper\main.exe` exists.

**"Cannot find model"**
→ Run `download-model.bat` or manually download the model file (see Step 4.6).

**"FFmpeg not found"**
→ You didn't add FFmpeg to your PATH correctly. Redo Step 2.6.

**"Cannot find audio device"**
→ VB-Cable not installed correctly. Redo Step 3.

**"Twilio error: not verified"**
→ On free Twilio, you can only text numbers you've verified. Go to Twilio console → Verified Caller IDs and add your number.

**"No speech detected"**
→ VB-Cable isn't getting audio. Make sure it's set as default playback device AND the stream is actually playing.

**"Chrome won't open"**
→ Make sure Google Chrome is installed in the default location.

**Whisper is too slow on my PC**
→ The `base.en` model should transcribe 30 seconds of audio in about 5-15 seconds on most PCs. If it's taking longer than 30 seconds per chunk, your PC might be too slow. Try closing other programs while the listener runs.

## Costs

- **Whisper:** FREE (runs on your PC)
- **Twilio:** ~$0.01 per text message. Free trial gives you $15 credit (1,500 texts)
- **Total per game:** Essentially $0 (a few cents in texts)
