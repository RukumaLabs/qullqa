import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { storageInstance } from './storage.js';
import { artifactStorage } from './artifact-storage.js';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Hono();

// Enable CORS with permissive settings for Claude artifacts
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 3600,
  credentials: true,
}));

// Root route - HTML interface
app.get('/', async (c) => {
  const items = await storageInstance.list();
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Qullqa Storage Server</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .item-list {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
        }
        .item:last-child {
            border-bottom: none;
        }
        .item-info {
            flex: 1;
        }
        .item-name {
            font-weight: bold;
            color: #007bff;
            text-decoration: none;
            font-size: 18px;
        }
        .item-name:hover {
            text-decoration: underline;
        }
        .item-meta {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
        .delete-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .delete-btn:hover {
            background: #c82333;
        }
        .empty {
            text-align: center;
            color: #666;
            padding: 40px;
        }
        .stats {
            background: #e9ecef;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>Qullqa Storage Server</h1>
    <div class="nav" style="margin-bottom: 20px;">
        <a href="/artifacts" style="color: #007bff; text-decoration: none;">→ View Artifacts (Versioned Storage)</a>
    </div>
    <div class="stats">
        <strong>${items.length}</strong> items stored | 
        <strong>${items.reduce((sum, item) => sum + item.size, 0).toLocaleString()}</strong> bytes total
    </div>
    <div class="item-list">
        ${items.length === 0 ? 
          '<div class="empty">No items stored yet. Use the MCP tools to store data.</div>' :
          items.map(item => `
            <div class="item">
                <div class="item-info">
                    <a href="/${encodeURIComponent(item.name)}" class="item-name">${item.name}</a>
                    <div class="item-meta">
                        ${item.contentType} • ${item.size.toLocaleString()} bytes • 
                        ${new Date(item.timestamp).toLocaleString()}
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteItem('${item.name}')">Delete</button>
            </div>
          `).join('')
        }
    </div>
    <script>
        async function deleteItem(name) {
            if (!confirm(\`Delete "\${name}"?\`)) return;
            
            try {
                const response = await fetch(\`/api/delete/\${encodeURIComponent(name)}\`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    location.reload();
                } else {
                    alert('Failed to delete item');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    </script>
</body>
</html>
  `;
  
  return c.html(html);
});

// API endpoint for listing items
app.get('/api/list', async (c) => {
  const items = await storageInstance.list();
  return c.json({ items });
});

// API endpoint for deletion
app.delete('/api/delete/:name', async (c) => {
  const name = c.req.param('name');
  const deleted = await storageInstance.delete(name);
  
  if (deleted) {
    return c.json({ success: true });
  } else {
    return c.json({ error: 'Item not found' }, 404);
  }
});

// ===== ARTIFACT ROUTES =====

// List all workspaces
app.get('/a/', async (c) => {
  const workspaces = await artifactStorage.listWorkspaces();
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Qullqa Artifact Workspaces</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .nav {
            margin-bottom: 20px;
        }
        .nav a {
            color: #007bff;
            text-decoration: none;
            margin-right: 20px;
        }
        .nav a:hover {
            text-decoration: underline;
        }
        .workspace-list {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .workspace {
            display: block;
            padding: 15px;
            border-bottom: 1px solid #eee;
            color: #007bff;
            text-decoration: none;
            font-size: 18px;
        }
        .workspace:hover {
            background: #f8f9fa;
        }
        .empty {
            text-align: center;
            color: #666;
            padding: 40px;
        }
    </style>
</head>
<body>
    <h1>Artifact Workspaces</h1>
    <div class="nav">
        <a href="/">← Back to Simple Storage</a>
    </div>
    <div class="workspace-list">
        ${workspaces.length === 0 ? 
          '<div class="empty">No workspaces yet. Use the store-artifact tool to create your first artifact.</div>' :
          workspaces.map(ws => `<a href="/a/${ws}/" class="workspace">${ws}</a>`).join('')
        }
    </div>
</body>
</html>
  `;
  
  return c.html(html);
});

// List artifacts in a workspace
app.get('/a/:workspace/', async (c) => {
  const workspace = c.req.param('workspace');
  const artifacts = await artifactStorage.listWorkspaceArtifacts(workspace);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${workspace} - Qullqa Artifacts</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .nav {
            margin-bottom: 20px;
        }
        .nav a {
            color: #007bff;
            text-decoration: none;
            margin-right: 20px;
        }
        .nav a:hover {
            text-decoration: underline;
        }
        .artifact-list {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .artifact {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
        }
        .artifact:last-child {
            border-bottom: none;
        }
        .artifact-info {
            flex: 1;
        }
        .artifact-name {
            font-weight: bold;
            color: #007bff;
            text-decoration: none;
            font-size: 18px;
        }
        .artifact-name:hover {
            text-decoration: underline;
        }
        .artifact-meta {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
        .empty {
            text-align: center;
            color: #666;
            padding: 40px;
        }
    </style>
</head>
<body>
    <h1>Workspace: ${workspace}</h1>
    <div class="nav">
        <a href="/a/">← Back to Workspaces</a>
        <a href="/">← Back to Simple Storage</a>
    </div>
    <div class="artifact-list">
        ${artifacts.length === 0 ? 
          '<div class="empty">No artifacts in this workspace yet.</div>' :
          artifacts.map(artifact => `
            <div class="artifact">
                <div class="artifact-info">
                    <a href="/a/${workspace}/${artifact.id}/" class="artifact-name">${artifact.id}</a>
                    <div class="artifact-meta">
                        Version ${artifact.currentVersion} • 
                        ${artifact.versions.length} total versions • 
                        Updated ${new Date(artifact.updatedAt).toLocaleString()}
                        ${artifact.description ? `<br>Description: ${artifact.description}` : ''}
                    </div>
                </div>
            </div>
          `).join('')
        }
    </div>
</body>
</html>
  `;
  
  return c.html(html);
});

// Redirect to latest version
app.get('/a/:workspace/:id', async (c) => {
  const workspace = c.req.param('workspace');
  const id = c.req.param('id');
  return c.redirect(`/a/${workspace}/${id}/`);
});

// Serve artifact latest version
app.get('/a/:workspace/:id/', async (c) => {
  const workspace = c.req.param('workspace');
  const id = c.req.param('id');
  
  try {
    const artifactPath = join(__dirname, '..', 'artifacts', workspace, id, 'latest', 'index.html');
    const html = await readFile(artifactPath, 'utf-8');
    
    c.header('X-Frame-Options', 'ALLOWALL');
    c.header('Content-Security-Policy', "frame-ancestors *");
    return c.html(html);
  } catch (error) {
    return c.text('Artifact not found', 404);
  }
});

// Serve specific version
app.get('/a/:workspace/:id/v:version/', async (c) => {
  const workspace = c.req.param('workspace');
  const id = c.req.param('id');
  const version = c.req.param('version');
  
  try {
    const versionPath = join(__dirname, '..', 'artifacts', workspace, id, 'versions', `v${version}`, 'index.html');
    const html = await readFile(versionPath, 'utf-8');
    
    c.header('X-Frame-Options', 'ALLOWALL');
    c.header('Content-Security-Policy', "frame-ancestors *");
    return c.html(html);
  } catch (error) {
    return c.text('Version not found', 404);
  }
});

// Serve stored content (legacy route for simple storage)
app.get('/:name', async (c) => {
  const name = c.req.param('name');
  const item = await storageInstance.get(name);
  
  if (!item) {
    return c.text('Not Found', 404);
  }
  
  c.header('Content-Type', item.contentType);
  c.header('Content-Length', item.size.toString());
  return c.text(item.content);
});

export function startHttpServer(port: number = 1337): void {
  serve({
    fetch: app.fetch,
    port,
  });
  
  console.log(`HTTP server started on http://localhost:${port}`);
}