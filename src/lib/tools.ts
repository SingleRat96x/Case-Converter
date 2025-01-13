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

export async function getToolContent(toolId: string): Promise<ToolContent | null> {
  try {
    // Check if we have a valid cached version
    const cachedTool = toolContentCache[toolId];
    const now = Date.now();
    
    if (cachedTool && (now - cachedTool.timestamp) < CACHE_DURATION) {
      console.log('Returning cached tool content for:', toolId);
      return cachedTool.content;
    }

    console.log('Fetching tool content for ID:', toolId);
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
      // Update cache
      toolContentCache[toolId] = {
        content: data,
        timestamp: now
      };
      console.log('Updated cache for tool:', toolId);
    }
    
    console.log('Fetched tool data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching tool content:', error);
    return null;
  }
}

// Cache for all tools
const allToolsCache: { content: ToolContent[]; timestamp: number } = {
  content: [],
  timestamp: 0
};

export async function getAllTools(): Promise<ToolContent[]> {
  try {
    // Check if we have a valid cached version
    const now = Date.now();
    if (allToolsCache.content.length > 0 && (now - allToolsCache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached tools list');
      return allToolsCache.content;
    }

    console.log('Fetching all tools');
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('name');

    if (error) {
      console.error('Supabase error fetching tools:', error);
      throw error;
    }

    if (data) {
      // Update cache
      allToolsCache.content = data;
      allToolsCache.timestamp = now;
      console.log('Updated tools list cache');
      console.log('Tools with show_in_index=true:', data.filter(tool => tool.show_in_index).map(t => t.id));
    }

    console.log('Fetched tools data:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching all tools:', error);
    return [];
  }
}

// Function to invalidate cache for a specific tool
export function invalidateToolCache(toolId: string) {
  delete toolContentCache[toolId];
  allToolsCache.timestamp = 0; // Force refresh of all tools list
  console.log('Invalidated cache for tool:', toolId);
}

// Function to invalidate all caches
export function invalidateAllCaches() {
  Object.keys(toolContentCache).forEach(key => delete toolContentCache[key]);
  allToolsCache.timestamp = 0;
  console.log('Invalidated all caches');
} 