// Type definitions for Qullqa MCP server

export interface QullqaConfig {
  // Configuration options can be added here
  debug?: boolean;
}

export interface ToolResult {
  content: Array<{
    type: string;
    text?: string;
    data?: any;
  }>;
}