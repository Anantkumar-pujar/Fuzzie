/**
 * Environment Validation Utility
 * 
 * Validates critical environment variables on application startup
 * to prevent configuration issues from causing runtime failures.
 */

export function validateEnvironment() {
  const errors: string[] = []
  const warnings: string[] = []

  // Check NGROK_URI
  if (!process.env.NGROK_URI) {
    errors.push('NGROK_URI is not set. Webhook notifications will not work.')
  } else if (process.env.NGROK_URI.includes(' ')) {
    errors.push('NGROK_URI contains spaces. This will cause webhook registration to fail.')
  } else if (!process.env.NGROK_URI.startsWith('https://')) {
    warnings.push('NGROK_URI should start with https:// for secure webhooks')
  }

  // Check Google OAuth
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    errors.push('Google OAuth credentials are missing')
  }

  // Check Clerk
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    errors.push('Clerk authentication keys are missing')
  }

  // Check Database
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is not set. Application will not be able to connect to database.')
  }

  // Check Slack (optional but recommended)
  if (!process.env.SLACK_CLIENT_ID || !process.env.SLACK_CLIENT_SECRET) {
    warnings.push('Slack credentials missing - Slack workflows will not work')
  }

  // Check Discord (optional but recommended)
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    warnings.push('Discord credentials missing - Discord workflows will not work')
  }

  // Check Notion (optional but recommended)
  if (!process.env.NOTION_API_SECRET || !process.env.NOTION_CLIENT_ID) {
    warnings.push('Notion credentials missing - Notion workflows will not work')
  }

  // Log results
  if (errors.length > 0) {
    console.error('\n❌ ENVIRONMENT CONFIGURATION ERRORS:')
    errors.forEach(error => console.error(`   - ${error}`))
    console.error('\n')
    throw new Error('Invalid environment configuration. Please check .env file.')
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  ENVIRONMENT CONFIGURATION WARNINGS:')
    warnings.forEach(warning => console.warn(`   - ${warning}`))
    console.warn('\n')
  }

  // Success message
  console.log('✅ Environment configuration validated successfully')
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Auto-run validation in development
if (process.env.NODE_ENV === 'development') {
  try {
    validateEnvironment()
  } catch (error: any) {
    console.error('Environment validation failed:', error.message)
  }
}
