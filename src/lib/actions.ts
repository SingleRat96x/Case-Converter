'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateToolContent(toolId: string) {
  try {
    // Revalidate the specific tool page
    revalidatePath(`/tools/${toolId}`);
    
    // Revalidate the tool page and its layout
    revalidatePath(`/tools/${toolId}`, 'page');
    revalidatePath(`/tools/${toolId}`, 'layout');
    
    // Revalidate the home page and tools list
    revalidatePath('/', 'page');
    revalidatePath('/tools', 'page');
    
    // Revalidate all related tags
    revalidateTag('tools');
    revalidateTag(`tool-${toolId}`);
    
    // Force revalidation of the entire app
    revalidatePath('/(.*)', 'layout');
    
    console.log('Revalidation complete for:', {
      toolId,
      paths: [
        `/tools/${toolId}`,
        '/',
        '/tools',
        '/(.*)'
      ],
      tags: ['tools', `tool-${toolId}`]
    });
  } catch (error) {
    console.error('Error during revalidation:', error);
    throw error;
  }
} 