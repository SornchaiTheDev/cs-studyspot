declare global {
  interface Window {
    env: {
      API_URL: string;
      IS_PROXIED: string;
    };
  }

  namespace NodeJS {
    interface ProcessEnv {
      API_URL: string;
      IS_PROXIED: string;
    }
  }
}

export {};
