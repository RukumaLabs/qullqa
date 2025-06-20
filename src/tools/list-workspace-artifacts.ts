import { z } from 'zod';
import { artifactStorage } from '../artifact-storage.js';

export const listWorkspaceArtifactsSchema = z.object({
  workspace: z.string().min(1).describe('The workspace name to list artifacts from')
});

export type ListWorkspaceArtifactsInput = z.infer<typeof listWorkspaceArtifactsSchema>;

export async function executeListWorkspaceArtifacts(input: ListWorkspaceArtifactsInput) {
  try {
    const artifacts = await artifactStorage.listWorkspaceArtifacts(input.workspace);
    
    if (artifacts.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No artifacts found in workspace "${input.workspace}". Use the store-artifact tool to create one.`
          }
        ]
      };
    }
    
    const artifactList = artifacts
      .map(artifact => {
        const url = `http://localhost:1337/a/${artifact.workspace}/${artifact.id}/`;
        const updated = new Date(artifact.updatedAt).toLocaleString();
        return `• ${artifact.id} (v${artifact.currentVersion})\n  URL: ${url}\n  Updated: ${updated}${artifact.description ? `\n  Description: ${artifact.description}` : ''}`;
      })
      .join('\n\n');
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${artifacts.length} artifact${artifacts.length === 1 ? '' : 's'} in workspace "${input.workspace}":\n\n${artifactList}\n\nBrowse all artifacts at: http://localhost:1337/a/`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to list artifacts: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}