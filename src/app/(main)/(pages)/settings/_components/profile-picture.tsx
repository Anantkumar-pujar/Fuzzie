'use client'
import React, { useState } from 'react'
import UploadCareButton from './uploadcare-button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type Props = {
  userImage: string | null
  onDelete?: () => Promise<any>
  //The uploader also reports the Uploadcare uuid; the settings server action
  //only persists the CDN url, so it simply ignores the second argument.
  onUpload: (cdnUrl: string, uuid: string) => Promise<any>
}

const ProfilePicture = ({ userImage, onDelete, onUpload }: Props) => {
  const router = useRouter()
  const [isRemoving, setIsRemoving] = useState(false)

  const onRemoveProfileImage = async () => {
    if (!onDelete) return
    setIsRemoving(true)
    try {
      const response = await onDelete()
      if (response) {
        router.refresh()
      }
    } finally {
      setIsRemoving(false)
    }
  }

  const hasImage = !!userImage && userImage.trim() !== ''

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg text-foreground">Profile Picture</p>
      <div className="flex flex-col items-center gap-4">
        {hasImage && (
          <>
            <div className="relative h-40 w-40 overflow-hidden rounded-full border border-border">
              <Image
                src={userImage as string}
                alt="Profile picture"
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <Button
              onClick={onRemoveProfileImage}
              disabled={isRemoving}
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
              {isRemoving ? 'Removing...' : 'Remove picture'}
            </Button>
          </>
        )}
        {/* The uploader stays mounted next to the preview so the picture can be
        replaced directly, without removing it first. */}
        <UploadCareButton onUpload={onUpload} />
      </div>
    </div>
  )
}

export default ProfilePicture
