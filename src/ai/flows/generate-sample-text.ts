'use server';

/**
 * @fileOverview Flow for generating sample text with a hidden message for demonstration purposes.
 *
 * - generateSampleText - Generates sample text with a hidden message.
 * - GenerateSampleTextInput - The input type for the generateSampleText function.
 * - GenerateSampleTextOutput - The return type for the generateSampleText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSampleTextInputSchema = z.object({
  topic: z.string().describe('The topic of the sample text.'),
  hiddenMessage: z.string().describe('The hidden message to embed in the text.'),
});
export type GenerateSampleTextInput = z.infer<typeof GenerateSampleTextInputSchema>;

const GenerateSampleTextOutputSchema = z.object({
  sampleText: z
    .string()
    .describe('The generated sample text with the hidden message embedded.'),
  detectionTip: z
    .string()
    .optional()
    .describe(
      'A tip on how to detect the hidden message. This is optional and only for demonstration.'
    ),
});
export type GenerateSampleTextOutput = z.infer<typeof GenerateSampleTextOutputSchema>;

export async function generateSampleText(
  input: GenerateSampleTextInput
): Promise<GenerateSampleTextOutput> {
  return generateSampleTextFlow(input);
}

const generateSampleTextPrompt = ai.definePrompt({
  name: 'generateSampleTextPrompt',
  input: {schema: GenerateSampleTextInputSchema},
  output: {schema: GenerateSampleTextOutputSchema},
  prompt: `You are an expert in creating sample text on a given topic, embedding a hidden message using zero-width characters.

  The topic is: {{{topic}}}
  The hidden message is: {{{hiddenMessage}}}

  Generate a short paragraph on the topic, embedding the hidden message using zero-width characters (ZWSP, ZWNJ, ZWJ). Clearly identify in the output "detectionTip" how to find this message using a tool that reveals zero-width characters.

  The sample text should appear natural and not give away the presence of the hidden message without special tools. Make it very short.
  `,
});

const generateSampleTextFlow = ai.defineFlow(
  {
    name: 'generateSampleTextFlow',
    inputSchema: GenerateSampleTextInputSchema,
    outputSchema: GenerateSampleTextOutputSchema,
  },
  async input => {
    const {output} = await generateSampleTextPrompt(input);
    return output!;
  }
);
