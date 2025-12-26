'use server'

import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export const activateGoogleDriveListener = async () => {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, message: 'User not authenticated' }
    }

    // Check if listener is already active
    const userData = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { googleResourceId: true },
    })

    if (userData?.googleResourceId) {
      return {
        success: true,
        message: 'Google Drive listener is already active',
        alreadyActive: true,
      }
    }

    // Call the API endpoint to set up the listener
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://localhost:3000'
    const response = await fetch(`${baseUrl}/api/drive-activity`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      return {
        success: false,
        message: errorData.message || 'Failed to activate listener',
      }
    }

    const result = await response.text()
    
    return {
      success: true,
      message: 'Google Drive listener activated successfully!',
      alreadyActive: false,
    }
  } catch (error: any) {
    console.error('Error activating Google Drive listener:', error)
    return {
      success: false,
      message: error.message || 'Failed to activate listener',
    }
  }
}

export const checkGoogleDriveListenerStatus = async () => {
  try {
    const user = await currentUser()
    if (!user) {
      return { active: false, message: 'User not authenticated' }
    }

    const userData = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { googleResourceId: true },
    })

    return {
      active: !!userData?.googleResourceId,
      resourceId: userData?.googleResourceId || null,
    }
  } catch (error: any) {
    console.error('Error checking listener status:', error)
    return { active: false, message: error.message }
  }
}
