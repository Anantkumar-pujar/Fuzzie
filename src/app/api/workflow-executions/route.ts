import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const workflowId = searchParams.get('workflowId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      workflow: {
        userId: userId,
      },
    }

    if (workflowId) {
      where.workflowId = workflowId
    }

    if (status) {
      where.status = status
    }

    const [executions, total] = await Promise.all([
      db.workflowExecution.findMany({
        where,
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      db.workflowExecution.count({ where }),
    ])

    return NextResponse.json({
      executions,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Error fetching executions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
