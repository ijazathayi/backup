import http from 'http';
import { exec } from 'child_process';
import { URL } from 'url';

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  
  if (parsedUrl.pathname === '/open') {
    const appName = parsedUrl.searchParams.get('name');
    if (!appName) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('No app name provided');
      return;
    }

    let command = '';
    const cleanApp = appName.toLowerCase().trim();
    
    switch (cleanApp) {
      case 'notepad':
        command = 'notepad.exe';
        break;
      case 'calc':
      case 'calculator':
        command = 'calc.exe';
        break;
      case 'paint':
      case 'mspaint':
        command = 'mspaint.exe';
        break;
      case 'cmd':
      case 'command prompt':
        command = 'start cmd.exe';
        break;
      case 'chrome':
        command = 'start chrome';
        break;
      case 'code':
      case 'vscode':
        command = 'code';
        break;
      case 'explorer':
      case 'file explorer':
        command = 'explorer.exe';
        break;
      default:
        // Safety validation to prevent command injection
        if (/^[a-zA-Z0-9.\-_ ]+$/.test(appName)) {
          command = `start "" "${appName}"`;
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid app name character validation failed');
          return;
        }
    }

    exec(command, (err) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error: ${err.message}`);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Successfully launched ${appName}`);
    });
  } else if (parsedUrl.pathname === '/status') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('online');
  } else if (parsedUrl.pathname === '/api/file' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (data.action === 'create') {
           const fs = await import('fs');
           const path = await import('path');
           
           // Ensure it writes relative to the user's home or a safe directory, or allow absolute if specified
           let targetPath = data.path;
           
           fs.writeFileSync(targetPath, data.content);
           res.writeHead(200, { 'Content-Type': 'application/json' });
           res.end(JSON.stringify({ success: true, message: 'File created' }));
        } else {
           res.writeHead(400, { 'Content-Type': 'application/json' });
           res.end(JSON.stringify({ error: 'Unsupported action' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 3001;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Windows App Launcher server is running on http://127.0.0.1:${PORT}`);
  console.log('Keep this server running to launch arbitrary desktop apps from your web dashboard.');
});
