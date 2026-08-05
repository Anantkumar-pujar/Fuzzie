import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

//Results are per-user and must never be cached; without this Next tries to
//render the route statically at build time and auth() throws.
export const dynamic = 'force-dynamic'

//Max results per group. The palette shows a handful per section and the user
//narrows by typing, so there is no pagination here.
const PER_GROUP = 5

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const query = (req.nextUrl.searchParams.get('q') || '').trim()

    if (query.length < 2) {
      return NextResponse.json({ workflows: [], connections: [], executions: [] })
    }

    const contains = { contains: query, mode: 'insensitive' as const }

    //Every query is scoped to the caller. WorkflowExecution has no userId of its
    //own, so it is scoped through its parent workflow - same as
    ///api/workflow-executions.
    const [workflows, connections, executions] = await Promise.all([
      db.workflows.findMany({
        where: {
          userId,
          OR: [{ name: contains }, { description: contains }],
        },
        select: { id: true, name: true, description: true, publish: true },
        orderBy: { updatedAt: 'desc' },
        take: PER_GROUP,
      }),
      db.connections.findMany({
        where: { userId, type: contains },
        select: { id: true, type: true },
        take: PER_GROUP,
      }),
      db.workflowExecution.findMany({
        where: {
          workflow: { userId },
          OR: [
            { workflow: { name: contains } },
            { status: contains },
            { error: contains },
          ],
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          workflow: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: PER_GROUP,
      }),
    ])

    //Queries that find nothing are the highest-signal product feedback there is.
    if (!workflows.length && !connections.length && !executions.length) {
      console.log(`[search] no results for ${JSON.stringify(query)}`)
    }

    return NextResponse.json({
      workflows,
      connections,
      executions: executions.map((execution) => ({
        id: execution.id,
        status: execution.status,
        createdAt: execution.createdAt,
        workflowId: execution.workflow.id,
        workflowName: execution.workflow.name,
      })),
    })
  } catch (error: any) {
    console.error('Error running search:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
