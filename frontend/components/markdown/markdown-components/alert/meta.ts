import {
  CircleAlert,
  Info,
  Lightbulb,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon
} from 'lucide-react'

export type MarkdownAlertType =
  | 'note'
  | 'tip'
  | 'important'
  | 'warning'
  | 'caution'

export type MarkdownAlertMeta = {
  Icon: LucideIcon
  accentClassName: string
  borderClassName: string
  marker: string
  title: string
}

export const MARKDOWN_ALERT_MARKER_PATTERN =
  /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][\t ]*(?:\r?\n)?/i

export const MARKDOWN_ALERT_META: Record<MarkdownAlertType, MarkdownAlertMeta> = {
  note: {
    Icon: Info,
    accentClassName: 'text-(--ds-blue-900)',
    borderClassName:
      'border-[color-mix(in_oklch,var(--ds-blue-900),transparent_72%)]',
    marker: 'NOTE',
    title: 'Note'
  },
  tip: {
    Icon: Lightbulb,
    accentClassName: 'text-(--ds-green-900)',
    borderClassName:
      'border-[color-mix(in_oklch,var(--ds-green-900),transparent_72%)]',
    marker: 'TIP',
    title: 'Tip'
  },
  important: {
    Icon: CircleAlert,
    accentClassName: 'text-(--ds-purple-900)',
    borderClassName:
      'border-[color-mix(in_oklch,var(--ds-purple-900),transparent_72%)]',
    marker: 'IMPORTANT',
    title: 'Important'
  },
  warning: {
    Icon: TriangleAlert,
    accentClassName: 'text-(--ds-amber-900)',
    borderClassName: 'border-(--ds-amber-300)',
    marker: 'WARNING',
    title: 'Warning'
  },
  caution: {
    Icon: OctagonAlert,
    accentClassName: 'text-(--ds-red-900)',
    borderClassName:
      'border-[color-mix(in_oklch,var(--ds-red-900),transparent_72%)]',
    marker: 'CAUTION',
    title: 'Caution'
  }
}

export function toMarkdownAlertType(value: string): MarkdownAlertType | null {
  const normalized = value.toLowerCase()

  return normalized in MARKDOWN_ALERT_META
    ? (normalized as MarkdownAlertType)
    : null
}
