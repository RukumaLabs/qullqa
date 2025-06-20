import storage from 'node-persist';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface StoredItem {
  name: string;
  content: string;
  contentType: string;
  size: number;
  timestamp: number;
}

export class Storage {
  private initialized = false;
  private storageDir = join(__dirname, '..', 'storage');

  async init(): Promise<void> {
    if (this.initialized) return;
    
    await storage.init({
      dir: this.storageDir,
      stringify: JSON.stringify,
      parse: JSON.parse,
      encoding: 'utf8',
      logging: false,
      ttl: false,
      expiredInterval: 2 * 60 * 1000,
      forgiveParseErrors: false
    });
    
    this.initialized = true;
  }

  async store(name: string, content: string, contentType: string = 'text/plain'): Promise<void> {
    await this.init();
    
    const item: StoredItem = {
      name,
      content,
      contentType,
      size: Buffer.byteLength(content, 'utf8'),
      timestamp: Date.now()
    };
    
    await storage.setItem(name, item);
  }

  async get(name: string): Promise<StoredItem | null> {
    await this.init();
    const item = await storage.getItem(name);
    return item || null;
  }

  async delete(name: string): Promise<boolean> {
    await this.init();
    const exists = await storage.getItem(name);
    if (!exists) return false;
    
    await storage.removeItem(name);
    return true;
  }

  async list(): Promise<StoredItem[]> {
    await this.init();
    const keys = await storage.keys();
    const items: StoredItem[] = [];
    
    for (const key of keys) {
      const item = await storage.getItem(key);
      if (item) {
        items.push(item);
      }
    }
    
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }

  async clear(): Promise<void> {
    await this.init();
    await storage.clear();
  }
}

export const storageInstance = new Storage();