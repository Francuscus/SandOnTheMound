import { getSearchTerms, config } from "./config";

export interface Detection {
  term: string;
  context: string; // the sentence where we found it
  timestamp: Date;
}

/**
 * Searches a transcript for any mention of the player.
 *
 * We look for:
 * - Last name ("Sand")
 * - Full name ("Chris Sand")
 * - Jersey number ("number 44", "forty-four", "#44")
 * - Any nicknames you configured
 *
 * Returns all matches found, or empty array if none.
 */
export function detectPlayer(transcript: string): Detection[] {
  if (!transcript || transcript.trim().length === 0) {
    return [];
  }

  const lowerTranscript = transcript.toLowerCase();
  const searchTerms = getSearchTerms();
  const detections: Detection[] = [];

  // Also search for number words (Whisper sometimes writes "forty-four" instead of "44")
  const numberWord = numberToWords(parseInt(config.player.jerseyNumber, 10));
  if (numberWord) {
    searchTerms.push(numberWord);
  }

  for (const term of searchTerms) {
    const index = lowerTranscript.indexOf(term);
    if (index !== -1) {
      // Grab some surrounding context (the sentence around the match)
      const start = Math.max(0, index - 40);
      const end = Math.min(transcript.length, index + term.length + 40);
      const context = transcript.substring(start, end).trim();

      detections.push({
        term,
        context: `...${context}...`,
        timestamp: new Date(),
      });

      console.log(`[Detect] MATCH: Found "${term}" in transcript`);
    }
  }

  return detections;
}

/**
 * Converts jersey numbers to words since Whisper sometimes
 * writes "forty-four" instead of "44".
 */
function numberToWords(num: number): string | null {
  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven",
    "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
  ];
  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty",
    "sixty", "seventy", "eighty", "ninety",
  ];

  if (num < 20) return ones[num] || null;
  if (num < 100) {
    const t = tens[Math.floor(num / 10)];
    const o = ones[num % 10];
    return o ? `${t}-${o}` : t;
  }
  return null;
}
