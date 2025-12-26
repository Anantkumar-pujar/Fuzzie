import React from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Workflow, Zap, Link2, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const DashboardPage = async () => {
  const user = await currentUser()
  if (!user) return null

  // Fetch user data with all related information
  const userData = await db.user.findUnique({
    where: { clerkId: user.id },
    include: {
      workflows: true, // Get all workflows for accurate count
      connections: true,
    },
  })

  // Get recent 2 workflows for display
  const recentWorkflows = await db.workflows.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    take: 2,
  })

  // Calculate stats
  const totalWorkflows = userData?.workflows.length || 0
  const publishedWorkflows = userData?.workflows.filter(w => w.publish).length || 0
  const totalConnections = userData?.connections.length || 0
  const credits = userData?.credits || '0'
  const tier = userData?.tier || 'Free'
  
  // Calculate credit usage percentage
  const creditValue = credits === 'Unlimited' ? 100 : parseInt(credits)
  const maxCredits = tier === 'Pro' ? 100 : tier === 'Unlimited' ? 100 : 10
  const creditPercentage = credits === 'Unlimited' ? 100 : (creditValue / maxCredits) * 100

  return (
    <div className="flex flex-col gap-4 relative">
      <h1 className="text-4xl sticky top-0 z-[10] p-6 bg-background/50 backdrop-blur-lg flex items-center border-b justify-between">
        Dashboard
      </h1>

      <div className="flex flex-col gap-4 p-6">
        {/* Welcome Section */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold">Welcome back, {userData?.name || user.firstName}! 👋</h2>
          <p className="text-muted-foreground mt-2">
            Here&apos;s what&apos;s happening with your automation workflows today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Workflows */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Workflows
              </CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                {publishedWorkflows} published
              </p>
            </CardContent>
          </Card>

          {/* Active Connections */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Connections
              </CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConnections}</div>
              <p className="text-xs text-muted-foreground">
                Integrated services
              </p>
            </CardContent>
          </Card>

          {/* Credits Available */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Credits Available
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{credits}</div>
              <Progress value={creditPercentage} className="mt-2" />
            </CardContent>
          </Card>

          {/* Current Plan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Plan
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tier}</div>
              <Link href="/billing">
                <p className="text-xs text-blue-500 hover:underline cursor-pointer">
                  Upgrade plan
                </p>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid Layout - 2 columns on desktop, 1 on mobile */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {/* Recent Workflows - Takes 2 columns on large screens */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Workflows</CardTitle>
              <CardDescription>
                Your most recently updated automation workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalWorkflows === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first automation workflow
                  </p>
                  <Link href="/workflows">
                    <Button>Create Workflow</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {workflow.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            workflow.publish
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-gray-500/20 text-gray-500'
                          }`}
                        >
                          {workflow.publish ? 'Published' : 'Draft'}
                        </span>
                        <Link href={`/workflows/editor/${workflow.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {totalWorkflows > 2 && (
                    <Link href="/workflows">
                      <Button variant="link" className="w-full">
                        View all workflows →
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions - Takes 1 column, stacked vertically */}
          <div className="flex flex-col gap-4 h-full">
            <Link href="/workflows" className="flex-1">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Create Workflow
                  </CardTitle>
                  <CardDescription>
                    Build a new automation workflow
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/connections" className="flex-1">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Manage Connections
                  </CardTitle>
                  <CardDescription>
                    Connect your favorite apps
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/billing" className="flex-1">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Upgrade Plan
                  </CardTitle>
                  <CardDescription>
                    Get more credits and features
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
