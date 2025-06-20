#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { executeStoreData, storeDataSchema } from './tools/store-data.js';
import { executeDeleteData, deleteDataSchema } from './tools/delete-data.js';
import { executeListData, listDataSchema } from './tools/list-data.js';
import { executeServerStatus, serverStatusSchema } from './tools/server-status.js';
import { executeStartServer, startServerSchema } from './tools/start-server.js';
import { executeStoreArtifact, storeArtifactSchema } from './tools/store-artifact.js';
import { executeUpdateArtifact, updateArtifactSchema } from './tools/update-artifact.js';
import { executeGetArtifactUrl, getArtifactUrlSchema } from './tools/get-artifact-url.js';
import { executeListWorkspaces, listWorkspacesSchema } from './tools/list-workspaces.js';
import { executeListWorkspaceArtifacts, listWorkspaceArtifactsSchema } from './tools/list-workspace-artifacts.js';
import { processManager } from './process-manager.js';
import { storageInstance } from './storage.js';
import { artifactStorage } from './artifact-storage.js';

// Create server instance
const server = new Server(
  {
    name: '@wayrapro/qullqa',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'store-data',
        description: 'Store data under a specified name to be served via HTTP',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'The name/key to store the data under',
            },
            content: {
              type: 'string',
              description: 'The content to store',
            },
            contentType: {
              type: 'string',
              description: 'MIME type of the content (e.g., text/html, application/json)',
              default: 'text/plain',
            },
          },
          required: ['name', 'content'],
        },
      },
      {
        name: 'delete-data',
        description: 'Delete stored data by name',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'The name/key of the data to delete',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'list-data',
        description: 'List all stored data items',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'server-status',
        description: 'Check if the HTTP server is running',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'start-server',
        description: 'Start the HTTP server on port 1337',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'store-artifact',
        description: 'Store an HTML artifact with versioning support',
        inputSchema: {
          type: 'object',
          properties: {
            workspace: {
              type: 'string',
              description: 'The workspace name to organize artifacts',
            },
            id: {
              type: 'string',
              description: 'Unique identifier for the artifact (alphanumeric, hyphens, underscores only)',
            },
            html: {
              type: 'string',
              description: 'The HTML content of the artifact',
            },
            description: {
              type: 'string',
              description: 'Optional description of the artifact',
            },
            changelog: {
              type: 'string',
              description: 'Description of this version',
            },
          },
          required: ['workspace', 'id', 'html'],
        },
      },
      {
        name: 'update-artifact',
        description: 'Update an artifact with a new version',
        inputSchema: {
          type: 'object',
          properties: {
            workspace: {
              type: 'string',
              description: 'The workspace name',
            },
            id: {
              type: 'string',
              description: 'The artifact identifier',
            },
            html: {
              type: 'string',
              description: 'The updated HTML content',
            },
            changelog: {
              type: 'string',
              description: 'Description of what changed in this version',
            },
          },
          required: ['workspace', 'id', 'html'],
        },
      },
      {
        name: 'get-artifact-url',
        description: 'Get the URL for an artifact',
        inputSchema: {
          type: 'object',
          properties: {
            workspace: {
              type: 'string',
              description: 'The workspace name',
            },
            id: {
              type: 'string',
              description: 'The artifact identifier',
            },
            version: {
              type: 'number',
              description: 'Specific version number (optional, defaults to latest)',
            },
          },
          required: ['workspace', 'id'],
        },
      },
      {
        name: 'list-workspaces',
        description: 'List all artifact workspaces',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list-workspace-artifacts',
        description: 'List all artifacts in a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            workspace: {
              type: 'string',
              description: 'The workspace name to list artifacts from',
            },
          },
          required: ['workspace'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'store-data': {
      const validatedInput = storeDataSchema.parse(args);
      return await executeStoreData(validatedInput);
    }
    
    case 'delete-data': {
      const validatedInput = deleteDataSchema.parse(args);
      return await executeDeleteData(validatedInput);
    }
    
    case 'list-data': {
      const validatedInput = listDataSchema.parse(args);
      return await executeListData(validatedInput);
    }
    
    case 'server-status': {
      const validatedInput = serverStatusSchema.parse(args);
      return await executeServerStatus(validatedInput);
    }
    
    case 'start-server': {
      const validatedInput = startServerSchema.parse(args);
      return await executeStartServer(validatedInput);
    }
    
    case 'store-artifact': {
      const validatedInput = storeArtifactSchema.parse(args);
      return await executeStoreArtifact(validatedInput);
    }
    
    case 'update-artifact': {
      const validatedInput = updateArtifactSchema.parse(args);
      return await executeUpdateArtifact(validatedInput);
    }
    
    case 'get-artifact-url': {
      const validatedInput = getArtifactUrlSchema.parse(args);
      return await executeGetArtifactUrl(validatedInput);
    }
    
    case 'list-workspaces': {
      const validatedInput = listWorkspacesSchema.parse(args);
      return await executeListWorkspaces(validatedInput);
    }
    
    case 'list-workspace-artifacts': {
      const validatedInput = listWorkspaceArtifactsSchema.parse(args);
      return await executeListWorkspaceArtifacts(validatedInput);
    }
    
    default:
      throw new Error(`Tool not found: ${name}`);
  }
});

// Start the server
async function main() {
  // Initialize storage
  await storageInstance.init();
  await artifactStorage.init();
  
  // Check if HTTP server is running
  const serverRunning = await processManager.isServerRunning();
  if (!serverRunning) {
    console.error('⚠️  HTTP server is not running. Use the start-server tool to start it.');
  }
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Qullqa MCP server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});