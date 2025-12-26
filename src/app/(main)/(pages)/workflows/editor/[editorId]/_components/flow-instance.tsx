'use client'
import { Button } from '@/components/ui/button'
import { useNodeConnections } from '@/providers/connections-provider'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import {
  onCreateNodesEdges,
  onFlowPublish,
} from '../_actions/workflow-connections'
import { toast } from 'sonner'

type Props = {
  children: React.ReactNode
  edges: any[]
  nodes: any[]
}

const FlowInstance = ({ children, edges, nodes }: Props) => {
  const pathname = usePathname()
  const [isFlow, setIsFlow] = useState([])
  const { nodeConnection } = useNodeConnections()

  const onFlowAutomation = useCallback(async () => {
    const flow = await onCreateNodesEdges(
      pathname.split('/').pop()!,
      JSON.stringify(nodes),
      JSON.stringify(edges),
      JSON.stringify(isFlow)
    )

    if (flow) toast.message(flow.message)
  }, [pathname, nodes, edges, isFlow])

  const onPublishWorkflow = useCallback(async () => {
    const response = await onFlowPublish(pathname.split('/').pop()!, true)
    if (response) toast.message(response)
  }, [pathname])

  const onAutomateFlow = useCallback(async () => {
    // Build execution graph to handle multiple paths
    const flows: any = []
    const visitedNodes = new Set<string>()
    
    // Find the trigger node (starting point)
    const triggerNode = nodes.find((node) => node.type === 'Trigger' || node.type === 'Google Drive')
    
    if (!triggerNode) {
      setIsFlow([])
      return
    }
    
    // Breadth-first traversal to build execution order
    const queue: string[] = [triggerNode.id]
    visitedNodes.add(triggerNode.id)
    
    while (queue.length > 0) {
      const currentNodeId = queue.shift()!
      
      // Find all edges from this node
      const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId)
      
      // Add target nodes to the flow
      outgoingEdges.forEach((edge) => {
        const targetNode = nodes.find((node) => node.id === edge.target)
        if (targetNode && !visitedNodes.has(targetNode.id)) {
          // Skip Trigger and Google Drive from flow path (they're starting points)
          if (targetNode.type !== 'Trigger' && targetNode.type !== 'Google Drive') {
            flows.push(targetNode.type)
          }
          visitedNodes.add(targetNode.id)
          queue.push(targetNode.id)
        }
      })
    }

    setIsFlow(flows)
  }, [edges, nodes])

  useEffect(() => {
    onAutomateFlow()
  }, [onAutomateFlow])

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-3 p-4 border-b border-border shrink-0 bg-background">
        <Button
          onClick={onFlowAutomation}
          disabled={isFlow.length < 1}
          className="flex-1"
        >
          Save
        </Button>
        <Button
          disabled={isFlow.length < 1}
          onClick={onPublishWorkflow}
          className="flex-1"
        >
          Publish
        </Button>
      </div>
      {children}
    </div>
  )
}

export default FlowInstance
