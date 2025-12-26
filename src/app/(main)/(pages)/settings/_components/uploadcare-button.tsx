
'use client';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  onUpload: (e: string) => any;
};




const UploadCareButton = ({ onUpload }: Props) => {
  const router = useRouter();
  const uploaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import('@uploadcare/file-uploader');
    const handler = async (event: any) => {
      const cdnUrl = event.detail?.cdnUrl;
      if (cdnUrl) {
        const file = await onUpload(cdnUrl);
        if (file) {
          router.refresh();
        }
      }
    };
    const uploader = uploaderRef.current?.querySelector('uc-file-uploader-regular');
    if (uploader) {
      uploader.addEventListener('uploadcomplete', handler);
    }
    return () => {
      if (uploader) {
        uploader.removeEventListener('uploadcomplete', handler);
      }
    };
  }, [onUpload, router]);

  return (
    <div ref={uploaderRef}>
      <uc-file-uploader-regular
        public-key="a9428ff5ff90ae7a64eb"
        css-src="https://cdn.jsdelivr.net/npm/@uploadcare/file-uploader@1.19.5/web/uc-file-uploader-regular.min.css"
      ></uc-file-uploader-regular>
    </div>
  );
};

export default UploadCareButton;
