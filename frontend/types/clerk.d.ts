declare global {
  interface Clerk {
    isReady: () => boolean;
    user: any;
    session: {
      getToken: (options: { template: string }) => Promise<string>;
    } | null;
    openSignIn: (props?: any) => void;
    openSignUp: (props?: any) => void;
    signOut: (callback?: () => void) => void;
    addListener: (callback: (data: { user: any; session: any }) => void) => void;
  }

  interface Window {
    Clerk?: Clerk;
  }
}

export {};
