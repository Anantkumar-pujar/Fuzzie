import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n=== WORKFLOW DIAGNOSTIC ===\n')
  
  // Get all users with Google Drive listener
  const users = await prisma.user.findMany({
    select: {
      clerkId: true,
      email: true,
      googleResourceId: true,
      credits: true,
      workflows: {
        select: {
          id: true,
          name: true,
          publish: true,
          flowPath: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })

  console.log(`Found ${users.length} user(s)\n`)

  for (const user of users) {
    console.log(`User: ${user.email}`)
    console.log(`Clerk ID: ${user.clerkId}`)
    console.log(`Credits: ${user.credits}`)
    console.log(`Google Resource ID: ${user.googleResourceId || 'NOT SET'}`)
    console.log(`\nWorkflows (${user.workflows.length}):`)
    
    user.workflows.forEach((workflow, idx) => {
      console.log(`\n  ${idx + 1}. ${workflow.name}`)
      console.log(`     ID: ${workflow.id}`)
      console.log(`     Published: ${workflow.publish ? 'YES' : 'NO'}`)
      console.log(`     Has flowPath: ${workflow.flowPath ? 'YES' : 'NO'}`)
      if (workflow.flowPath) {
        const flowPath = JSON.parse(workflow.flowPath)
        console.log(`     FlowPath length: ${flowPath.length}`)
        console.log(`     Actions: ${flowPath.join(' -> ')}`)
      }
      console.log(`     Created: ${workflow.createdAt.toISOString()}`)
      console.log(`     Updated: ${workflow.updatedAt.toISOString()}`)
    })
    
    console.log('\n' + '='.repeat(60) + '\n')
  }

  // Check recent workflow executions
  const executions = await prisma.workflowExecution.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      workflow: {
        select: {
          name: true,
        },
      },
    },
  })

  console.log(`\n=== RECENT WORKFLOW EXECUTIONS (${executions.length}) ===\n`)
  
  if (executions.length === 0) {
    console.log('No workflow executions found in database.')
  } else {
    executions.forEach((exec, idx) => {
      console.log(`${idx + 1}. ${exec.workflow.name}`)
      console.log(`   Status: ${exec.status}`)
      console.log(`   Triggered by: ${exec.triggeredBy}`)
      console.log(`   Time: ${exec.createdAt.toISOString()}`)
      if (exec.error) {
        console.log(`   Error: ${exec.error}`)
      }
      console.log()
    })
  }

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
