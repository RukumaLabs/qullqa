import { homedir, platform } from 'os';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export class StoragePath {
  private static instance: StoragePath;
  private dataDir: string;
  private configDir: string;

  private constructor() {
    const home = homedir();
    const plat = platform();

    // Determine data directory based on platform and XDG spec
    if (process.env.XDG_DATA_HOME) {
      this.dataDir = join(process.env.XDG_DATA_HOME, 'qullqa');
    } else if (plat === 'darwin') {
      this.dataDir = join(home, 'Library', 'Application Support', 'qullqa');
    } else if (plat === 'win32') {
      this.dataDir = join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'qullqa');
    } else {
      // Linux and others - follow XDG Base Directory spec
      this.dataDir = join(home, '.local', 'share', 'qullqa');
    }

    // Determine config directory
    if (process.env.XDG_CONFIG_HOME) {
      this.configDir = join(process.env.XDG_CONFIG_HOME, 'qullqa');
    } else if (plat === 'darwin') {
      this.configDir = join(home, 'Library', 'Preferences', 'qullqa');
    } else if (plat === 'win32') {
      this.configDir = join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'qullqa');
    } else {
      // Linux and others
      this.configDir = join(home, '.config', 'qullqa');
    }
  }

  static getInstance(): StoragePath {
    if (!StoragePath.instance) {
      StoragePath.instance = new StoragePath();
    }
    return StoragePath.instance;
  }

  async ensureDirectories(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
    await mkdir(this.configDir, { recursive: true });
    await mkdir(this.getStorageDir(), { recursive: true });
    await mkdir(this.getArtifactsDir(), { recursive: true });
  }

  getDataDir(): string {
    return this.dataDir;
  }

  getConfigDir(): string {
    return this.configDir;
  }

  getStorageDir(): string {
    return join(this.dataDir, 'storage');
  }

  getArtifactsDir(): string {
    return join(this.dataDir, 'artifacts');
  }

  getConfigFile(): string {
    return join(this.configDir, 'config.json');
  }

  // Get info about storage locations for user
  getInfo(): {
    dataDir: string;
    configDir: string;
    storageDir: string;
    artifactsDir: string;
    configFile: string;
    platform: string;
  } {
    return {
      dataDir: this.dataDir,
      configDir: this.configDir,
      storageDir: this.getStorageDir(),
      artifactsDir: this.getArtifactsDir(),
      configFile: this.getConfigFile(),
      platform: platform()
    };
  }
}

export const storagePath = StoragePath.getInstance();