import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { storageInstance } from './storage.js';

const app = new Hono();

// Enable CORS
app.use('*', cors());

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

// Serve stored content
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