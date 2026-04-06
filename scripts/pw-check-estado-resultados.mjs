import { chromium } from 'playwright'

const base = 'http://localhost:3000'
const logs = { console: [], pageerror: [], requestfailed: [] }

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await context.newPage()

page.on('console', (msg) => {
  logs.console.push({ type: msg.type(), text: msg.text() })
})
page.on('pageerror', (err) => {
  logs.pageerror.push(String(err))
})
page.on('requestfailed', (req) => {
  logs.requestfailed.push({ url: req.url(), failure: req.failure()?.errorText })
})

await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' })

await page.locator('#login-user').fill('inversionista')
await page.locator('#login-password').fill('inversionista123')
// Ensure no dropdown/backdrop intercepts the login button.
await page.keyboard.press('Escape').catch(() => {})
await page.getByRole('button', { name: 'Entrar' }).click()

await page.waitForURL('**/inversionistas/panel', { timeout: 15000 }).catch(() => {})

// Navigate from the sidebar menu (Layout uses Link with this label)
await page.getByRole('link', { name: 'Estado de Resultados' }).click({ timeout: 15000 })
await page.waitForURL('**/estado-resultados', { timeout: 15000 }).catch(() => {})

// Allow any loader/API calls to settle
await page.waitForTimeout(2000)

const url = page.url()
const hasOverlay = await page
  .locator('vite-error-overlay')
  .count()
  .then((c) => c > 0)
  .catch(() => false)

let overlayText = ''
if (hasOverlay) {
  overlayText = await page.locator('vite-error-overlay').innerText().catch(() => '(no se pudo leer)')
}

const loaderVisible = await page.getByText('Cargando estado de resultados...').isVisible().catch(() => false)
const headerVisible = await page.getByRole('heading', { name: 'Estado de Resultados' }).isVisible().catch(() => false)
const bodyText = ((await page.locator('body').innerText().catch(() => '')) ?? '').trim()

await page.screenshot({ path: 'playwright-estado-resultados.png', fullPage: true }).catch(() => {})

console.log(
  JSON.stringify(
    {
      url,
      hasOverlay,
      overlayText,
      loaderVisible,
      headerVisible,
      bodyTextLen: bodyText.length,
      logs,
    },
    null,
    2
  )
)

await browser.close()

