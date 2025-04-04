declare module 'firebase' {
  export interface FirebaseApp {
    // Add any Firebase app types you need
  }
  
  export interface FirebaseOptions {
    // Add any Firebase options types you need
  }
  
  export function initializeApp(options: FirebaseOptions): FirebaseApp;
  // Add any other Firebase functions you need
} 