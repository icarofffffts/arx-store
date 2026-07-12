const ARX_AUTH_URL = process.env.ARX_AUTH_PORTAL_URL || "https://auth.arxdevs.xyz"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export function getArxLoginUrl(redirectPath?: string): string {
  const callbackUrl = `${SITE_URL}/api/auth/arx-callback`
  const params = new URLSearchParams({ redirectUri: callbackUrl })
  if (redirectPath) params.set("state", redirectPath)
  return `${ARX_AUTH_URL}/?${params.toString()}`
}

export function getArxSignUpUrl(redirectPath?: string): string {
  const callbackUrl = `${SITE_URL}/api/auth/arx-callback`
  const params = new URLSearchParams({
    redirectUri: callbackUrl,
    type: "signUp",
  })
  if (redirectPath) params.set("state", redirectPath)
  return `${ARX_AUTH_URL}/?${params.toString()}`
}
