import { readFile, writeFile } from 'fs/promises';
import { storagePath } from './storage-path.js';

export interface QullqaConfig {
  defaultWorkspace?: string;
  cssFramework?: 'tailwind' | 'daisyui' | 'bootstrap' | 'bulma' | 'none';
  useCdn?: boolean;
  includeModernPractices?: boolean;
  serverPort?: number;
}

export class Config {
  private static instance: Config;
  private config: QullqaConfig = {};
  private configFile: string;

  private constructor() {
    this.configFile = storagePath.getConfigFile();
  }

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  async load(): Promise<void> {
    try {
      await storagePath.ensureDirectories();
      const data = await readFile(this.configFile, 'utf-8');
      this.config = JSON.parse(data);
    } catch {
      // Config doesn't exist yet, use defaults
      this.config = {
        defaultWorkspace: 'user-projects',
        cssFramework: 'tailwind',
        useCdn: true,
        includeModernPractices: true,
        serverPort: 1337
      };
    }
  }

  async save(): Promise<void> {
    await storagePath.ensureDirectories();
    await writeFile(this.configFile, JSON.stringify(this.config, null, 2));
  }

  get(key: keyof QullqaConfig): any {
    return this.config[key];
  }

  set(key: keyof QullqaConfig, value: any): void {
    this.config[key] = value;
  }

  getAll(): QullqaConfig {
    return { ...this.config };
  }
}

export const config = Config.getInstance();