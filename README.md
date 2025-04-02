# ROTA Tracker React

A React application for managing employee rosters, shifts, and schedules.

## Features

- Employee management
- Shift management
- Weekly schedule planning
- Calendar view for shift assignments
- Firebase integration for data persistence

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up Firebase:
   - Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Create a web app in your Firebase project
   - Copy the Firebase configuration from the Firebase console
   - Update the `src/firebase/config.ts` file with your Firebase configuration

### Running the Application

```
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database:

   - Go to Firestore Database in the Firebase console
   - Click "Create Database"
   - Choose "Start in production mode" or "Start in test mode" (for development)
   - Select a location for your database
   - Click "Enable"

3. Create a web app in your Firebase project:

   - Click on the web icon (</>) in the Firebase console
   - Register your app with a nickname
   - Copy the Firebase configuration object

4. Update the Firebase configuration in your project:

   - Open `src/firebase/config.ts`
   - Replace the placeholder values with your actual Firebase configuration:
     ```typescript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID",
       measurementId: "YOUR_MEASUREMENT_ID",
     };
     ```

5. Set up Firestore security rules:
   - Go to Firestore Database > Rules in the Firebase console
   - Update the rules to allow read/write access for your application:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if true; // For development only
         }
       }
     }
     ```
   - For production, implement proper authentication and more restrictive rules

## Project Structure

- `src/components`: Reusable UI components
- `src/context`: React context for state management
- `src/firebase`: Firebase configuration and services
- `src/hooks`: Custom React hooks
- `src/pages`: Page components
- `src/types`: TypeScript type definitions
- `src/utils`: Utility functions

## Technologies Used

- React
- TypeScript
- Material-UI
- Firebase (Firestore)
- date-fns

## License

This project is licensed under the MIT License.
