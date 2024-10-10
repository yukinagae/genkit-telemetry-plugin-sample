import { generate } from '@genkit-ai/ai'
import { configureGenkit } from '@genkit-ai/core'
// import { GenkitMetric, genkitEval } from '@genkit-ai/evaluator'
import { defineFlow } from '@genkit-ai/flow'
import { gemini15Flash, googleAI } from '@genkit-ai/googleai'
import * as z from 'zod'

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
})

export const menuSuggestionFlow = defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const llmResponse = await generate({
      prompt: `Suggest an item for the menu of a ${subject} themed restaurant`,
      model: gemini15Flash,
      config: {
        temperature: 1,
      },
    })

    return llmResponse.text()
  },
)
