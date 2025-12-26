'use server'

import { db } from '@/lib/db'

export const onDeleteWorkflow = async (workflowId: string) => {
  try {
    const response = await db.workflows.delete({
      where: {
        id: workflowId,
      },
    })

    if (response) {
      return { message: 'Workflow deleted successfully' }
    }

    return { message: 'Failed to delete workflow' }
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return { message: 'Error deleting workflow' }
  }
}
