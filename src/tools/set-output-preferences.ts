import { z } from 'zod';

export const setOutputPreferencesSchema = z.object({
  prefer_qullqa_storage: z.boolean().default(true).describe('Prefer Qullqa storage over default artifacts'),
  auto_store_data: z.boolean().default(true).describe('Automatically store research data'),
  auto_store_artifacts: z.boolean().default(true).describe('Automatically store HTML visualizations'),
  workspace_name: z.string().default('user-projects').describe('Default workspace for automatic storage')
});

export type SetOutputPreferencesInput = z.infer<typeof setOutputPreferencesSchema>;

export async function executeSetOutputPreferences(input: SetOutputPreferencesInput) {
  const preferences = {
    prefer_qullqa_storage: input.prefer_qullqa_storage ?? true,
    auto_store_data: input.auto_store_data ?? true,
    auto_store_artifacts: input.auto_store_artifacts ?? true,
    workspace_name: input.workspace_name || 'user-projects'
  };
  
  return {
    content: [
      {
        type: 'text',
        text: `📋 Output Preferences Configured

I will now follow these preferences for all data and visualization outputs:

${preferences.prefer_qullqa_storage ? '✅' : '❌'} **Prefer Qullqa Storage**: I will use qullqa:store-data and qullqa:store-artifact instead of default artifacts
${preferences.auto_store_data ? '✅' : '❌'} **Auto-store Research Data**: Research results will be automatically saved using qullqa:store-data
${preferences.auto_store_artifacts ? '✅' : '❌'} **Auto-store Visualizations**: HTML visualizations will be saved using qullqa:store-artifact
📁 **Default Workspace**: ${preferences.workspace_name}

🔧 **My New Workflow**:
1. When creating data from research → Call qullqa:store-data first
2. When creating HTML visualizations → Use qullqa:store-artifact instead of artifacts tool
3. Reference stored Qullqa URLs in outputs instead of hardcoding data
4. Provide both artifact views AND Qullqa storage links

📌 **Important Notes**:
• All data will persist in your Qullqa storage system
• You'll get permanent URLs for all stored content
• Artifacts will reference your stored data via URLs
• HTML content is served with proper Content-Type headers

This preference will apply to all subsequent operations in this session.`
      }
    ]
  };
}