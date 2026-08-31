import { supabase } from '@/lib/supabase';
import type { StudentSettings } from '@/lib/database.types';

export const STUDENT_SETTINGS_DEFAULTS: StudentSettings = {
  emailApps: true,
  emailTasks: true,
  emailMessages: true,
  emailDeadlines: true,
  emailProductUpdates: true,
  smsApps: true,
  smsTasks: true,
  smsMessages: false,
  smsDeadlines: true,
  phoneNumber: '',
  theme: 'system',
  language: 'en',
  publicProfile: true,
};

export function getStudentSettings(profileSettings: StudentSettings | null | undefined): StudentSettings {
  if (!profileSettings) return STUDENT_SETTINGS_DEFAULTS;
  return { ...STUDENT_SETTINGS_DEFAULTS, ...profileSettings };
}

export async function updateStudentSettings(partial: Partial<StudentSettings>): Promise<{ error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('settings')
    .eq('id', user.id)
    .single();

  const current = getStudentSettings(profile?.settings as StudentSettings | null);
  const updated = { ...current, ...partial };

  const { error } = await supabase
    .from('profiles')
    .update({ settings: updated })
    .eq('id', user.id);

  if (error) return { error: error.message };
  return {};
}
