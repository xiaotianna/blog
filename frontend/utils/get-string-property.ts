export function getStringProperty(node: unknown, key: string) {
  if (!node || typeof node !== 'object' || !('properties' in node)) return undefined

  const properties = (node as { properties?: Record<string, unknown> }).properties
  const value = properties?.[key]

  return typeof value === 'string' ? value : undefined
}