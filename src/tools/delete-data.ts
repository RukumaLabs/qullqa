import { z } from 'zod';
import { storageInstance } from '../storage.js';

export const deleteDataSchema = z.object({
  name: z.string().min(1).describe('The name/key of the data to delete')
});

export type DeleteDataInput = z.infer<typeof deleteDataSchema>;

export async function executeDeleteData(input: DeleteDataInput) {
  try {
    const deleted = await storageInstance.delete(input.name);
    
    if (deleted) {
      return {
        content: [
          {
            type: 'text',
            text: `Successfully deleted data stored under "${input.name}"`
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `No data found under "${input.name}"`
          }
        ]
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to delete data: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}