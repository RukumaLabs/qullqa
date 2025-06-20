import { z } from 'zod';

export const setOutputPreferencesSchema = z.object({
  prefer_qullqa_storage: z.boolean().default(true).describe('Prefer Qullqa storage over default artifacts'),
  auto_store_data: z.boolean().default(true).describe('Automatically store research data'),
  auto_store_artifacts: z.boolean().default(true).describe('Automatically store HTML visualizations'),
  workspace_name: z.string().default('user-projects').describe('Default workspace for automatic storage'),
  css_framework: z.enum(['tailwind', 'daisyui', 'bootstrap', 'bulma', 'none']).default('tailwind').describe('Preferred CSS framework for HTML artifacts'),
  use_cdn: z.boolean().default(true).describe('Use CDN links for CSS frameworks'),
  include_modern_practices: z.boolean().default(true).describe('Include modern web practices (dark mode, accessibility, responsive design)')
});

export type SetOutputPreferencesInput = z.infer<typeof setOutputPreferencesSchema>;

export async function executeSetOutputPreferences(input: SetOutputPreferencesInput) {
  const preferences = {
    prefer_qullqa_storage: input.prefer_qullqa_storage ?? true,
    auto_store_data: input.auto_store_data ?? true,
    auto_store_artifacts: input.auto_store_artifacts ?? true,
    workspace_name: input.workspace_name || 'user-projects',
    css_framework: input.css_framework || 'tailwind',
    use_cdn: input.use_cdn ?? true,
    include_modern_practices: input.include_modern_practices ?? true
  };
  
  // CDN links for various CSS frameworks
  const cdnLinks = {
    tailwind: {
      css: '<script src="https://cdn.tailwindcss.com"></script>',
      description: 'Tailwind CSS Play CDN (for development/prototyping)',
      extra: '<!-- For production, use Tailwind CLI or PostCSS -->'
    },
    daisyui: {
      css: `<link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.14/dist/full.min.css" rel="stylesheet" type="text/css" />
<script src="https://cdn.tailwindcss.com"></script>`,
      description: 'DaisyUI + Tailwind CSS',
      extra: '<!-- DaisyUI provides semantic component classes on top of Tailwind -->'
    },
    bootstrap: {
      css: '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">',
      description: 'Bootstrap 5',
      extra: '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>'
    },
    bulma: {
      css: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css">',
      description: 'Bulma CSS',
      extra: '<!-- Pure CSS framework, no JavaScript required -->'
    },
    none: {
      css: '',
      description: 'No CSS framework',
      extra: ''
    }
  };
  
  const selectedFramework = cdnLinks[preferences.css_framework];
  
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

🎨 **CSS Framework Preferences**:
${preferences.use_cdn ? '✅' : '❌'} **Use CDN**: ${preferences.use_cdn ? 'Include CDN links for quick prototyping' : 'No CDN links'}
🎯 **Framework**: ${preferences.css_framework === 'none' ? 'No framework' : selectedFramework.description}
${preferences.include_modern_practices ? '✅' : '❌'} **Modern Practices**: ${preferences.include_modern_practices ? 'Include dark mode, accessibility, responsive design' : 'Basic HTML only'}

🔧 **My Enhanced Workflow**:
1. When creating data from research → Call qullqa:store-data first
2. When creating HTML visualizations:
   • Use qullqa:store-artifact instead of artifacts tool
   • Include this in <head>:
     ${selectedFramework.css}
     ${selectedFramework.extra}
   ${preferences.include_modern_practices ? `• Add dark mode support with class="dark:bg-gray-900"
   • Include proper meta viewport tag
   • Use semantic HTML and ARIA labels
   • Ensure responsive design with mobile-first approach` : ''}
3. Reference stored Qullqa URLs in outputs instead of hardcoding data
4. Provide both artifact views AND Qullqa storage links

📚 **HTML Template I'll Use**:
\`\`\`html
<!DOCTYPE html>
<html lang="en"${preferences.css_framework === 'tailwind' || preferences.css_framework === 'daisyui' ? ' class="h-full"' : ''}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Title</title>
    ${selectedFramework.css}
    ${selectedFramework.extra}
</head>
<body${preferences.css_framework === 'tailwind' || preferences.css_framework === 'daisyui' ? ' class="h-full bg-white dark:bg-gray-900"' : ''}>
    <!-- Your content here -->
</body>
</html>
\`\`\`

📌 **Storage Location Info**:
Your Qullqa data is stored in your user directory for persistence across sessions.

This preference will apply to all subsequent operations in this session.`
      }
    ]
  };
}