import { supabase } from './supabase';

export interface ToolContent {
  id: string;
  name: string;
  title: string;
  display_name?: string;
  text_transform?:
    | 'none'
    | 'uppercase'
    | 'lowercase'
    | 'capitalize'
    | 'alternating';
  custom_style?: string;
  category?: string;
  short_description: string;
  long_description: string;
  updated_at: string;
  show_in_index: boolean;
  order?: number;
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
} as const;

// Cache object to store tool content with improved typing
const toolContentCache: {
  [key: string]: { content: ToolContent; timestamp: number };
} = {};
const CACHE_DURATION = 36000000; // 10 hours in milliseconds

// Cache for all tools with improved typing
let allToolsCache: { content: ToolContent[]; timestamp: number } = {
  content: [],
  timestamp: 0,
};

export async function getAllTools(
  timestamp?: string | number
): Promise<ToolContent[]> {
  try {
    // If timestamp is provided or cache is invalidated, bypass cache completely
    if (timestamp || allToolsCache.timestamp < 0) {
      console.log('Fetching fresh data from Supabase');
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('order', { ascending: true }) // Order by the menu order
        .order('name'); // Then by name as secondary sort

      if (error) {
        console.error('Supabase error fetching tools:', error);
        throw error;
      }

      // Update cache with fresh data
      if (data) {
        allToolsCache = {
          content: data,
          timestamp: Date.now(),
        };
      }

      return data || [];
    }

    // Check if we have a valid cached version
    const now = Date.now();
    if (
      allToolsCache.content.length > 0 &&
      now - allToolsCache.timestamp < CACHE_DURATION
    ) {
      console.log('Returning cached tools list');
      return allToolsCache.content;
    }

    // Fetch fresh data if cache is expired
    console.log('Cache expired, fetching fresh data');
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('order', { ascending: true })
      .order('name');

    if (error) {
      console.error('Supabase error fetching tools:', error);
      throw error;
    }

    if (data) {
      allToolsCache = {
        content: data,
        timestamp: now,
      };
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all tools:', error);
    return [];
  }
}

export async function getToolContent(
  toolId: string
): Promise<ToolContent | null> {
  try {
    // Check if we have a valid cached version
    const cachedTool = toolContentCache[toolId];
    const now = Date.now();

    if (
      cachedTool &&
      cachedTool.timestamp > 0 && // Check if cache hasn't been invalidated
      now - cachedTool.timestamp < CACHE_DURATION
    ) {
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
        timestamp: now,
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
    timestamp: -1, // Set to -1 to force a refresh
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
    timestamp: -1, // Set to -1 to force a refresh
  };
  console.log('All caches have been invalidated');
}

// Function to get a tool by its name
export async function getToolByName(name: string): Promise<ToolContent> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', name)
      .single();

    if (error) {
      console.error('Error fetching tool by name:', error);
      throw error;
    }

    if (!data) {
      throw new Error(`Tool not found: ${name}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getToolByName:', error);
    throw error;
  }
}
