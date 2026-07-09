import chromium from '@sparticuz/chromium-min'
import { chromium as playwright } from 'playwright-core'
import { existsSync } from 'node:fs'
import { platform } from 'node:process'
import { cookies } from 'next/headers'

import { getGoApiBaseUrl, goApiFetch, readApiResponse } from './go-api'

type ArticleCoverTarget = {
  authToken?: string
  cookieHeader?: string
  id: string
  path: string
}

type ArticleCoverResult = {
  ok: boolean
  message?: string
}

const COVER_VIEWPORT = {
  width: 1200,
  height: 630
}

const SCREENSHOT_TIMEOUT = 30_000

const LOCAL_CHROMIUM_ARGS = [
  '--disable-background-networking',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--no-default-browser-check',
  '--no-first-run'
]

export async function generateAndUploadArticleCover({
  authToken,
  cookieHeader,
  id,
  path
}: ArticleCoverTarget): Promise<ArticleCoverResult> {
  try {
    const screenshot = await captureArticleCover(path, cookieHeader)
    const screenshotBytes = new Uint8Array(screenshot.byteLength)
    const formData = new FormData()

    screenshotBytes.set(screenshot)
    formData.set(
      'cover',
      new Blob([screenshotBytes.buffer], { type: 'image/png' }),
      'cover.png'
    )

    const response = await uploadGeneratedArticleCover(id, formData, authToken)
    const result = await readApiResponse<unknown>(response)

    if (!response.ok) {
      return {
        ok: false,
        message: result.message || '封面上传失败'
      }
    }

    return {
      ok: true,
      message: result.message
    }
  } catch (error) {
    return {
      ok: false,
      message: getCoverErrorMessage(error)
    }
  }
}

async function captureArticleCover(path: string, requestCookieHeader?: string) {
  const browser = await launchBrowser()

  try {
    const cookieHeader = requestCookieHeader ?? (await cookies()).toString()
    const context = await browser.newContext({
      viewport: COVER_VIEWPORT,
      deviceScaleFactor: 1,
      extraHTTPHeaders: cookieHeader ? { cookie: cookieHeader } : undefined
    })
    const page = await context.newPage()

    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(getArticleUrl(path), {
      waitUntil: 'networkidle',
      timeout: SCREENSHOT_TIMEOUT
    })

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      timeout: SCREENSHOT_TIMEOUT
    })

    await page.close()
    await context.close()

    return screenshot
  } finally {
    await browser.close()
  }
}

async function launchBrowser() {
  const localExecutablePath =
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
    findLocalChromiumExecutablePath()
  const chromiumLocation =
    process.env.SPARTICUZ_CHROMIUM_LOCATION ?? process.env.CHROMIUM_LOCATION

  if (!localExecutablePath && !chromiumLocation) {
    throw new Error(
      '请配置 SPARTICUZ_CHROMIUM_LOCATION，或安装本地 Chrome / 配置 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'
    )
  }

  const executablePath =
    localExecutablePath ??
    (await chromium.executablePath(chromiumLocation))

  chromium.setGraphicsMode = false

  return playwright.launch({
    args: localExecutablePath ? LOCAL_CHROMIUM_ARGS : chromium.args,
    executablePath,
    headless: true
  })
}

function uploadGeneratedArticleCover(
  id: string,
  formData: FormData,
  authToken?: string
) {
  if (!authToken) {
    return goApiFetch(`/article/${encodeURIComponent(id)}/cover`, {
      method: 'PATCH',
      body: formData
    })
  }

  return fetch(
    `${getGoApiBaseUrl()}/article/${encodeURIComponent(id)}/cover`,
    {
      cache: 'no-store',
      method: 'PATCH',
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  )
}

function getArticleUrl(path: string) {
  const baseUrl =
    process.env.BLOG_COVER_SCREENSHOT_ORIGIN ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    'http://localhost:3000'
  const normalizedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return new URL(
    `/post/${normalizedPath}`,
    ensureTrailingSlash(baseUrl)
  ).toString()
}

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`
}

function findLocalChromiumExecutablePath() {
  const candidates =
    platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
        ]
      : [
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chromium',
          '/usr/bin/chromium-browser',
          '/usr/bin/microsoft-edge'
        ]

  return candidates.find((candidate) => existsSync(candidate))
}

function getCoverErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return `封面生成失败：${error.message}`
  }

  return '封面生成失败'
}
