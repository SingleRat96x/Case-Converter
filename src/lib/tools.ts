import { supabase } from './supabase';

export interface ToolContent {
  id: string;
  name: string;
  title: string;
  short_description: string;
  long_description: string;
  updated_at: string;
  show_in_index: boolean;
  category?: string;
}

export interface ToolCategory {
  id: string;
  title: string;
  description: string;
}

export const TOOL_CATEGORIES = {
  CASE_CONVERTER: 'Convert Case',
  TEXT_MODIFICATION: 'Text Modification/Formatting',
  CODE_DATA: 'Code & Data Translation',
  IMAGE_TOOLS: 'Image Tools',
  RANDOM_GENERATORS: 'Random Generators',
  MISC_TOOLS: 'Misc. Tools',
  RESOURCES: 'Resources'
} as const;

// Cache object to store tool content
const toolContentCache: { [key: string]: { content: ToolContent; timestamp: number } } = {};
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Cache for all tools
let allToolsCache: { content: ToolContent[]; timestamp: number } = {
  content: [],
  timestamp: 0
};

export async function getAllTools(timestamp?: string | number): Promise<ToolContent[]> {
  try {
    // If timestamp is provided, bypass cache completely
    if (timestamp) {
      console.log('Timestamp provided, fetching fresh data from Supabase');
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase error fetching tools:', error);
        throw error;
      }

      return data || [];
    }

    // Check if we have a valid cached version and it's not been invalidated
    const now = Date.now();
    if (allToolsCache.content.length > 0 && 
        allToolsCache.timestamp > 0 && // Check if cache hasn't been invalidated
        (now - allToolsCache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached tools list');
      return allToolsCache.content;
    }

    console.log('Fetching fresh tools data from Supabase');
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('name');

    if (error) {
      console.error('Supabase error fetching tools:', error);
      throw error;
    }

    if (data) {
      // Update cache with fresh data
      allToolsCache = {
        content: data,
        timestamp: now
      };
      console.log('Updated tools cache with fresh data');
      console.log('Tools with show_in_index=true:', data.filter(tool => tool.show_in_index).map(t => t.id));
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all tools:', error);
    return [];
  }
}

export async function getToolContent(toolId: string): Promise<ToolContent | null> {
  try {
    // Check if we have a valid cached version
    const cachedTool = toolContentCache[toolId];
    const now = Date.now();
    
    if (cachedTool && 
        cachedTool.timestamp > 0 && // Check if cache hasn't been invalidated
        (now - cachedTool.timestamp) < CACHE_DURATION) {
      console.log('Returning cached tool content for:', toolId);
      return cachedTool.content;
    }

    console.log('Fetching fresh tool content from Supabase for ID:', toolId);
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', toolId)
      .single();

    if (error) {
      console.error('Supabase error fetching tool:', error);
      throw error;
    }
    
    if (data) {
      // Update cache with fresh data
      toolContentCache[toolId] = {
        content: data,
        timestamp: now
      };
      console.log('Updated tool cache with fresh data for:', toolId);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching tool content:', error);
    return null;
  }
}

// Function to invalidate cache for a specific tool
export function invalidateToolCache(toolId: string) {
  console.log('Invalidating cache for tool:', toolId);
  // Remove the specific tool from cache
  delete toolContentCache[toolId];
  // Reset the all tools cache completely
  allToolsCache = {
    content: [],
    timestamp: -1 // Set to -1 to force a refresh
  };
  console.log('Cache invalidated for tool:', toolId);
}

// Function to invalidate all caches
export function invalidateAllCaches() {
  console.log('Invalidating all caches...');
  // Clear all caches completely
  for (const key in toolContentCache) {
    delete toolContentCache[key];
  }
  // Reset the all tools cache
  allToolsCache = {
    content: [],
    timestamp: -1 // Set to -1 to force a refresh
  };
  console.log('All caches have been invalidated');
} 