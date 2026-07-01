import type { NextConfig } from 'next'
import { getLocalDevOrigins } from './utils/get-local-dev-origins'

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    ...getLocalDevOrigins(3000)
  ]
}

export default nextConfig
