import { z } from 'zod';
import { artifactStorage } from '../artifact-storage.js';

export const getArtifactUrlSchema = z.object({
  workspace: z.string().min(1).describe('The workspace name'),
  id: z.string().min(1).describe('The artifact identifier'),
  version: z.number().positive().optional().describe('Specific version number (optional, defaults to latest)')
});

export type GetArtifactUrlInput = z.infer<typeof getArtifactUrlSchema>;

export async function executeGetArtifactUrl(input: GetArtifactUrlInput) {
  try {
    const url = await artifactStorage.getArtifactUrl(
      input.workspace,
      input.id,
      input.version
    );
    
    const fullUrl = `http://localhost:1337${url}`;
    const metadata = await artifactStorage.getArtifactMetadata(input.workspace, input.id);
    
    let text = `Artifact URL: ${fullUrl}\n\n`;
    
    if (metadata) {
      text += `Current version: ${metadata.currentVersion}\n`;
      text += `Total versions: ${metadata.versions.length}\n`;
      if (metadata.description) {
        text += `Description: ${metadata.description}\n`;
      }
    }
    
    text += `\nYou can render this artifact using:\n<iframe src="${fullUrl}" width="100%" height="600"></iframe>`;
    
    return {
      content: [
        {
          type: 'text',
          text
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to get artifact URL: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}