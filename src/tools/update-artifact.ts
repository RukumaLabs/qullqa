import { z } from 'zod';
import { artifactStorage } from '../artifact-storage.js';

export const updateArtifactSchema = z.object({
  workspace: z.string().min(1).describe('The workspace name'),
  id: z.string().min(1).describe('The artifact identifier'),
  html: z.string().describe('The updated HTML content'),
  changelog: z.string().optional().describe('Description of what changed in this version')
});

export type UpdateArtifactInput = z.infer<typeof updateArtifactSchema>;

export async function executeUpdateArtifact(input: UpdateArtifactInput) {
  try {
    const result = await artifactStorage.updateArtifact(
      input.workspace,
      input.id,
      input.html,
      input.changelog
    );
    
    const fullUrl = `http://localhost:1337${result.url}`;
    const versionUrl = `http://localhost:1337/a/${input.workspace}/${input.id}/v${result.version}/`;
    
    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated artifact "${input.id}" in workspace "${input.workspace}".\n\nNew version: ${result.version}\nLatest URL: ${fullUrl}\nThis version: ${versionUrl}\n\nYou can render the latest version using:\n<iframe src="${fullUrl}" width="100%" height="600"></iframe>`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to update artifact: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}