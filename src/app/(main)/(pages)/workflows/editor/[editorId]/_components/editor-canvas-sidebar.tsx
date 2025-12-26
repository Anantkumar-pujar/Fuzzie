'use client'
import { EditorCanvasTypes, EditorNodeType } from '@/lib/types'
import { useNodeConnections } from '@/providers/connections-provider'
import { useEditor } from '@/providers/editor-provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import React, { useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { CONNECTIONS, EditorCanvasDefaultCardTypes } from '@/lib/constant'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  fetchBotSlackChannels,
  onConnections,
  onDragStart,
} from '@/lib/editor-utils'
import EditorCanvasIconHelper from './editor-canvas-card-icon-hepler'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import RenderConnectionAccordion from './render-connection-accordion'
import RenderOutputAccordion from './render-output-accordian'
import { useFuzzieStore } from '@/store'

type Props = {
  nodes: EditorNodeType[]
}

const EditorCanvasSidebar = ({ nodes }: Props) => {
  const { state } = useEditor()
  const { nodeConnection } = useNodeConnections()
  const { googleFile, setSlackChannels } = useFuzzieStore()
  
  // Only fetch connections when the selected node changes
  useEffect(() => {
    if (state?.editor?.selectedNode?.data?.title) {
      onConnections(nodeConnection, state, googleFile)
    }
  }, [state.editor.selectedNode.data.title, googleFile])

  // Only fetch Slack channels once when token is available
  useEffect(() => {
    if (nodeConnection.slackNode.slackAccessToken) {
      fetchBotSlackChannels(
        nodeConnection.slackNode.slackAccessToken,
        setSlackChannels
      )
    }
  }, [nodeConnection.slackNode.slackAccessToken, setSlackChannels])

  return (
    <aside className="h-full flex flex-col overflow-hidden">
      <Tabs
        defaultValue="actions"
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="shrink-0">
          <TabsList className="bg-transparent w-full">
            <TabsTrigger value="actions" className="flex-1">Actions</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          </TabsList>
          <Separator />
        </div>
        
        <TabsContent
          value="actions"
          className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden"
        >
          <div className="flex flex-col gap-4 p-4 pb-8">
            {Object.entries(EditorCanvasDefaultCardTypes)
              .filter(
                ([_, cardType]) =>
                  (!nodes.length && cardType.type === 'Trigger') ||
                  (nodes.length && cardType.type === 'Action')
              )
              .map(([cardKey, cardValue]) => (
                <Card
                  key={cardKey}
                  draggable
                  className="w-full cursor-grab border-black bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 shrink-0"
                  onDragStart={(event) =>
                    onDragStart(event, cardKey as EditorCanvasTypes)
                  }
                >
                  <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <EditorCanvasIconHelper type={cardKey as EditorCanvasTypes} />
                    <CardTitle className="text-md">
                      {cardKey}
                      <CardDescription>{cardValue.description}</CardDescription>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent
          value="settings"
          className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden"
        >
          <div className="h-full">
            <div className="px-4 py-4 text-center text-xl font-bold border-b shrink-0">
              {state.editor.selectedNode.data.title}
            </div>

            <div className="p-2">
              <Accordion type="multiple">
                <AccordionItem
                  value="Options"
                  className="border-y-[1px]"
                >
                  <AccordionTrigger className="!no-underline px-2">
                    Account
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    {CONNECTIONS.map((connection) => (
                      <RenderConnectionAccordion
                        key={connection.title}
                        state={state}
                        connection={connection}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="Expected Output"
                >
                  <AccordionTrigger className="!no-underline px-2">
                    Action
                  </AccordionTrigger>
                  <RenderOutputAccordion
                    state={state}
                    nodeConnection={nodeConnection}
                  />
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}

export default EditorCanvasSidebar
