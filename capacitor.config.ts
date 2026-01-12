import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'org.griyasakinah.app',
    appName: 'Griya Sakinah',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        LocalNotifications: {
            smallIcon: "ic_notification",
            iconColor: "#059669"
        }
    }
};

export default config;
