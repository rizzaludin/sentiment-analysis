'use server';

/**
 * @fileOverview Analyzes the range of sentiments expressed in TikTok data.
 *
 * - analyzeSentimentInsights - A function that provides insights into the range of sentiments.
 * - AnalyzeSentimentInsightsInput - The input type for the analyzeSentimentInsights function.
 * - AnalyzeSentimentInsightsOutput - The return type for the analyzeSentimentInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentInsightsInputSchema = z.object({
  sentimentData: z
    .string()
    .describe(
      'A string containing sentiment analysis results, with each line representing a comment and its associated sentiment polarity score.'
    ),
});
export type AnalyzeSentimentInsightsInput = z.infer<
  typeof AnalyzeSentimentInsightsInputSchema
>;

const AnalyzeSentimentInsightsOutputSchema = z.object({
  insight: z
    .string()
    .describe(
      'A brief summary of the range of sentiments expressed in the provided data.'
    ),
});
export type AnalyzeSentimentInsightsOutput = z.infer<
  typeof AnalyzeSentimentInsightsOutputSchema
>;

export async function analyzeSentimentInsights(
  input: AnalyzeSentimentInsightsInput
): Promise<AnalyzeSentimentInsightsOutput> {
  return analyzeSentimentInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSentimentInsightsPrompt',
  input: {schema: AnalyzeSentimentInsightsInputSchema},
  output: {schema: AnalyzeSentimentInsightsOutputSchema},
  prompt: `You are an expert in sentiment analysis. You will receive sentiment analysis results, with each line representing a comment and its associated sentiment polarity score.

  Your task is to provide a brief summary of the range of sentiments expressed in the provided data. Focus on overall trends and significant deviations.

  Sentiment Data:\n{{{sentimentData}}}
  `,
});

const analyzeSentimentInsightsFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentInsightsFlow',
    inputSchema: AnalyzeSentimentInsightsInputSchema,
    outputSchema: AnalyzeSentimentInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
