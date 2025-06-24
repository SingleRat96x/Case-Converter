'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlignExtension from '@tiptap/extension-text-align';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import TableExtension from '@tiptap/extension-table';
import TableRowExtension from '@tiptap/extension-table-row';
import TableHeaderExtension from '@tiptap/extension-table-header';
import TableCellExtension from '@tiptap/extension-table-cell';
import SubscriptExtension from '@tiptap/extension-subscript';
import SuperscriptExtension from '@tiptap/extension-superscript';
import { supabase } from '@/lib/supabase';
import { invalidateToolCache, invalidateAllCaches } from '@/lib/tools';
import type { ToolContent } from '@/lib/tools';
import { clearAuthToken } from '@/lib/auth';
import { MenuManager } from './menu-manager';
import { revalidateToolContent } from '@/lib/actions';
import { PageContent, invalidatePageCache } from '@/lib/page-content';
import {
  FileText,
  RefreshCw,
  LogOut,
  LayoutGrid,
  Eye,
  EyeOff,
  ChevronLeft,
  Search,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Undo,
  Redo,
  Minus,
  Settings,
  Menu as MenuIcon,
  Users,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline,
  Table,
  FileCode,
  Superscript,
  Subscript,
} from 'lucide-react';
import {
  MetaDescription,
  getAllMetaDescriptions,
  upsertMetaDescription,
  getDefaultMetaDescription,
  PageType,
} from '@/lib/meta-descriptions';
import { MetaDescriptionEditor } from '@/components/meta-description-editor';

