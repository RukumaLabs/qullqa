import { z } from 'zod';
import { storageInstance } from '../storage.js';

export const storeDataSchema = z.object({
  name: z.string().min(1).describe('The name/key to store the data under'),
  content: z.string().describe('The content to store'),
  contentType: z.string().optional().default('text/plain').describe('MIME type of the content (e.g., text/html, application/json)')
});

export type StoreDataInput = z.infer<typeof storeDataSchema>;

export async function executeStoreData(input: StoreDataInput) {
  try {
    await storageInstance.store(input.name, input.content, input.contentType);
    
    return {
      content: [
        {
          type: 'text',
          text: `Successfully stored data under "${input.name}". Access it at http://localhost:1337/${encodeURIComponent(input.name)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to store data: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}