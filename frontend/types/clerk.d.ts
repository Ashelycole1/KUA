declare global {
  interface Clerk {
    isReady: () => boolean;
    user: any;
    session: any;
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
