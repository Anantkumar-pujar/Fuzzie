'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { activateGoogleDriveListener, checkGoogleDriveListenerStatus } from '../_actions/google-drive-listener'
import { Loader2, CheckCircle, PlayCircle, AlertCircle } from 'lucide-react'

export default function GoogleDriveListenerCard() {
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      setIsChecking(true)
      const status = await checkGoogleDriveListenerStatus()
      setIsActive(status.active)
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleActivate = async () => {
    try {
      setIsLoading(true)
      const result = await activateGoogleDriveListener()
      
      if (result.success) {
        setIsActive(true)
        if (result.alreadyActive) {
          toast.info(result.message)
        } else {
          toast.success(result.message)
        }
      } else {
        toast.error(result.message)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate listener')
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            Google Drive Workflow Trigger
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={`border-2 transition-colors ${
      isActive 
        ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20' 
        : 'border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {isActive ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              Google Drive Workflow Trigger
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Google Drive Workflow Trigger
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isActive 
            ? 'Your workflows will be triggered automatically when files change in Google Drive.'
            : 'Activate the listener to enable automatic workflow execution when Google Drive files change.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {isActive ? (
            <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-100 p-3 dark:border-green-800 dark:bg-green-900/30">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800 dark:text-green-200">
                Listener is active and monitoring your Google Drive
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 rounded-lg border border-orange-300 bg-orange-100 p-3 dark:border-orange-800 dark:bg-orange-900/30">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Action Required
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Click the button below to activate workflow triggers for Google Drive
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleActivate}
                disabled={isLoading}
                className="w-full"
                variant="default"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Activate Google Drive Trigger
                  </>
                )}
              </Button>
            </>
          )}
          
          <div className="mt-2 rounded-lg border bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>How it works:</strong> Once activated, Fuzzie will monitor your Google Drive for file changes. 
              When a change is detected, any published workflows will automatically execute their configured actions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
