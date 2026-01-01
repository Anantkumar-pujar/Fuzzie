import { db } from '../src/lib/db'

async function deleteNotionConnections() {
  console.log('🗑️  Deleting all Notion connections...\n')

  try {
    // Step 1: Delete all Notion-related connections
    console.log('Step 1: Deleting Notion entries from Connections table...')
    const deletedConnections = await db.connections.deleteMany({
      where: {
        type: 'Notion'
      }
    })
    console.log(`✅ Deleted ${deletedConnections.count} Notion connection(s)\n`)

    // Step 2: Delete all Notion records
    console.log('Step 2: Deleting all records from Notion table...')
    const deletedNotions = await db.notion.deleteMany({})
    console.log(`✅ Deleted ${deletedNotions.count} Notion record(s)\n`)

    console.log('========================================')
    console.log('✅ Successfully deleted all Notion data!')
    console.log('========================================')
    console.log('\nYou can now reconnect Notion from the Connections page.')
    console.log('Go to: /connections and click "Connect" on Notion card\n')

  } catch (error) {
    console.error('❌ Error deleting Notion connections:', error)
    throw error
  } finally {
    await db.$disconnect()
  }
}

deleteNotionConnections()
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
