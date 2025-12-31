'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { CheckCircle2, XCircle, AlertCircle, Clock, Search, Filter } from 'lucide-react'

type ExecutionLog = {
  id: string
  workflowId: string
  status: string
  triggeredBy: string
  triggerData: string | null
  executedActions: string
  error: string | null
  creditsUsed: number
  executionTime: number | null
  createdAt: string
  workflow: {
    id: string
    name: string
    description: string
  }
}

const LogsPage = () => {
  const [executions, setExecutions] = useState<ExecutionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchExecutions()
  }, [statusFilter])

  const fetchExecutions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('limit', '50')
      
      const response = await fetch(`/api/workflow-executions?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setExecutions(data.executions)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch executions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      success: 'default',
      failed: 'destructive',
      partial: 'secondary',
    }
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    )
  }

  const filteredExecutions = executions.filter(exec => 
    exec.workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exec.workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full w-full p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Execution History</h1>
          <p className="text-muted-foreground">Track workflow execution logs and performance</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchExecutions} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Successful</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {executions.filter(e => e.status === 'success').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {executions.filter(e => e.status === 'failed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Credits Used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {executions.reduce((sum, e) => sum + e.creditsUsed, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Logs */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
          <CardDescription>
            {filteredExecutions.length} of {total} executions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : filteredExecutions.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No execution logs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExecutions.map((execution) => {
                  const actions = JSON.parse(execution.executedActions)
                  const triggerData = execution.triggerData ? JSON.parse(execution.triggerData) : null
                  
                  return (
                    <Card key={execution.id} className="border-l-4" style={{
                      borderLeftColor: execution.status === 'success' ? '#22c55e' : execution.status === 'failed' ? '#ef4444' : '#eab308'
                    }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(execution.status)}
                            <div>
                              <CardTitle className="text-lg">{execution.workflow.name}</CardTitle>
                              <CardDescription className="mt-1">
                                {execution.workflow.description}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(execution.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Execution Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Triggered At</p>
                            <p className="font-medium">
                              {format(new Date(execution.createdAt), 'MMM dd, HH:mm:ss')}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Triggered By</p>
                            <p className="font-medium capitalize">{execution.triggeredBy.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">
                              {execution.executionTime ? `${execution.executionTime}ms` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Credits Used</p>
                            <p className="font-medium">{execution.creditsUsed}</p>
                          </div>
                        </div>

                        <Separator />

                        {/* Actions Executed */}
                        <div>
                          <p className="text-sm font-medium mb-2">Actions Executed</p>
                          <div className="flex flex-wrap gap-2">
                            {actions.map((action: any, idx: number) => (
                              <Badge 
                                key={idx} 
                                variant={action.status === 'success' ? 'default' : action.status === 'failed' ? 'destructive' : 'secondary'}
                              >
                                {action.action} - {action.status}
                                {action.reason && ` (${action.reason})`}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Error Message */}
                        {execution.error && (
                          <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                            <p className="text-sm font-medium text-destructive mb-1">Error</p>
                            <p className="text-sm text-destructive/80">{execution.error}</p>
                          </div>
                        )}

                        {/* Trigger Data */}
                        {triggerData && (
                          <details className="text-sm">
                            <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                              View Trigger Data
                            </summary>
                            <pre className="mt-2 bg-muted p-3 rounded text-xs overflow-auto">
                              {JSON.stringify(triggerData, null, 2)}
                            </pre>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

export default LogsPage
