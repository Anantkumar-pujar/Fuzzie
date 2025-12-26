import { onAddTemplate } from '@/lib/editor-utils'
import { ConnectionProviderProps } from '@/providers/connections-provider'
import React from 'react'

type Props = {
  nodeConnection: ConnectionProviderProps
  title: string
  gFile: any
}
const isGoogleFileNotEmpty = (file: any): boolean => {
  return file && typeof file === 'object' && Object.keys(file).length > 0 && file.kind !== ''
}

const GoogleFileDetails = ({ gFile, nodeConnection, title }: Props) => {
  if (!isGoogleFileNotEmpty(gFile)) {
    return null
  }

  const details = ['kind', 'name', 'mimeType']
  if (title === 'Google Drive') {
    details.push('id')
  }

  return (
    <div className="flex flex-wrap gap-2 min-w-0 w-full">
      {details.map((detail) => (
        <div
          key={detail}
          onClick={() =>
            onAddTemplate(nodeConnection, title, gFile[detail])
          }
          className="flex cursor-pointer gap-2 rounded-full bg-white px-3 py-1 text-gray-500 min-w-0 max-w-full overflow-hidden"
          style={{ wordBreak: 'break-all' }}
        >
          {detail}:{' '}
          <span className="text-black truncate max-w-[180px]">{gFile[detail]}</span>
        </div>
      ))}
    </div>
  )
}

export default GoogleFileDetails
