'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateToolContent(toolId: string) {
  try {
    // Force revalidate the home page
    revalidatePath('/', 'page');
    revalidatePath('/', 'layout');
    
    // Force revalidate the tools page
    revalidatePath('/tools', 'page');
    revalidatePath('/tools', 'layout');

    // If a specific tool, revalidate its page
    if (toolId !== '*') {
      revalidatePath(`/tools/${toolId}`, 'page');
      revalidatePath(`/tools/${toolId}`, 'layout');
    }
    
    // Revalidate all related tags
    revalidateTag('tools');
    if (toolId !== '*') {
      revalidateTag(`tool-${toolId}`);
    }
    
    console.log('Revalidation complete for:', {
      toolId,
      paths: [
        '/',
        '/tools',
        ...(toolId !== '*' ? [`/tools/${toolId}`] : [])
      ]
    });

    return { success: true };
  } catch (error) {
    console.error('Error during revalidation:', error);
    throw error;
  }
} 