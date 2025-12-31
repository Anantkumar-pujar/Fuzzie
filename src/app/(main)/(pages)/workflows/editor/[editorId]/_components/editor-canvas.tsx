'use client'
import { EditorCanvasCardType, EditorNodeType } from '@/lib/types'
import { useEditor } from '@/providers/editor-provider'
import { useNodeConnections } from '@/providers/connections-provider'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  NodeChange,
  ReactFlowInstance,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import EditorCanvasCardSingle from './editor-canvas-card-single'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'
import { v4 } from 'uuid'
import { EditorCanvasDefaultCardTypes } from '@/lib/constant'
import FlowInstance from './flow-instance'
import EditorCanvasSidebar from './editor-canvas-sidebar'
import { onGetNodesEdges } from '../../../_actions/workflow-connections'

type Props = {}

const initialNodes: EditorNodeType[] = []

const initialEdges: { id: string; source: string; target: string }[] = []

const EditorCanvas = (props: Props) => {
  const { dispatch, state } = useEditor()
  const { nodeConnection } = useNodeConnections()
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [isWorkFlowLoading, setIsWorkFlowLoading] = useState<boolean>(false)
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>()
  const pathname = usePathname()
  
  // Extract setters to avoid nodeConnection dependency issues
  const { setDiscordNode, setSlackNode, setNotionNode, setWorkFlowTemplate } = nodeConnection

  const onDragOver = useCallback((event: any) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      //@ts-ignore
      setNodes((nds) => applyNodeChanges(changes, nds))
    },
    [setNodes]
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      //@ts-ignore
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  )

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  )

  const onDeleteNode = useCallback(() => {
    const selectedNodeId = state.editor.selectedNode.id
    if (selectedNodeId && selectedNodeId !== '') {
      // Remove node
      setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId))
      // Remove connected edges
      setEdges((eds) =>
        eds.filter(
          (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId
        )
      )
      // Clear selection
      dispatch({
        type: 'SELECTED_ELEMENT',
        payload: {
          element: {
            data: {
              completed: false,
              current: false,
              description: '',
              metadata: {},
              title: '',
              type: 'Trigger',
            },
            id: '',
            position: { x: 0, y: 0 },
            type: 'Trigger',
          },
        },
      })
      toast.success('Node deleted')
    }
  }, [state.editor.selectedNode.id, dispatch])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Prevent default backspace navigation
        const target = event.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault()
          onDeleteNode()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onDeleteNode])

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault()

      const type: EditorCanvasCardType['type'] = event.dataTransfer.getData(
        'application/reactflow'
      )

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return
      }

      const triggerAlreadyExists = state.editor.elements.find(
        (node) => node.type === 'Trigger'
      )

      if (type === 'Trigger' && triggerAlreadyExists) {
        toast('Only one trigger can be added to automations at the moment')
        return
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      if (!reactFlowInstance) return
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode = {
        id: v4(),
        type,
        position,
        data: {
          title: type,
          description: EditorCanvasDefaultCardTypes[type].description,
          completed: false,
          current: false,
          metadata: {},
          type: type,
        },
      }
      //@ts-ignore
      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, state]
  )

  const handleClickCanvas = () => {
    dispatch({
      type: 'SELECTED_ELEMENT',
      payload: {
        element: {
          data: {
            completed: false,
            current: false,
            description: '',
            metadata: {},
            title: '',
            type: 'Trigger',
          },
          id: '',
          position: { x: 0, y: 0 },
          type: 'Trigger',
        },
      },
    })
  }

  useEffect(() => {
    // Only sync local changes to global state, not initial load
    if (nodes.length > 0 || edges.length > 0) {
      dispatch({ type: 'LOAD_DATA', payload: { edges, elements: nodes } })
    }
  }, [nodes, edges, dispatch])

  const nodeTypes = useMemo(
    () => ({
      Action: EditorCanvasCardSingle,
      Trigger: EditorCanvasCardSingle,
      Email: EditorCanvasCardSingle,
      Condition: EditorCanvasCardSingle,
      AI: EditorCanvasCardSingle,
      Slack: EditorCanvasCardSingle,
      'Google Drive': EditorCanvasCardSingle,
      Notion: EditorCanvasCardSingle,
      Discord: EditorCanvasCardSingle,
      'Custom Webhook': EditorCanvasCardSingle,
      'Google Calendar': EditorCanvasCardSingle,
      Wait: EditorCanvasCardSingle,
    }),
    []
  )

  const onGetWorkFlow = useCallback(async () => {
    setIsWorkFlowLoading(true)
    const response = await onGetNodesEdges(pathname.split('/').pop()!)
    if (response) {
      const loadedEdges = JSON.parse(response.edges!)
      const loadedNodes = JSON.parse(response.nodes!)
      
      setEdges(loadedEdges)
      setNodes(loadedNodes)
      
      // Dispatch to global state immediately
      dispatch({ 
        type: 'LOAD_DATA', 
        payload: { edges: loadedEdges, elements: loadedNodes } 
      })
      
      // Load saved templates into connection state
      if (response.discordTemplate) {
        setDiscordNode((prev: any) => ({
          ...prev,
          content: response.discordTemplate,
        }))
      }
      
      if (response.slackTemplate) {
        setSlackNode((prev: any) => ({
          ...prev,
          content: response.slackTemplate,
          slackAccessToken: response.slackAccessToken || '',
        }))
      }
      
      if (response.notionTemplate) {
        setNotionNode((prev: any) => ({
          ...prev,
          content: response.notionTemplate,
          accessToken: response.notionAccessToken || '',
          databaseId: response.notionDbId || '',
        }))
      }
      
      // Also set the workflow template state
      setWorkFlowTemplate({
        discord: response.discordTemplate || '',
        slack: response.slackTemplate || '',
        notion: response.notionTemplate || '',
      })
      
      setIsWorkFlowLoading(false)
    }
    setIsWorkFlowLoading(false)
  }, [pathname, dispatch, setDiscordNode, setSlackNode, setNotionNode, setWorkFlowTemplate])

  useEffect(() => {
    onGetWorkFlow()
  }, [onGetWorkFlow])

  return (
    <div className="h-full w-full flex overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={70} minSize={40} maxSize={80}>
          <div className="relative h-full w-full bg-background">
            {isWorkFlowLoading ? (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <svg
                  aria-hidden="true"
                  className="inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
            ) : (
              <div className="h-full w-full relative">
                <ReactFlow
                  nodes={state.editor.elements}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onInit={setReactFlowInstance}
                  onClick={handleClickCanvas}
                  nodeTypes={nodeTypes}
                  fitView
                >
                  <Controls position="top-left" />
                  <MiniMap
                    position="bottom-left"
                    className="!bg-background !m-2"
                    zoomable
                    pannable
                  />
                  <Background
                    //@ts-ignore
                    variant="dots"
                    gap={12}
                    size={1}
                  />
                </ReactFlow>
              </div>
            )}
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <div className="h-full flex flex-col bg-background">
            {isWorkFlowLoading ? (
              <div className="flex h-full items-center justify-center bg-background">
                <svg
                  aria-hidden="true"
                  className="inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
            ) : (
              <FlowInstance edges={edges} nodes={nodes}>
                <EditorCanvasSidebar nodes={nodes} />
              </FlowInstance>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default EditorCanvas
