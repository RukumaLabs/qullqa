# Qullqa MCP Server

Qullqa is a Model Context Protocol (MCP) server that provides persistent storage capabilities with both simple key-value storage and advanced artifact versioning. It includes an HTTP server for web access to stored content.

## Features

### 🗄️ Simple Storage
- Key-value storage for any text content
- Support for different content types (HTML, JSON, text, etc.)
- Direct HTTP access to stored content
- Web interface for browsing and managing items

### 📚 Artifact Versioning (New!)
- Full version history with non-destructive editing
- Support for code, documents, diagrams, HTML, and data
- Changelog tracking for each version
- Tags and metadata for organization
- Revert to any previous version
- Version comparison and diffing

### 🌐 HTTP Server
- Serves stored content via HTTP
- CORS-enabled for Claude integration
- Web interfaces for both storage systems
- RESTful API endpoints

## Installation

```bash
npm install
npm run build
```

## Usage

### Starting the MCP Server

The MCP server is typically started by Claude or another MCP client. Configure it in your MCP settings:

```json
{
  "qullqa": {
    "command": "node",
    "args": ["/path/to/qullqa/dist/index.js"]
  }
}
```

### Starting the HTTP Server

Use the MCP tool or run directly:

```bash
# Via MCP tool (recommended)
start-server

# Or directly
npm run start-server
```

The HTTP server runs on `http://localhost:1337`

## MCP Tools

### Simple Storage Tools

- **store-data** - Store content with a name
- **delete-data** - Delete stored content
- **list-data** - List all stored items
- **server-status** - Check HTTP server status
- **start-server** - Start the HTTP server

### Artifact Versioning Tools

- **store-artifact** - Create a new versioned artifact
- **update-artifact** - Add a new version to an artifact
- **get-artifact** - Retrieve artifact content
- **list-artifacts** - List all artifacts
- **list-artifact-versions** - Show version history
- **revert-artifact** - Revert to a previous version

## Web Interfaces

### Simple Storage
Access at `http://localhost:1337/`
- View all stored items
- Click to view content
- Delete items
- See storage statistics

### Artifacts
Access at `http://localhost:1337/artifacts`
- Browse all artifacts
- View version information
- Filter by type
- Access specific versions

## API Endpoints

### Simple Storage
- `GET /:name` - Get stored content
- `GET /api/list` - List all items (JSON)
- `DELETE /api/delete/:name` - Delete an item

### Artifacts
- `GET /artifacts` - Web interface
- `GET /artifacts/:id` - Latest version content
- `GET /artifacts/:id/v/:version` - Specific version
- `GET /artifacts/:id/versions` - Version history (JSON)
- `POST /api/artifacts` - Create artifact
- `PUT /api/artifacts/:id` - Update artifact
- `DELETE /api/artifacts/:id/v/:version` - Delete version

## Storage Structure

```
storage/
├── artifacts/          # Versioned artifacts
│   └── {artifactId}/
│       └── manifest.json
└── {hash}             # Simple storage items
```

## Examples

### Simple Storage
```javascript
// Store HTML content
store-data({
  name: "my-page.html",
  content: "<h1>Hello World</h1>",
  contentType: "text/html"
})

// Access at: http://localhost:1337/my-page.html
```

### Artifact Versioning
```javascript
// Create versioned code artifact
store-artifact({
  name: "app.js",
  content: "console.log('v1');",
  type: "code",
  contentType: "text/javascript",
  changelog: "Initial version"
})

// Update with new version
update-artifact({
  artifactId: "...",
  content: "console.log('v2');",
  changelog: "Updated message"
})
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Start HTTP server standalone
npm run start-server
```

## License

MIT