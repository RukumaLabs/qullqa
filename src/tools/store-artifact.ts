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
    const versionUrl = `http://localhost:1337/a/${input.workspace}/${input.id}/v${result.version}/`;
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ HTML Artifact Stored Successfully!

📦 Artifact Details:
• Workspace: ${input.workspace}
• ID: ${input.id}
• Version: ${result.version}
${input.description ? `• Description: ${input.description}` : ''}

🌐 Access URLs:
• Latest version: ${fullUrl}
• This version (v${result.version}): ${versionUrl}
• Content-Type: text/html; charset=utf-8

📋 Usage Examples:

1. Direct link: ${fullUrl}

2. Embed in iframe:
<iframe src="${fullUrl}" width="100%" height="600"></iframe>

3. Open in new tab:
<a href="${fullUrl}" target="_blank">Open artifact</a>

ℹ️ Note: This artifact is served as HTML and will render in browsers. Updates will create new versions while preserving history.`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Failed to store artifact: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}