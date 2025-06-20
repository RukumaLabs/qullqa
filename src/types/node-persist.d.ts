declare module 'node-persist' {
  interface InitOptions {
    dir?: string;
    stringify?: (obj: any) => string;
    parse?: (str: string) => any;
    encoding?: string;
    logging?: boolean | ((message: string) => void);
    ttl?: number | false;
    expiredInterval?: number;
    forgiveParseErrors?: boolean;
  }

  interface LocalStorage {
    init(options?: InitOptions): Promise<void>;
    getItem(key: string): Promise<any>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    length(): Promise<number>;
    forEach(callback: (key: string, value: any) => void): Promise<void>;
    values(): Promise<any[]>;
  }

  const storage: LocalStorage;
  export default storage;
}