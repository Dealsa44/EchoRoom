import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.echoroom.app',
  appName: 'EchoRoom',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f0f23",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999"
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0f0f23"
    },
    LiveUpdates: {
      appId: 'com.echoroom.app',
      channel: 'production',
      autoUpdateMethod: 'background',
      maxVersions: 2,
      serverUrl: 'https://your-vercel-app.vercel.app'
    }
  }
};

export default config;
