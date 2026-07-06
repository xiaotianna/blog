import os from 'node:os'

export function getLocalDevOrigins(port = 3000) {
  const interfaces = os.networkInterfaces()
  const ips: string[] = []

  for (const items of Object.values(interfaces)) {
    for (const item of items ?? []) {
      if (item.family === 'IPv4' && !item.internal) {
        ips.push(item.address)
      }
    }
  }

  return ips.flatMap((ip) => [
    ip,
    `${ip}:${port}`,
  ])
}