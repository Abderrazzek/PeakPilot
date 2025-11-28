/**
 * TypeScript declarations for Reactotron
 */

declare global {
  interface Console {
    tron?: {
      log: (...args: any[]) => void;
      warn: (...args: any[]) => void;
      error: (...args: any[]) => void;
      display: (config: { name: string; value: any; preview?: string }) => void;
      clear?: () => void;
    };
  }
}

export {};
