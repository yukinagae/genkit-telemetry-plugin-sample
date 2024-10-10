import { generate } from '@genkit-ai/ai'
import { configureGenkit } from '@genkit-ai/core'
import { defineFlow } from '@genkit-ai/flow'
import { gemini15Flash, googleAI } from '@genkit-ai/googleai'
import * as z from 'zod'

import { myPlugin } from './myPlugin'

configureGenkit({
  plugins: [
    googleAI(), //
    myPlugin(), //
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
  telemetry: {
    instrumentation: 'myPlugin',
    logger: 'myPlugin',
  },
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
