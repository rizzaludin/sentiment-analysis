/**
 * Cleans a given text string by performing several operations:
 * - Removes URLs
 * - Removes mentions (@username)
 * - Removes hashtags (#topic)
 * - Removes emojis and other non-alphanumeric symbols (keeps basic punctuation)
 * - Converts to lowercase
 * - Trims whitespace
 *
 * @param text The input string to clean.
 * @returns The cleaned string.
 */
export function cleanText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let cleanedText = text;

  // Remove URLs
  cleanedText = cleanedText.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');

  // Remove mentions and hashtags
  cleanedText = cleanedText.replace(/[@#][\w-]+/g, '');

  // Remove most emojis and special characters.
  // This regex keeps letters (including unicode), numbers, whitespace, and common punctuation.
  cleanedText = cleanedText.replace(/[^\p{L}\p{N}\p{Z}\p{P}'"-.,!?]/gu, '');

  // Convert to lowercase
  cleanedText = cleanedText.toLowerCase();

  // Remove extra whitespace
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

  return cleanedText;
}
