import { z } from 'zod';
import { processManager } from '../process-manager.js';

export const serverStatusSchema = z.object({});

export type ServerStatusInput = z.infer<typeof serverStatusSchema>;

export async function executeServerStatus(_input: ServerStatusInput) {
  try {
    const info = await processManager.getServerInfo();
    
    if (info.running) {
      return {
        content: [
          {
            type: 'text',
            text: `HTTP server is running\n• URL: ${info.url}\n• Port: ${info.port}${info.pid ? `\n• PID: ${info.pid}` : ''}\n\nAccess the web interface at ${info.url}/`
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `HTTP server is NOT running. Use the start-server tool to start it.`
          }
        ]
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to check server status: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}