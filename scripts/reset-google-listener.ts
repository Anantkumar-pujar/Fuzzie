import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n=== RESETTING GOOGLE DRIVE LISTENER ===\n')
  
  // Clear all googleResourceId values to force listener recreation
  const result = await prisma.user.updateMany({
    where: {
      googleResourceId: {
        not: null,
      },
    },
    data: {
      googleResourceId: null,
    },
  })

  console.log(`Reset ${result.count} user(s) Google Drive listener`)
  console.log('\nNow click "Start" in the Connections page to recreate the listener with the correct ngrok URL.\n')

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
