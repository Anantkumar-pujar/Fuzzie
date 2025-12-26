import { useEditor } from '@/providers/editor-provider'
import React, { CSSProperties } from 'react'
import { Handle, HandleProps, useStore } from 'reactflow'

type Props = HandleProps & { style?: CSSProperties }

const selector = (s: any) => ({
  nodeInternals: s.nodeInternals,
  edges: s.edges,
})

const CustomHandle = (props: Props) => {
  const { state } = useEditor()

  return (
    <Handle
      {...props}
      isValidConnection={(e) => {
        // Allow all connections - multiple inputs AND multiple outputs
        // Just prevent self-connections
        if (e.source === e.target) return false
        
        // Prevent duplicate connections
        const isDuplicate = state.editor.edges.some(
          (edge) => edge.source === e.source && edge.target === e.target
        )
        
        return !isDuplicate
      }}
      className="!-bottom-2 !h-4 !w-4 dark:bg-neutral-800"
    />
  )
}

export default CustomHandle
