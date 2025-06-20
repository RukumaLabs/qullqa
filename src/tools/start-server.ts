import { z } from 'zod';
import { processManager } from '../process-manager.js';

export const startServerSchema = z.object({});

export type StartServerInput = z.infer<typeof startServerSchema>;

export async function executeStartServer(_input: StartServerInput) {
  try {
    const result = await processManager.startServer();
    
    if (result.success) {
      return {
        content: [
          {
            type: 'text',
            text: result.message
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: result.message
          }
        ],
        isError: true
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}