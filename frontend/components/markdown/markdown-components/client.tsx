'use client'

import { ClientCode } from './client-code'
import { ClientLink } from './client-link'
import { createMarkdownComponents } from './shared'

export const ClientMarkdownComponents = createMarkdownComponents({
  Code: ClientCode,
  Link: ClientLink
})