export function AdminDashboard() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolContent[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    | 'tools'
    | 'visibility'
    | 'menu'
    | 'pages'
    | 'scripts'
    | 'page-content'
    | 'meta'
  >('tools');
  const [staticPages, setStaticPages] = useState<
    Array<{
      id: string;
      slug: string;
      title: string;
      content: string;
      last_updated: string;
    }>
  >([]);
  const [selectedPage, setSelectedPage] = useState<{
    id: string;
    slug: string;
    title: string;
    content: string;
    last_updated: string;
  } | null>(null);
  const [editorMode, setEditorMode] = useState<'visual' | 'text'>('visual');
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [metaDescriptions, setMetaDescriptions] = useState<MetaDescription[]>(
    []
  );
  const [selectedMeta, setSelectedMeta] = useState<MetaDescription | null>(
    null
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      TextAlignExtension.configure({
        types: ['heading', 'paragraph'],
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      ImageExtension,
      TableExtension.configure({
        resizable: true,
      }),
      TableRowExtension,
      TableHeaderExtension,
      TableCellExtension,
      SubscriptExtension,
      SuperscriptExtension,
    ],
    content: selectedTool?.long_description || selectedPage?.content || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300',
      },
    },
  });

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const { isAuthenticated } = await response.json();

      if (!isAuthenticated) {
        router.push('/admin');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin');
      return false;
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    checkAuth().then(authenticated => {
      if (authenticated) {
        fetchTools();
        fetchStaticPages();
      }
    });
  }, [router]);

  useEffect(() => {
    if (activeTab === 'page-content') {
      fetchPageContent();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'meta') {
      fetchMetaDescriptions();
    }
  }, [activeTab]);

  const fetchTools = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('name');

      if (error) throw error;

      setTools(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching tools'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaticPages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .order('title');

      if (error) throw error;

      setStaticPages(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching pages'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPageContent = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('id', 'index')
        .single();

      if (error) throw error;

      setPageContent(data);
      if (editor) {
        editor.commands.setContent(data.long_description || '');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching page content'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetaDescriptions = async () => {
    try {
      setIsLoading(true);
      const data = await getAllMetaDescriptions();
      setMetaDescriptions(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching meta descriptions'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await clearAuthToken();
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login page
      router.push('/admin');
    }
  };

  const handleEditTool = (tool: ToolContent) => {
    setSelectedTool(tool);
    if (editor) {
      editor.commands.setContent(tool.long_description);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedTool || !editor) return;

    try {
      const { error } = await supabase
        .from('tools')
        .update({
          title: selectedTool.title,
          short_description: selectedTool.short_description,
          long_description: editor.getHTML(),
          show_in_index: selectedTool.show_in_index,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTool.id);

      if (error) throw error;

      // Invalidate the cache for this tool
      invalidateToolCache(selectedTool.id);

      setError(
        'Changes saved successfully! The live page will be updated shortly.'
      );
      fetchTools(); // Refresh the tools list
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while saving changes'
      );
    }
  };

  const handleVisibilityToggle = async (
    toolId: string,
    currentValue: boolean
  ) => {
    try {
      // First update the local state optimistically
      setTools(prevTools =>
        prevTools.map(tool =>
          tool.id === toolId ? { ...tool, show_in_index: !currentValue } : tool
        )
      );

      // Then update in the database
      const { error } = await supabase
        .from('tools')
        .update({
          show_in_index: !currentValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', toolId);

      if (error) throw error;

      // First invalidate the specific tool cache
      await invalidateToolCache(toolId);

      // Then invalidate all caches to ensure the index page is updated
      await invalidateAllCaches();

      // Revalidate Next.js cache
      await revalidateToolContent(toolId);

      // Finally refresh the tools list to ensure we have the latest data
      await fetchTools();

      setError(
        'Visibility updated successfully! Please wait a moment for the changes to take effect.'
      );
    } catch (err) {
      // Revert the optimistic update on error
      await fetchTools();
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while updating visibility'
      );
    }
  };

  const handleClearCache = async () => {
    try {
      setIsLoading(true);
      // Make sure to await the cache invalidation
      await invalidateAllCaches();

      // Revalidate Next.js cache for all pages
      await revalidateToolContent('*');

      // Redirect to home page with timestamp to force fresh data
      window.open(`/?t=${Date.now()}`, '_blank');

      await fetchTools(); // Refresh the tools list
      setError(
        'Cache cleared successfully! The changes will be reflected in the new tab.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while clearing the cache'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStaticPage = async () => {
    if (!selectedPage || !editor) return;

    try {
      const { error } = await supabase
        .from('static_pages')
        .update({
          title: selectedPage.title,
          content: editor.getHTML(),
        })
        .eq('id', selectedPage.id);

      if (error) throw error;

      setError('Page saved successfully!');
      fetchStaticPages();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while saving the page'
      );
    }
  };

  const handleSavePageContent = async () => {
    if (!pageContent || !editor) return;

    try {
      const { error } = await supabase
        .from('page_content')
        .update({
          title: pageContent.title,
          short_description: pageContent.short_description,
          long_description: editor.getHTML(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'index');

      if (error) throw error;

      // Invalidate the cache
      invalidatePageCache('index');

      setError(
        'Page content saved successfully! The live page will be updated shortly.'
      );

      // Revalidate Next.js cache
      await revalidateToolContent('*');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while saving page content'
      );
    }
  };

  const handleSaveMetaDescription = async (meta: Partial<MetaDescription>) => {
    try {
      const result = await upsertMetaDescription(
        meta as Omit<MetaDescription, 'id' | 'updated_at'>
      );
      if (result) {
        setError('Meta description saved successfully!');
        fetchMetaDescriptions();
        setSelectedMeta(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while saving meta description'
      );
    }
  };

  const handleAddNewMeta = async () => {
    // If we have tools but they don't have meta descriptions, show them first
    const toolsWithoutMeta = tools.filter(
      tool =>
        !metaDescriptions.some(
          meta => meta.page_type === 'tool' && meta.page_id === tool.id
        )
    );

    if (toolsWithoutMeta.length > 0) {
      const tool = toolsWithoutMeta[0];
      const defaultMeta: MetaDescription = {
        id: `tool-${tool.id}`,
        page_type: 'tool',
        page_id: tool.id,
        meta_title: tool.title,
        meta_description: tool.short_description,
        meta_keywords: `${tool.id}, text converter, text tools`,
        og_title: tool.title,
        og_description: tool.short_description,
        og_type: 'website',
        twitter_card: 'summary_large_image',
        twitter_title: tool.title,
        twitter_description: tool.short_description,
        canonical_url: `https://case-converter.vercel.app/tools/${tool.id}`,
        updated_at: new Date().toISOString(),
      };
      setSelectedMeta(defaultMeta);
    } else {
      // Create a new empty meta description
      const newMeta: MetaDescription = {
        id: '',
        page_type: 'tool',
        page_id: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        og_title: '',
        og_description: '',
        og_type: 'website',
        twitter_card: 'summary_large_image',
        twitter_title: '',
        twitter_description: '',
        canonical_url: '',
        updated_at: new Date().toISOString(),
      };
      setSelectedMeta(newMeta);
    }
  };

  const handleToolMetaClick = (tool: ToolContent) => {
    const existingMeta = metaDescriptions.find(
      meta => meta.page_type === 'tool' && meta.page_id === tool.id
    );

    if (existingMeta) {
      setSelectedMeta(existingMeta);
    } else {
      // Create a new meta description for this tool
      const newMeta: MetaDescription = {
        id: `tool-${tool.id}`,
        page_type: 'tool',
        page_id: tool.id,
        meta_title: tool.title,
        meta_description: tool.short_description,
        meta_keywords: `${tool.id}, text converter, text tools`,
        og_title: tool.title,
        og_description: tool.short_description,
        og_type: 'website',
        twitter_card: 'summary_large_image',
        twitter_title: tool.title,
        twitter_description: tool.short_description,
        canonical_url: `https://case-converter.vercel.app/tools/${tool.id}`,
        updated_at: new Date().toISOString(),
      };
      setSelectedMeta(newMeta);
    }
  };

  const filteredTools = tools.filter(
    tool =>
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.short_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const EditorMenuBar = () => {
    if (!editor) return null;

    return (
      <div className="border-b border-border p-2 mb-4 flex flex-wrap gap-1 bg-muted rounded-t-lg">
        <div className="flex w-full justify-end mb-2">
          <div className="flex items-center gap-2 bg-background rounded-lg p-1">
            <button
              onClick={() => setEditorMode('visual')}
              className={`px-3 py-1 rounded-md transition-colors ${
                editorMode === 'visual'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              Visual
            </button>
            <button
              onClick={() => setEditorMode('text')}
              className={`px-3 py-1 rounded-md transition-colors ${
                editorMode === 'text'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              HTML
            </button>
          </div>
        </div>

        {editorMode === 'visual' && (
          <>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded transition-colors ${editor.isActive('bold') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Bold"
              >
                <Bold className="h-5 w-5" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded transition-colors ${editor.isActive('italic') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Italic"
              >
                <Italic className="h-5 w-5" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded transition-colors ${editor.isActive('underline') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Underline"
              >
                <Underline className="h-5 w-5" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded transition-colors ${editor.isActive('strike') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Strikethrough"
              >
                <Strikethrough className="h-5 w-5" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                className={`p-2 rounded transition-colors ${editor.isActive('superscript') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Superscript"
              >
                <Superscript className="h-5 w-5" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                className={`p-2 rounded transition-colors ${editor.isActive('subscript') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Subscript"
              >
                <Subscript className="h-5 w-5" />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-1 self-center" />

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Heading 1"
              >
                <Heading1 className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Heading 2"
              >
                <Heading2 className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Heading 3"
              >
                <Heading3 className="h-5 w-5" />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-1 self-center" />

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() =>
                  editor.chain().focus().setTextAlign('left').run()
                }
                className={`p-2 rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Align Left"
              >
                <AlignLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().setTextAlign('center').run()
                }
                className={`p-2 rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Align Center"
              >
                <AlignCenter className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().setTextAlign('right').run()
                }
                className={`p-2 rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Align Right"
              >
                <AlignRight className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().setTextAlign('justify').run()
                }
                className={`p-2 rounded transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Justify"
              >
                <AlignJustify className="h-5 w-5" />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-1 self-center" />

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Bullet List"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Numbered List"
              >
                <ListOrdered className="h-5 w-5" />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-1 self-center" />

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded transition-colors ${editor.isActive('codeBlock') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Code Block"
              >
                <FileCode className="h-5 w-5" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded transition-colors ${editor.isActive('blockquote') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Quote"
              >
                <Quote className="h-5 w-5" />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-1 self-center" />

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => {
                  const url = window.prompt('Enter the URL:');
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={`p-2 rounded transition-colors ${editor.isActive('link') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Add Link"
              >
                <LinkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  const url = window.prompt('Enter the image URL:');
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                }}
                className="p-2 rounded transition-colors hover:bg-accent"
                title="Add Image"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
                className={`p-2 rounded transition-colors ${editor.isActive('table') ? 'bg-accent' : 'hover:bg-accent'}`}
                title="Insert Table"
              >
                <Table className="h-5 w-5" />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-1 self-center" />

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => editor.chain().focus().undo().run()}
                className="p-2 rounded transition-colors hover:bg-accent"
                title="Undo"
              >
                <Undo className="h-5 w-5" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                className="p-2 rounded transition-colors hover:bg-accent"
                title="Redo"
              >
                <Redo className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Add this function to group tools by category
  const groupToolsByCategory = (tools: ToolContent[]) => {
    return tools.reduce(
      (acc, tool) => {
        const category = tool.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(tool);
        return acc;
      },
      {} as Record<string, ToolContent[]>
    );
  };

  // Add this to render tools by category
  const renderToolsByCategory = () => {
    const groupedTools = groupToolsByCategory(filteredTools);
    return Object.entries(groupedTools).map(([category, tools]) => (
      <div key={category} className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          {category}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(tool => (
            <div
              key={tool.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {tool.title}
                </h4>
                <button
                  onClick={() => handleEditTool(tool)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Edit
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {tool.short_description}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {new Date(tool.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  // Add this to render visibility settings by category
  const renderVisibilityByCategory = () => {
    const groupedTools = groupToolsByCategory(filteredTools);
    return Object.entries(groupedTools).map(([category, tools]) => (
      <div key={category} className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          {category}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(tool => (
            <div
              key={tool.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {tool.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {tool.short_description}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleVisibilityToggle(tool.id, tool.show_in_index)
                  }
                  className={`p-2 rounded-full transition-colors ${
                    tool.show_in_index
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}
                >
                  {tool.show_in_index ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={handleClearCache}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="Clear Cache"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="mt-4 flex gap-2">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'tools'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
            Tools
          </button>
          <button
            onClick={() => setActiveTab('visibility')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'visibility'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <Settings className="h-5 w-5" />
            Visibility
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'menu'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <MenuIcon className="h-5 w-5" />
            Menu
          </button>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Desktop Only */}
        <div className="hidden lg:block w-64 border-r border-border bg-card min-h-screen p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={handleClearCache}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Clear Cache"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('tools')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'tools'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
                Tools
              </button>
              <button
                onClick={() => setActiveTab('visibility')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'visibility'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <Settings className="h-5 w-5" />
                Visibility Settings
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'menu'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <MenuIcon className="h-5 w-5" />
                Menu Management
              </button>
              <button
                onClick={() => setActiveTab('pages')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'pages'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <FileText className="h-5 w-5" />
                Static Pages
              </button>
              <button
                onClick={() => setActiveTab('page-content')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'page-content'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <FileText className="h-5 w-5" />
                Page Content
              </button>
              <button
                onClick={() => setActiveTab('meta')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'meta'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <FileText className="h-5 w-5" />
                Meta Descriptions
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {error && (
            <div
              className={`p-4 rounded-lg mb-6 ${error.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}
            >
              {error}
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Meta Descriptions</h2>
                <button
                  onClick={handleAddNewMeta}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add New
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Static Pages Section */}
                  {['index', 'static', 'category'].map(pageType => {
                    const groupedMeta = metaDescriptions.filter(
                      meta => meta.page_type === pageType
                    );
                    if (groupedMeta.length === 0) return null;

                    return (
                      <div key={pageType} className="space-y-4">
                        <h3 className="text-lg font-semibold capitalize">
                          {pageType === 'index'
                            ? 'Home Page'
                            : pageType === 'static'
                              ? 'Static Pages'
                              : 'Category Pages'}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {groupedMeta.map(meta => (
                            <div
                              key={meta.id}
                              onClick={() => setSelectedMeta(meta)}
                              className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                            >
                              <h4 className="font-medium mb-2">
                                {meta.meta_title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {meta.meta_description}
                              </p>
                              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                                <span>
                                  Last updated:{' '}
                                  {new Date(
                                    meta.updated_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Tools Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Tools</h3>
                      <div className="relative w-64">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search tools..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {tools
                        .filter(
                          tool =>
                            tool.title
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            tool.short_description
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .map(tool => {
                          const meta = metaDescriptions.find(
                            m => m.page_type === 'tool' && m.page_id === tool.id
                          );

                          return (
                            <div
                              key={tool.id}
                              onClick={() => handleToolMetaClick(tool)}
                              className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                            >
                              <h4 className="font-medium mb-2">{tool.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {meta?.meta_description ||
                                  tool.short_description}
                              </p>
                              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                                <span>
                                  {meta
                                    ? `Last updated: ${new Date(meta.updated_at).toLocaleDateString()}`
                                    : 'No meta description yet'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {selectedMeta && (
                <MetaDescriptionEditor
                  meta={selectedMeta}
                  onClose={() => setSelectedMeta(null)}
                  onSave={handleSaveMetaDescription}
                />
              )}
            </div>
          )}

          {activeTab === 'page-content' ? (
            <div className="space-y-6">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={pageContent?.title || ''}
                      onChange={e =>
                        setPageContent(prev =>
                          prev ? { ...prev, title: e.target.value } : null
                        )
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={pageContent?.short_description || ''}
                      onChange={e =>
                        setPageContent(prev =>
                          prev
                            ? { ...prev, short_description: e.target.value }
                            : null
                        )
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Content
                    </label>
                    <div className="bg-background border border-input rounded-lg overflow-hidden">
                      <EditorMenuBar />
                      {editorMode === 'visual' ? (
                        <EditorContent editor={editor} />
                      ) : (
                        <textarea
                          value={editor?.getHTML() || ''}
                          onChange={e =>
                            editor?.commands.setContent(e.target.value)
                          }
                          className="w-full min-h-[300px] p-4 bg-background text-foreground font-mono text-sm focus:outline-none"
                          spellCheck={false}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSavePageContent}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'menu' ? (
            <MenuManager />
          ) : activeTab === 'visibility' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">
                Tool Visibility Settings
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tools.map(tool => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <span className="font-medium">{tool.title}</span>
                    <button
                      onClick={() =>
                        handleVisibilityToggle(tool.id, tool.show_in_index)
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        tool.show_in_index
                          ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {tool.show_in_index ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'pages' ? (
            <div className="space-y-6">
              {selectedPage ? (
                <>
                  <button
                    onClick={() => {
                      setSelectedPage(null);
                      if (editor) {
                        editor.commands.setContent('');
                      }
                    }}
                    className="px-4 py-2 bg-muted hover:bg-accent rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Pages
                  </button>

                  <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <div className="p-6 space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={selectedPage.title}
                          onChange={e =>
                            setSelectedPage(prev =>
                              prev ? { ...prev, title: e.target.value } : null
                            )
                          }
                          className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Content
                        </label>
                        <div className="bg-background border border-input rounded-lg overflow-hidden">
                          <EditorMenuBar />
                          {editorMode === 'visual' ? (
                            <EditorContent editor={editor} />
                          ) : (
                            <textarea
                              value={editor?.getHTML() || ''}
                              onChange={e =>
                                editor?.commands.setContent(e.target.value)
                              }
                              className="w-full min-h-[300px] p-4 bg-background text-foreground font-mono text-sm focus:outline-none"
                              spellCheck={false}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          onClick={handleSaveStaticPage}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {staticPages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setSelectedPage(page);
                        if (editor) {
                          editor.commands.setContent(page.content);
                        }
                      }}
                      className="text-left p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors group"
                    >
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {page.title}
                      </h3>
                      <div className="text-xs text-muted-foreground">
                        Last updated:{' '}
                        {new Date(page.last_updated).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : isEditing && selectedTool ? (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setSelectedTool(null);
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-muted hover:bg-accent rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Tools
              </button>

              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={selectedTool?.title || ''}
                      onChange={e =>
                        setSelectedTool(prev =>
                          prev ? { ...prev, title: e.target.value } : null
                        )
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={selectedTool?.short_description || ''}
                      onChange={e =>
                        setSelectedTool(prev =>
                          prev
                            ? { ...prev, short_description: e.target.value }
                            : null
                        )
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Long Description
                    </label>
                    <div className="bg-background border border-input rounded-lg overflow-hidden">
                      <EditorMenuBar />
                      {editorMode === 'visual' ? (
                        <EditorContent editor={editor} />
                      ) : (
                        <textarea
                          value={editor?.getHTML() || ''}
                          onChange={e =>
                            editor?.commands.setContent(e.target.value)
                          }
                          className="w-full min-h-[300px] p-4 bg-background text-foreground font-mono text-sm focus:outline-none"
                          spellCheck={false}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-8">
                {Object.entries(groupToolsByCategory(filteredTools)).map(
                  ([category, tools]) => (
                    <div
                      key={category}
                      className="bg-card rounded-lg border border-border p-6"
                    >
                      <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                        {category}
                      </h2>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {tools.map(tool => (
                          <button
                            key={tool.id}
                            onClick={() => handleEditTool(tool)}
                            className="text-left p-4 bg-background rounded-lg border border-input hover:border-primary/50 transition-colors group"
                          >
                            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                              {tool.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {tool.short_description}
                            </p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Last updated:{' '}
                              {new Date(tool.updated_at).toLocaleDateString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
