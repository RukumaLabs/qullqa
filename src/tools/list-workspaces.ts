import { z } from 'zod';
import { artifactStorage } from '../artifact-storage.js';

export const listWorkspacesSchema = z.object({});

export type ListWorkspacesInput = z.infer<typeof listWorkspacesSchema>;

export async function executeListWorkspaces(_input: ListWorkspacesInput) {
  try {
    const workspaces = await artifactStorage.listWorkspaces();
    
    if (workspaces.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No workspaces found. Create your first artifact using the store-artifact tool.'
          }
        ]
      };
    }
    
    const workspaceList = workspaces
      .map(ws => `• ${ws}`)
      .join('\n');
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'}:\n\n${workspaceList}\n\nView artifacts in a workspace using the list-workspace-artifacts tool.`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to list workspaces: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}