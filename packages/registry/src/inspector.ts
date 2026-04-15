import http from 'node:http';
import { registry } from './registry';

/**
 * Starts a simple web server to inspect the ComponentRegistry.
 * 
 * @param port - The port to listen on. Defaults to 3000.
 * @returns The Node.js http.Server instance.
 */
export function startRegistryInspector(port: number = 3000): http.Server {
  const server = http.createServer((req, res) => {
    const components = registry.getAllComponents();

    // JSON API
    if (req.url === '/api' || req.url === '/api/components') {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      });
      const serializableComponents = components.map(c => ({
        id: c.id,
        name: c.name,
        version: c.version,
        tier: c.tier,
        deprecated: c.deprecated ?? false,
        replacement: c.replacement,
        schemaDescription: c.schema.description || 'No description provided'
      }));
      res.end(JSON.stringify({
        total: components.length,
        components: serializableComponents
      }, null, 2));
      return;
    }

    // Simple HTML page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FerroUI Component Registry Inspector</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
      line-height: 1.5;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #f8f9fa;
    }
    h1 { color: #1a73e8; margin-bottom: 8px; }
    .subtitle { color: #5f6368; margin-bottom: 32px; font-size: 1.1em; }
    .stats { 
      background: white; 
      padding: 16px 24px; 
      border-radius: 8px; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: inline-block;
      margin-bottom: 24px;
    }
    .stats strong { font-size: 1.4em; color: #1a73e8; }
    
    table { 
      width: 100%; 
      border-collapse: separate; 
      border-spacing: 0;
      background: white; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
      border-radius: 8px;
      overflow: hidden;
    }
    th { 
      background: #f1f3f4; 
      color: #3c4043; 
      text-align: left; 
      padding: 16px; 
      font-weight: 600;
      border-bottom: 1px solid #dadce0;
    }
    td { 
      padding: 16px; 
      border-bottom: 1px solid #f1f3f4; 
      vertical-align: top;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: #f8f9fa; }
    
    code { 
      background: #f1f3f4; 
      padding: 2px 6px; 
      border-radius: 4px; 
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 0.9em;
    }
    
    .tier { 
      padding: 4px 10px; 
      border-radius: 12px; 
      font-size: 0.75em; 
      font-weight: 700; 
      letter-spacing: 0.5px;
      text-transform: uppercase; 
    }
    .atom { background: #e8f0fe; color: #1967d2; }
    .molecule { background: #f3e8fd; color: #9334e6; }
    .organism { background: #feefe3; color: #e37400; }
    
    .status-active { color: #1e8e3e; font-weight: 500; }
    .status-deprecated { color: #d93025; font-weight: 500; }
    .replacement { font-size: 0.85em; color: #5f6368; display: block; margin-top: 4px; }
    
    .api-hint { margin-top: 40px; font-size: 0.9em; color: #5f6368; }
    .api-hint a { color: #1a73e8; text-decoration: none; }
    .api-hint a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>FerroUI Registry Inspector</h1>
  <p class="subtitle">Real-time view of registered UI components and their architectural tiers.</p>
  
  <div class="stats">
    Registered Components: <strong>${components.length}</strong>
  </div>

  <table>
    <thead>
      <tr>
        <th>Component ID</th>
        <th>Name</th>
        <th>Version</th>
        <th>Tier</th>
        <th>Status</th>
        <th>Schema Description</th>
      </tr>
    </thead>
    <tbody>
      ${components.length === 0 ? `
        <tr>
          <td colspan="6" style="text-align: center; color: #80868b; padding: 40px;">
            No components currently registered.
          </td>
        </tr>
      ` : components.map(c => `
        <tr>
          <td><code>${c.id}</code></td>
          <td>${c.name}</td>
          <td>${c.version}</td>
          <td><span class="tier ${c.tier.toLowerCase()}">${c.tier}</span></td>
          <td>
            ${c.deprecated 
              ? `<span class="status-deprecated">Deprecated</span>
                 ${c.replacement ? `<span class="replacement">Replace with: <code>${c.replacement}</code></span>` : ''}` 
              : '<span class="status-active">Active</span>'}
          </td>
          <td style="color: #5f6368; font-size: 0.9em;">
            ${c.schema.description || '<em>No description available</em>'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <p class="api-hint">
    Looking for raw data? Access the <a href="/api">JSON API</a>.
  </p>
</body>
</html>
    `;
    res.end(html);
  });

  server.listen(port, () => {
    // We log to stderr to avoid polluting stdout if this is used in a pipe, 
    // though console.log is fine for a development tool.
    console.log(`[RegistryInspector] Inspector available at http://localhost:${port}/`);
  });

  return server;
}

/**
 * Safe check to see if this module is being run as the main Node.js process.
 */
function isMainNodeProcess(): boolean {
  try {
    // Check if we are in a Node environment at all
    if (typeof process === 'undefined' || !process.argv || !process.argv[1]) {
      return false;
    }
    
    const mainPath = process.argv[1];
    return (
      mainPath.endsWith('inspector.ts') || 
      mainPath.endsWith('inspector.js') || 
      mainPath.endsWith('inspector')
    );
  } catch {
    return false;
  }
}

// Start if run directly as a Node.js process
if (isMainNodeProcess()) {
  const args = process.argv.slice(2);
  const portArgIdx = args.indexOf('--port');
  const port = portArgIdx !== -1 ? parseInt(args[portArgIdx + 1], 10) : 3002;
  startRegistryInspector(port);
}
