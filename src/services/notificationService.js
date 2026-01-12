/**
 * Notification Service untuk Griya Sakinah
 * Menggunakan Capacitor Local Notifications untuk reminder SEFT & Spiritual
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Cek apakah running di native app (bukan web)
const isNative = Capacitor.isNativePlatform();

/**
 * Request permission untuk notifications
 */
export async function requestNotificationPermission() {
    if (!isNative) {
        console.log('Running on web, skipping native notification permission');
        return true;
    }

    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
}

/**
 * Schedule daily reminder pada waktu tertentu
 * @param {object} options - { id, hour, minute, title, body }
 */
export async function scheduleDailyReminder({ id, hour, minute, title, body }) {
    if (!isNative) return;

    // Cancel existing notification with same ID first
    await LocalNotifications.cancel({ notifications: [{ id }] });

    const now = new Date();
    let scheduleTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0
    );

    // Jika waktu sudah lewat hari ini, jadwalkan untuk besok
    if (scheduleTime <= now) {
        scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    await LocalNotifications.schedule({
        notifications: [
            {
                id,
                title,
                body,
                schedule: {
                    at: scheduleTime,
                    repeats: true,
                    every: 'day'
                },
                sound: 'default',
                smallIcon: 'ic_notification',
                iconColor: '#059669'
            }
        ]
    });

    console.log(`Scheduled reminder: ${title} at ${hour}:${minute.toString().padStart(2, '0')}`);
}

/**
 * Setup semua default reminders untuk SEFT & Spiritual
 */
export async function setupDefaultReminders() {
    const reminders = [
        {
            id: 1,
            hour: 5,
            minute: 30,
            title: 'Dzikir Pagi ☀️',
            body: 'Waktunya dzikir pagi! Mulai hari dengan mengingat Allah.'
        },
        {
            id: 2,
            hour: 6,
            minute: 0,
            title: 'SEFT Pagi 🙏',
            body: 'Waktunya SEFT pagi! Bersihkan hati sebelum beraktivitas.'
        },
        {
            id: 3,
            hour: 15,
            minute: 30,
            title: 'Dzikir Petang 🌅',
            body: 'Waktunya dzikir petang! Lindungi diri hingga pagi.'
        },
        {
            id: 4,
            hour: 21,
            minute: 0,
            title: 'Muhasabah Malam 🌙',
            body: 'Sudah SEFT hari ini? Refleksikan perjalanan harimu.'
        }
    ];

    for (const reminder of reminders) {
        await scheduleDailyReminder(reminder);
    }

    console.log('All default reminders scheduled successfully');
}

/**
 * Cancel semua reminders
 */
export async function cancelAllReminders() {
    if (!isNative) return;
    await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] });
    console.log('All reminders cancelled');
}

/**
 * Get list of pending notifications
 */
export async function getPendingReminders() {
    if (!isNative) return [];
    const result = await LocalNotifications.getPending();
    return result.notifications;
}

/**
 * Initialize notification service
 * Dipanggil saat app pertama kali dibuka
 */
export async function initializeNotifications() {
    if (!isNative) {
        console.log('Running on web browser, notifications disabled');
        return;
    }

    const hasPermission = await requestNotificationPermission();

    if (hasPermission) {
        await setupDefaultReminders();
        console.log('Notification service initialized');
    } else {
        console.warn('Notification permission denied');
    }
}

/**
 * Send immediate test notification
 */
export async function sendTestNotification() {
    if (!isNative) {
        alert('Test notification: Notifikasi hanya berfungsi di app Android!');
        return;
    }

    await LocalNotifications.schedule({
        notifications: [
            {
                id: 999,
                title: 'Test Notifikasi 🔔',
                body: 'Griya Sakinah notifications berfungsi dengan baik!',
                schedule: { at: new Date(Date.now() + 3000) }, // 3 detik lagi
                sound: 'default'
            }
        ]
    });
}
