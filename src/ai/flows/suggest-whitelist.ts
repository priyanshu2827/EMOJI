'use server';

/**
 * @fileOverview Suggests potential whitelisting rules based on common characteristics of false positives.
 *
 * - suggestWhitelist - A function that suggests whitelisting rules.
 * - SuggestWhitelistInput - The input type for the suggestWhitelist function.
 * - SuggestWhitelistOutput - The return type for the suggestWhitelist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWhitelistInputSchema = z.object({
  scanResults: z.string().describe('The raw scan results from the steganography detection engine.'),
  numSuggestions: z.number().describe('The number of whitelisting rules to suggest.'),
});
export type SuggestWhitelistInput = z.infer<typeof SuggestWhitelistInputSchema>;

const SuggestWhitelistOutputSchema = z.object({
  suggestedRules: z.array(z.string()).describe('An array of suggested whitelisting rules.'),
});
export type SuggestWhitelistOutput = z.infer<typeof SuggestWhitelistOutputSchema>;

export async function suggestWhitelist(input: SuggestWhitelistInput): Promise<SuggestWhitelistOutput> {
  return suggestWhitelistFlow(input);
}

const suggestWhitelistPrompt = ai.definePrompt({
  name: 'suggestWhitelistPrompt',
  input: {schema: SuggestWhitelistInputSchema},
  output: {schema: SuggestWhitelistOutputSchema},
  prompt: `You are a security analyst expert. Analyze the provided scan results and
suggest whitelisting rules to reduce false positives.

Scan Results: {{{scanResults}}}

Number of Suggestions: {{{numSuggestions}}}

Based on these results, suggest {{numSuggestions}} whitelisting rules that could be applied to reduce noise from similar false positives in the future. Return a JSON array of strings representing the rules.
`,
});

const suggestWhitelistFlow = ai.defineFlow(
  {
    name: 'suggestWhitelistFlow',
    inputSchema: SuggestWhitelistInputSchema,
    outputSchema: SuggestWhitelistOutputSchema,
  },
  async input => {
    const {output} = await suggestWhitelistPrompt(input);
    return output!;
  }
);
