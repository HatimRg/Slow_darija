import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.slowdarija.app',
  appName: 'Slow Darija',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://slowdarija.com',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FDFBF7',
      showSpinner: false,
    },
  },
};

export default config;