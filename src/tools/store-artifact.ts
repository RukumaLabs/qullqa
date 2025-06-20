import { z } from 'zod';
import { artifactStorage } from '../artifact-storage.js';

export const storeArtifactSchema = z.object({
  workspace: z.string().min(1).describe('The workspace name to organize artifacts'),
  id: z.string().min(1).regex(/^[a-zA-Z0-9-_]+$/).describe('Unique identifier for the artifact (alphanumeric, hyphens, underscores only)'),
  html: z.string().describe('The HTML content of the artifact'),
  description: z.string().optional().describe('Optional description of the artifact')
});

export type StoreArtifactInput = z.infer<typeof storeArtifactSchema>;

export async function executeStoreArtifact(input: StoreArtifactInput) {
  try {
    const result = await artifactStorage.storeArtifact(
      input.workspace,
      input.id,
      input.html,
      input.description
    );
    
    const fullUrl = `http://localhost:1337${result.url}`;
    
    return {
      content: [
        {
          type: 'text',
          text: `Successfully stored artifact "${input.id}" in workspace "${input.workspace}".\n\nVersion: ${result.version}\nURL: ${fullUrl}\n\nYou can now render this artifact using:\n<iframe src="${fullUrl}" width="100%" height="600"></iframe>`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to store artifact: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}