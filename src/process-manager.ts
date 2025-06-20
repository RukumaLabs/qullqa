import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 1337;
const PID_FILE = join(__dirname, '..', '.http-server.pid');

export class ProcessManager {
  async isServerRunning(): Promise<boolean> {
    try {
      // Check if port is in use
      const { stdout } = await execAsync(`lsof -i :${PORT} -P -n | grep LISTEN || true`);
      return stdout.trim().length > 0;
    } catch {
      // Fallback method - try to connect
      try {
        const response = await fetch(`http://localhost:${PORT}/`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(1000)
        });
        return response.ok;
      } catch {
        return false;
      }
    }
  }

  async startServer(): Promise<{ success: boolean; message: string }> {
    // Check if already running
    if (await this.isServerRunning()) {
      return {
        success: true,
        message: `Server is already running on port ${PORT}`
      };
    }

    try {
      // Create a standalone script to run the server
      const serverScript = `
import { startHttpServer } from './http-server.js';
import { storageInstance } from './storage.js';

// Initialize storage
await storageInstance.init();

// Start server
startHttpServer(${PORT});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('HTTP server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('HTTP server shutting down...');
  process.exit(0);
});
`;

      const scriptPath = join(__dirname, 'standalone-server.js');
      writeFileSync(scriptPath, serverScript);

      // Spawn the server process
      const child = spawn('node', [scriptPath], {
        detached: true,
        stdio: 'ignore',
        env: { ...process.env }
      });

      // Unref the child so our process can exit
      child.unref();

      // Save PID
      if (child.pid) {
        writeFileSync(PID_FILE, child.pid.toString());
      }

      // Wait a bit to ensure server starts
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify it started
      if (await this.isServerRunning()) {
        return {
          success: true,
          message: `HTTP server started on http://localhost:${PORT}`
        };
      } else {
        return {
          success: false,
          message: 'Server failed to start - check logs'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async stopServer(): Promise<{ success: boolean; message: string }> {
    try {
      // Try to read PID from file
      if (existsSync(PID_FILE)) {
        const pid = readFileSync(PID_FILE, 'utf-8').trim();
        try {
          process.kill(parseInt(pid), 'SIGTERM');
        } catch {
          // Process might already be dead
        }
      }

      // Also try to kill by port
      try {
        await execAsync(`lsof -ti :${PORT} | xargs kill -TERM 2>/dev/null || true`);
      } catch {
        // Ignore errors
      }

      return {
        success: true,
        message: 'Server stop signal sent'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to stop server: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getServerInfo(): Promise<{
    running: boolean;
    port: number;
    url: string;
    pid?: number;
  }> {
    const running = await this.isServerRunning();
    let pid: number | undefined;

    if (running && existsSync(PID_FILE)) {
      try {
        pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim());
      } catch {
        // Ignore
      }
    }

    return {
      running,
      port: PORT,
      url: `http://localhost:${PORT}`,
      pid
    };
  }
}

export const processManager = new ProcessManager();