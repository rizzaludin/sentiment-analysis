'use server';

import { ai } from '@/ai/genkit';
import { analyzeSentimentInsights } from '@/ai/flows/analyze-sentiment-insights';
import { z } from 'zod';
import type { SentimentResult } from '@/lib/types';

const sentimentSchema = z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  polarity: z.number().min(-1).max(1).describe('Sentiment score from -1 (very negative) to 1 (very positive)'),
});

const sentimentResponseSchema = z.object({
  results: z.array(sentimentSchema),
});

const sentimentAnalysisPrompt = `You are a sentiment analysis expert. For each comment in the provided JSON array, determine if its sentiment is positive, negative, or neutral. Also provide a polarity score from -1.0 to 1.0.

Respond with a single JSON object containing a "results" key. The value of "results" should be an array of objects, where each object corresponds to a comment in the original array and has "sentiment" and "polarity" keys. Maintain the original order.

Example Input:
["I love this!", "This is not good.", "It's okay I guess"]

Example Output:
{
  "results": [
    { "sentiment": "positive", "polarity": 0.8 },
    { "sentiment": "negative", "polarity": -0.6 },
    { "sentiment": "neutral", "polarity": 0.1 }
  ]
}

Input comments:
{{{comments}}}
`;

export async function getSentimentsForBatch(comments: string[]): Promise<SentimentResult[]> {
  if (comments.length === 0) {
    return [];
  }

  try {
    const generationResult = await ai.generate({
      prompt: sentimentAnalysisPrompt,
      model: 'googleai/gemini-2.0-flash',
      variables: { comments: JSON.stringify(comments) },
      output: {
        format: 'json',
        schema: sentimentResponseSchema,
      },
      config: {
        temperature: 0.1,
      }
    });

    const sentimentData = generationResult.output();

    if (!sentimentData || !sentimentData.results) {
      throw new Error('AI did not return valid data.');
    }

    if (sentimentData.results.length !== comments.length) {
      console.warn('Mismatch between input and output length from AI. Padding results to avoid crash.', {
        input: comments.length,
        output: sentimentData.results.length,
      });
      // Pad with neutral results to avoid crashing the app
      const paddedResults: SentimentResult[] = [...sentimentData.results];
      while (paddedResults.length < comments.length) {
        paddedResults.push({ sentiment: 'neutral', polarity: 0 });
      }
      return paddedResults.slice(0, comments.length);
    }
    return sentimentData.results;
  } catch (error) {
    console.error('Error during sentiment analysis batch:', error);
    // Return a neutral result for each comment in the batch on failure
    return comments.map(() => ({ sentiment: 'neutral', polarity: 0 }));
  }
}


export async function getInsight(sentimentData: string): Promise<string> {
  try {
    const result = await analyzeSentimentInsights({ sentimentData });
    return result.insight;
  } catch (error) {
    console.error('Error getting insight:', error);
    return 'Could not generate an insight at this time. Please try again later.';
  }
}
