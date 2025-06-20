# Qullqa Artifact Versioning System

The Qullqa MCP server now includes a powerful artifact versioning system that allows you to store and manage multiple versions of content, similar to how Claude manages artifacts.

## Overview

Artifacts are versioned content items that can be:
- **Code** - Source code files with syntax highlighting
- **Documents** - Markdown, text, or other document formats
- **Diagrams** - SVG diagrams and visualizations
- **HTML** - Web pages and interactive content
- **Data** - JSON, CSV, or other data formats

Each artifact maintains a complete version history with non-destructive editing, changelogs, and the ability to revert to any previous version.

## Key Features

- 📚 **Version History** - Every change creates a new version
- 🔄 **Non-Destructive** - All versions are preserved
- 📝 **Changelogs** - Track what changed in each version
- 🏷️ **Tags & Metadata** - Organize with tags and descriptions
- ⏪ **Revert** - Restore any previous version
- 🌐 **Web Interface** - Browse artifacts and versions
- 🔗 **Direct URLs** - Access specific versions via HTTP

## MCP Tools

### store-artifact
Creates a new artifact with an initial version.

```json
{
  "name": "MyComponent.tsx",
  "content": "import React from 'react'...",
  "contentType": "text/typescript",
  "type": "code",
  "description": "A React component",
  "tags": ["react", "typescript"],
  "language": "typescript",
  "changelog": "Initial version"
}
```

### update-artifact
Adds a new version to an existing artifact.

```json
{
  "artifactId": "uuid-here",
  "content": "Updated content...",
  "contentType": "text/typescript",
  "changelog": "Added error handling"
}
```

### get-artifact
Retrieves an artifact's content and metadata.

```json
{
  "artifactId": "uuid-here",
  "version": 2  // Optional, defaults to latest
}
```

### list-artifacts
Lists all artifacts with optional filters.

```json
{
  "type": "code",     // Optional filter
  "tag": "react"      // Optional filter
}
```

### list-artifact-versions
Shows the complete version history of an artifact.

```json
{
  "artifactId": "uuid-here"
}
```

### revert-artifact
Creates a new version by reverting to a previous version.

```json
{
  "artifactId": "uuid-here",
  "targetVersion": 1
}
```

## HTTP Endpoints

### Web Interface
- `GET /artifacts` - Browse all artifacts
- `GET /` - Original simple storage interface

### Artifact Access
- `GET /artifacts/{id}` - Latest version content
- `GET /artifacts/{id}/v/{version}` - Specific version content
- `GET /artifacts/{id}/versions` - Version history (JSON)

### API Endpoints
- `POST /api/artifacts` - Create new artifact
- `PUT /api/artifacts/{id}` - Update artifact (new version)
- `DELETE /api/artifacts/{id}/v/{version}` - Delete specific version

## Storage Structure

Artifacts are stored in `/storage/artifacts/{artifactId}/` with:
- `manifest.json` - Artifact metadata and version list
- Version content embedded in the manifest

## Example Workflow

1. **Create an artifact**
   ```
   Use store-artifact to create "UserProfile.tsx" as a code artifact
   Returns: artifactId (e.g., "a1b2c3d4-...")
   ```

2. **Update with changes**
   ```
   Use update-artifact with the artifactId
   Provide new content and changelog
   Creates version 2
   ```

3. **View version history**
   ```
   Use list-artifact-versions to see all versions
   Shows version numbers, timestamps, and changelogs
   ```

4. **Access via HTTP**
   ```
   http://localhost:1337/artifacts/a1b2c3d4-...     (latest)
   http://localhost:1337/artifacts/a1b2c3d4-.../v/1 (version 1)
   ```

5. **Revert if needed**
   ```
   Use revert-artifact to restore version 1
   Creates version 3 with version 1's content
   ```

## Integration with Claude

The artifact system is designed to work seamlessly with Claude:
- CORS is enabled for all artifact endpoints
- Content types are preserved for proper rendering
- Version headers indicate the current version
- JSON API available for programmatic access

## Backward Compatibility

The original simple storage system remains available:
- All existing tools (store-data, delete-data, etc.) continue to work
- Legacy routes (/:name) are preserved
- Both systems can be used simultaneously