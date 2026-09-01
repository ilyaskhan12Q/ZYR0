import { toast } from 'sonner';
import { createNotification } from './notifications';
import { supabase } from '@/lib/supabase';
import { getStudentSettings, STUDENT_SETTINGS_DEFAULTS } from '@/services/settings';
import type { StudentSettings } from '@/lib/database.types';

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'task' | 'message' | 'deadline';
  actionUrl?: string;
  studentEmail?: string;
  studentPhone?: string;
}

async function fetchUserSettings(userId: string): Promise<StudentSettings> {
  const { data } = await supabase
    .from('profiles')
    .select('settings')
    .eq('id', userId)
    .single();

  return getStudentSettings(data?.settings as StudentSettings | null);
}

export async function dispatchNotificationWithSimulation({
  userId,
  title,
  message,
  type,
  actionUrl,
  studentEmail = 'intern@zyroo.org',
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

  // 2. Read preferences from DB (server-side)
  let emailEnabled = true;
  let smsEnabled = true;
  let configuredPhone = studentPhone || '';

  try {
    const prefs = await fetchUserSettings(userId);
    configuredPhone = prefs.phoneNumber || configuredPhone;

    if (type === 'application') {
      emailEnabled = prefs.emailApps;
      smsEnabled = prefs.smsApps;
    } else if (type === 'task') {
      emailEnabled = prefs.emailTasks;
      smsEnabled = prefs.smsTasks;
    } else if (type === 'message') {
      emailEnabled = prefs.emailMessages;
      smsEnabled = prefs.smsMessages;
    } else if (type === 'deadline') {
      emailEnabled = prefs.emailDeadlines;
      smsEnabled = prefs.smsDeadlines;
    }
  } catch (e) {
    console.warn('Failed to fetch settings for notification simulation', e);
  }

  // 3. Send real email via Edge Function (if enabled)
  if (emailEnabled) {
    try {
      await supabase.functions.invoke('send-notification-email', {
        body: {
          userId,
          type,
          title,
          message,
          actionUrl,
        },
      });
    } catch (emailErr) {
      console.error('Failed to send notification email:', emailErr);
    }
  }

  // 4. SMS simulation (placeholder for future Twilio integration)
  if (smsEnabled && configuredPhone) {
    toast(`📱 SMS Alert (simulated)`, {
      description: `Would send to ${configuredPhone}: "ZYR0: ${title}"`,
      duration: 3000,
    });
  }
}
