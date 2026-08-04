'use client'
import React, { useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FileUploaderRegular } from '@uploadcare/react-uploader/next'
import type { OutputFileEntry, UploadCtxProvider } from '@uploadcare/file-uploader'
import '@uploadcare/react-uploader/core.css'

type Props = {
  //cdnUrl is what the app persists; uuid is handed through as well so callers
  //that need the Uploadcare file id do not have to parse it back out.
  onUpload: (cdnUrl: string, uuid: string) => Promise<any>
}

//Set NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY to point uploads at your own Uploadcare
//project; the fallback is the public demo project used by the setup guide.
const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY || '2f008f76e5239286395d'

const UploadCareButton = ({ onUpload }: Props) => {
  const router = useRouter()
  const apiRef = useRef<UploadCtxProvider>(null)

  const handleUploadSuccess = useCallback(
    async (file: OutputFileEntry<'success'>) => {
      const saved = await onUpload(file.cdnUrl, file.uuid)
      //Empty the collection so the next pick starts clean instead of reopening
      //on the file that was just saved.
      apiRef.current?.getAPI().removeAllFiles()
      if (saved) router.refresh()
    },
    [onUpload, router]
  )

  return (
    <FileUploaderRegular
      dynamicButton
      pubkey={PUBLIC_KEY}
      sourceList="local, url, gdrive, onedrive"
      multiple={false}
      userAgentIntegration="llm-nextjs"
      apiRef={apiRef}
      onFileUploadSuccess={handleUploadSuccess}
    />
  )
}

export default UploadCareButton
