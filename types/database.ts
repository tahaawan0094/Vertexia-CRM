export type LeadStatus = 'new' | 'contacted' | 'follow_up' | 'won' | 'lost'
export type CallOutcome =
  | 'no_answer'
  | 'gatekeeper_blocked'
  | 'spoke_to_owner'
  | 'callback_requested'
  | 'not_interested'
  | 'interested'
  | 'converted'
export type ScriptType = 'gatekeeper' | 'owner'
export type ContactRole = 'owner' | 'manager' | 'staff' | 'unknown'
export type WebsiteStatus = 'none' | 'outdated' | 'has_website'
export type LeadSource = 'cold_call' | 'referral' | 'social' | 'other'
export type UserRole = 'admin' | 'sales_rep'

export interface Lead {
  id: string
  business_name: string
  industry: string
  city: string
  phone: string
  whatsapp_number: string | null
  contact_person: string | null
  contact_role: ContactRole
  current_website_status: WebsiteStatus
  source: LeadSource
  status: LeadStatus
  notes: string | null
  created_at: string
  updated_at: string
  assigned_to: string | null
  // computed
  call_count?: number
  last_call_at?: string | null
  last_call_outcome?: CallOutcome | null
}

export interface CallLog {
  id: string
  lead_id: string
  called_by: string
  call_outcome: CallOutcome
  notes: string | null
  call_number: number
  created_at: string
}

export interface Script {
  id: string
  lead_id: string
  script_type: ScriptType
  content: string
  business_context_used: Record<string, unknown>
  model_used: string
  created_at: string
  version: number
}

export interface Client {
  id: string
  lead_id: string | null
  business_name: string
  contact_person: string | null
  phone: string
  whatsapp_number: string | null
  plan: string | null
  contract_start_date: string | null
  website_status: string | null
  payment_notes: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

// Joined/enriched types
export interface LeadWithCallInfo extends Lead {
  call_count: number
  last_call_at: string | null
  last_call_outcome: CallOutcome | null
}

export interface LeadDetailData extends Lead {
  call_logs: CallLog[]
  scripts: Script[]
  client?: Client | null
}

export interface GenerateScriptsRequest {
  lead_id: string
}

export interface GenerateScriptsResponse {
  gatekeeper_script: string
  owner_script: string
}

export interface DashboardStats {
  total_leads: number
  new_leads: number
  contacted_leads: number
  follow_up_leads: number
  won_leads: number
  lost_leads: number
  calls_this_week: number
  conversion_rate: number
}
