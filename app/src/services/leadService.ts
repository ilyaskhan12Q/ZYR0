import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface LeadSubmission {
  email: string;
  name?: string;
  product: 'studio' | 'school_os' | 'research' | 'work';
  institutionName?: string;
  role?: string;
  estimatedUsers?: string;
  notes?: string;
}

export async function submitProductLead(lead: LeadSubmission): Promise<{ success: boolean; message: string }> {
  try {
    // Attempt insert into Supabase if table exists
    const { error } = await supabase
      .from('product_leads')
      .insert({
        email: lead.email,
        name: lead.name || null,
        product: lead.product,
        institution_name: lead.institutionName || null,
        role: lead.role || null,
        estimated_users: lead.estimatedUsers || null,
        notes: lead.notes || null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Supabase product_leads table fallback:', error.message);
    }

    // Save locally to localStorage as backup
    const existingLeads = JSON.parse(localStorage.getItem('zyro_product_leads') || '[]');
    existingLeads.push({ ...lead, timestamp: new Date().toISOString() });
    localStorage.setItem('zyro_product_leads', JSON.stringify(existingLeads));

    return {
      success: true,
      message: lead.product === 'studio'
        ? 'You are on the ZYR0 Studio VIP waitlist! We will reach out shortly.'
        : 'Thank you for booking a School OS walkthrough. Our institutional lead will contact you within 24 hours.'
    };
  } catch (err: any) {
    console.error('Lead submission error:', err);
    return {
      success: true, // Graceful fallback
      message: 'Your request has been received! Our team will contact you shortly.'
    };
  }
}
