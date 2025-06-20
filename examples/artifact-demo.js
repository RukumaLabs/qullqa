#!/usr/bin/env node

/**
 * Demo script for the Qullqa artifact versioning system
 * 
 * This script demonstrates:
 * 1. Creating a new artifact
 * 2. Updating it with new versions
 * 3. Listing versions
 * 4. Reverting to a previous version
 */

console.log(`
========================================
Qullqa Artifact Versioning Demo
========================================

This demo shows how to use the artifact versioning system.

Available MCP tools:
- store-artifact: Create a new versioned artifact
- update-artifact: Add a new version to an existing artifact
- get-artifact: Retrieve an artifact (specific version or latest)
- list-artifacts: List all artifacts with filters
- list-artifact-versions: Show version history
- revert-artifact: Revert to a previous version

Example workflow:

1. Create a new code artifact:
   Tool: store-artifact
   Input: {
     "name": "MyComponent.tsx",
     "content": "import React from 'react';\\n\\nexport const MyComponent = () => {\\n  return <div>Hello World!</div>;\\n};",
     "contentType": "text/typescript",
     "type": "code",
     "description": "A simple React component",
     "tags": ["react", "component"],
     "language": "typescript",
     "changelog": "Initial version"
   }

2. Update the artifact with improvements:
   Tool: update-artifact
   Input: {
     "artifactId": "<artifact-id-from-step-1>",
     "content": "import React from 'react';\\n\\ninterface Props {\\n  name: string;\\n}\\n\\nexport const MyComponent: React.FC<Props> = ({ name }) => {\\n  return <div>Hello {name}!</div>;\\n};",
     "changelog": "Added Props interface and name prop"
   }

3. List all versions:
   Tool: list-artifact-versions
   Input: {
     "artifactId": "<artifact-id-from-step-1>"
   }

4. View a specific version:
   Tool: get-artifact
   Input: {
     "artifactId": "<artifact-id-from-step-1>",
     "version": 1
   }

5. Revert to version 1:
   Tool: revert-artifact
   Input: {
     "artifactId": "<artifact-id-from-step-1>",
     "targetVersion": 1
   }

HTTP Access:
- View all artifacts: http://localhost:1337/artifacts
- View latest version: http://localhost:1337/artifacts/{artifactId}
- View specific version: http://localhost:1337/artifacts/{artifactId}/v/{version}
- Get version history (JSON): http://localhost:1337/artifacts/{artifactId}/versions

Features:
✓ Non-destructive versioning (all versions preserved)
✓ Version comparison and diffing
✓ Changelog tracking
✓ Type categorization (code, document, diagram, html, data)
✓ Tag-based filtering
✓ Revert to any previous version
✓ CORS-enabled for Claude integration
`);