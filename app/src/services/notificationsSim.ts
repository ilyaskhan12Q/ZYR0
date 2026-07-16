import { toast } from 'sonner';
import { createNotification } from './notifications';

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'task' | 'message' | 'deadline';
  actionUrl?: string;
  studentEmail?: string;
  studentPhone?: string;
}

/**
 * Dispatch system notifications and conditionally trigger mock email/SMS simulations.
 */
export async function dispatchNotificationWithSimulation({
  userId,
  title,
  message,
  type,
  actionUrl,
  studentEmail = 'intern@zyr0.com',
  studentPhone,
}: NotificationPayload) {
  // 1. Always create the DB in-app notification
  try {
    await createNotification({
      user_id: userId,
      type,
      title,
      message,
      action_url: actionUrl,
    });
  } catch (error) {
    console.error('Failed to save notification in db:', error);
  }

  // 2. Read preferences from localStorage (or fallback to defaults)
  let emailEnabled = true;
  let smsEnabled = true;
  let configuredPhone = studentPhone || '+1 (555) 019-2834';

  const savedSettings = localStorage.getItem('zyr0_student_settings');
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      configuredPhone = parsed.phoneNumber || configuredPhone;
      
      if (type === 'application') {
        emailEnabled = parsed.emailApps ?? true;
        smsEnabled = parsed.smsApps ?? true;
      } else if (type === 'task') {
        emailEnabled = parsed.emailTasks ?? true;
        smsEnabled = parsed.smsTasks ?? true;
      } else if (type === 'message') {
        emailEnabled = parsed.emailMessages ?? true;
        smsEnabled = parsed.smsMessages ?? false;
      } else if (type === 'deadline') {
        emailEnabled = parsed.emailDeadlines ?? true;
        smsEnabled = parsed.smsDeadlines ?? true;
      }
    } catch (e) {
      console.warn('Failed to parse student settings for notification simulation', e);
    }
  }

  // 3. Trigger Toast Simulations
  if (emailEnabled) {
    toast(`📧 Email Dispatched`, {
      description: `Sent to ${studentEmail}: "${title} - ${message.substring(0, 45)}..."`,
      duration: 5000,
    });
  }

  if (smsEnabled && configuredPhone) {
    toast(`📱 SMS Alert Dispatched`, {
      description: `Sent to ${configuredPhone}: "ZYR0: ${title} - ${message.substring(0, 45)}..."`,
      duration: 5000,
    });
  }
}
