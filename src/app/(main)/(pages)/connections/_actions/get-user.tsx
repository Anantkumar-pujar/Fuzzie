'use server'

import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'

// Ensures a User row exists for the current Clerk user and returns it with connections
// If an id is passed, it is treated as the Clerk user id; otherwise currentUser() is used
export const getUserData = async (id?: string) => {
  try {
    const clerkUser = await currentUser()

    // Determine clerkId to use
    const clerkId = id ?? clerkUser?.id
    if (!clerkId) {
      console.log('No clerkId available')
      return null
    }

    console.log('Upserting user with clerkId:', clerkId)

    // Prepare fallback-safe profile fields when creating/updating
    const email =
      clerkUser?.primaryEmailAddress?.emailAddress ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      // As a last resort, synthesize a unique email (required by schema)
      `${clerkId}@placeholder.local`

    const name =
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') ||
      clerkUser?.username ||
      email

    // Upsert guarantees a row exists even on the first visit
    const user_info = await db.user.upsert({
      where: { clerkId },
      update: {
        email,
        name,
        profileImage: clerkUser?.imageUrl,
      },
      create: {
        clerkId,
        email,
        name,
        profileImage: clerkUser?.imageUrl ?? undefined,
      },
      include: { connections: true },
    })

    console.log('User upserted successfully:', user_info.clerkId)
    return user_info
  } catch (error) {
    console.error('Error in getUserData:', error)
    throw error
  }
}
