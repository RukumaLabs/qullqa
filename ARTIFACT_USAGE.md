# Qullqa Artifact Hosting Usage Guide

## Overview
Qullqa now serves as an artifact hosting platform for Claude, allowing you to store HTML artifacts with versioning and serve them via iframes.

## How to Use

### 1. Store Your First Artifact
In Claude, use the `store-artifact` tool:
```
store-artifact workspace="my-project" id="dashboard" html="<html><body><h1>My Dashboard</h1></body></html>"
```

The tool will return a URL like: `http://localhost:1337/a/my-project/dashboard/`

### 2. Render in Claude
Claude can now render your artifact using an iframe:
```html
<iframe src="http://localhost:1337/a/my-project/dashboard/" width="100%" height="600"></iframe>
```

### 3. Update Your Artifact
When you make changes, use `update-artifact`:
```
update-artifact workspace="my-project" id="dashboard" html="<html><body><h1>Updated Dashboard</h1></body></html>" changelog="Added new features"
```

### 4. Access Specific Versions
- Latest: `http://localhost:1337/a/my-project/dashboard/`
- Version 1: `http://localhost:1337/a/my-project/dashboard/v1/`
- Version 2: `http://localhost:1337/a/my-project/dashboard/v2/`

## MCP Tools

- **store-artifact**: Create new artifacts
- **update-artifact**: Update existing artifacts (creates new version)
- **get-artifact-url**: Get URL for any artifact/version
- **list-workspaces**: See all your workspaces
- **list-workspace-artifacts**: List artifacts in a workspace

## Web Interface
Browse all artifacts at: http://localhost:1337/a/

## Key Features
- All versions preserved forever
- Direct iframe compatibility
- Workspace organization
- CORS enabled for Claude artifacts
- Simple file-based storage

## Example Workflow
1. Create an HTML artifact in Claude
2. Store it with `store-artifact`
3. Get back a URL
4. Render it in Claude with an iframe
5. Make updates with `update-artifact`
6. All versions remain accessible