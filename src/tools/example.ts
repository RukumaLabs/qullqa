import { z } from 'zod';

// Schema for the example tool
export const exampleToolSchema = z.object({
  message: z.string().describe('The message to echo'),
});

// Type for the example tool input
export type ExampleToolInput = z.infer<typeof exampleToolSchema>;

// Implementation of the example tool
export async function executeExampleTool(input: ExampleToolInput) {
  const { message } = input;
  
  return {
    content: [
      {
        type: 'text',
        text: `Echo: ${message}`,
      },
    ],
  };
}