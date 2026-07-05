import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import type { LeadStatus, CallOutcome, WebsiteStatus } from '@/types/database'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy')
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy h:mm a')
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

export function getStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    contacted: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    follow_up: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    won: 'bg-green-500/20 text-green-300 border-green-500/30',
    lost: 'bg-red-500/20 text-red-300 border-red-500/30',
  }
  return colors[status]
}

export function getStatusLabel(status: LeadStatus): string {
  const labels: Record<LeadStatus, string> = {
    new: 'New',
    contacted: 'Contacted',
    follow_up: 'Follow Up',
    won: 'Won',
    lost: 'Lost',
  }
  return labels[status]
}

export function getOutcomeColor(outcome: CallOutcome): string {
  const colors: Record<CallOutcome, string> = {
    no_answer: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    gatekeeper_blocked: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    spoke_to_owner: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    callback_requested: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    not_interested: 'bg-red-500/20 text-red-300 border-red-500/30',
    interested: 'bg-green-500/20 text-green-300 border-green-500/30',
    converted: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  }
  return colors[outcome]
}

export function getOutcomeLabel(outcome: CallOutcome): string {
  const labels: Record<CallOutcome, string> = {
    no_answer: 'No Answer',
    gatekeeper_blocked: 'Gatekeeper Blocked',
    spoke_to_owner: 'Spoke to Owner',
    callback_requested: 'Callback Requested',
    not_interested: 'Not Interested',
    interested: 'Interested',
    converted: 'Converted',
  }
  return labels[outcome]
}

export function getWebsiteStatusLabel(status: WebsiteStatus): string {
  const labels: Record<WebsiteStatus, string> = {
    none: 'No Website',
    outdated: 'Outdated Website',
    has_website: 'Has Website',
  }
  return labels[status]
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  // Normalize: remove spaces, dashes, parentheses
  const normalized = phone.replace(/[\s\-\(\)]/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${normalized}?text=${encoded}`
}

export function buildWhatsAppMessage(businessName: string): string {
  return `Hi! I'm calling from Vertexia — we help small businesses in Karachi get a professional website in just 7 days. Is this ${businessName}? I'd love to share a quick proposal if you have a moment!`
}

export function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
