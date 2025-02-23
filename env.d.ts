declare global {
  interface Window {
    env: {
      API_URL: string;
    };
  }

  namespace NodeJS {
    interface ProcessEnv {
      API_URL: string;
    }
  }
}

export {};
