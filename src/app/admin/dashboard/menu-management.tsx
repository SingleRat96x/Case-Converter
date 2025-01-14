'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '@/lib/supabase';
import { Save, Plus, Trash2, Settings, Search, ChevronRight, ChevronDown, AlertCircle, Eye, Move, Menu as MenuIcon } from 'lucide-react';
import { TOOL_CATEGORIES } from '@/lib/tools';

interface MenuItem {
  id: string;
  title: string;
  display_name: string;
  parent_id: string | null;
  order: number;
  category: string;
  children?: MenuItem[];
}

interface ValidationError {
  field: string;
  message: string;
}

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({});
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [splitView, setSplitView] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('order');
      
      if (error) throw error;

      // Organize items into a tree structure
      const items = data || [];
      const itemMap = new Map<string, MenuItem>();
      const rootItems: MenuItem[] = [];

      // First pass: Create all items
      items.forEach(item => {
        itemMap.set(item.id, { ...item, children: [] });
      });

      // Second pass: Build the tree
      items.forEach(item => {
        const menuItem = itemMap.get(item.id)!;
        if (item.parent_id && itemMap.has(item.parent_id)) {
          const parent = itemMap.get(item.parent_id)!;
          parent.children!.push(menuItem);
        } else {
          rootItems.push(menuItem);
        }
      });

      setMenuItems(rootItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reorderItems = (items: MenuItem[], startIndex: number, endIndex: number): MenuItem[] => {
      const result = Array.from(items);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;

    let updatedItems = [...menuItems];
    
    if (sourceId === destinationId) {
      // Reordering within the same parent
      if (sourceId === 'root') {
        updatedItems = reorderItems(menuItems, result.source.index, result.destination.index);
      } else {
        // Find the parent item and reorder its children
        const updateChildrenOrder = (items: MenuItem[]): MenuItem[] => {
          return items.map(item => {
            if (item.id === sourceId) {
              return {
                ...item,
                children: reorderItems(item.children || [], result.source.index, result.destination.index)
              };
            }
            if (item.children?.length) {
              return {
                ...item,
                children: updateChildrenOrder(item.children)
              };
            }
            return item;
          });
        };
        updatedItems = updateChildrenOrder(updatedItems);
      }
    } else {
      // Moving between different parents
      const findItemAndRemove = (items: MenuItem[], itemIndex: number, sourceParentId: string): [MenuItem | null, MenuItem[]] => {
        if (sourceParentId === 'root') {
          const [removed] = items.splice(itemIndex, 1);
          return [removed, items];
        }
        
        const result = items.map(item => {
          if (item.id === sourceParentId && item.children) {
            const [removed] = item.children.splice(itemIndex, 1);
            return { ...item, children: item.children };
          }
          if (item.children?.length) {
            const [removed, newChildren] = findItemAndRemove(item.children, itemIndex, sourceParentId);
            return { ...item, children: newChildren };
          }
          return item;
        });
        
        return [null, result];
      };

      const [movedItem, afterSourceRemoval] = findItemAndRemove(updatedItems, result.source.index, sourceId);
      if (!movedItem) return;

      const insertItem = (items: MenuItem[], itemToInsert: MenuItem, destinationParentId: string, destinationIndex: number): MenuItem[] => {
        if (destinationParentId === 'root') {
          items.splice(destinationIndex, 0, { ...itemToInsert, parent_id: null });
          return items;
        }
        
        return items.map(item => {
          if (item.id === destinationParentId) {
            const newChildren = [...(item.children || [])];
            newChildren.splice(destinationIndex, 0, { ...itemToInsert, parent_id: item.id });
            return { ...item, children: newChildren };
          }
          if (item.children?.length) {
            return { ...item, children: insertItem(item.children, itemToInsert, destinationParentId, destinationIndex) };
          }
          return item;
        });
      };

      updatedItems = insertItem(afterSourceRemoval, movedItem, destinationId, result.destination.index);
    }

    setMenuItems(updatedItems);

    // Update the database with new order and parent relationships
    try {
      const flattenItems = (items: MenuItem[], parentId: string | null = null, order: number = 0): { id: string; parent_id: string | null; order: number }[] => {
        let result: { id: string; parent_id: string | null; order: number }[] = [];
        items.forEach((item, index) => {
          result.push({
            id: item.id,
            parent_id: parentId,
            order: order + index
          });
          if (item.children?.length) {
            result = result.concat(flattenItems(item.children, item.id, (order + index) * 1000));
          }
        });
        return result;
      };

      const updates = flattenItems(updatedItems);
      const { error } = await supabase
        .from('tools')
        .upsert(updates.map(update => ({
          id: update.id,
          parent_id: update.parent_id,
          order: update.order
        })));

      if (error) throw error;
    } catch (error) {
      console.error('Error updating menu structure:', error);
    }
  };

  const validateMenuItem = (item: Partial<MenuItem>): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!item.title?.trim()) {
      errors.push({ field: 'title', message: 'Title is required' });
    }

    if (item.title && item.title.length > 100) {
      errors.push({ field: 'title', message: 'Title must be less than 100 characters' });
    }

    if (item.display_name && item.display_name.length > 100) {
      errors.push({ field: 'display_name', message: 'Display name must be less than 100 characters' });
    }

    return errors;
  };

  const addNewMenuItem = async () => {
    try {
      const validationErrors = validateMenuItem(newMenuItem);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSaving(true);
      setErrors([]);
      setActionError(null);

      const { data, error } = await supabase
        .from('tools')
        .insert([{
          ...newMenuItem,
          order: menuItems.length + 1,
          show_in_index: true
        }])
        .select()
        .single();

      if (error) throw error;

      if (newMenuItem.parent_id) {
        const updateParentInTree = (items: MenuItem[]): MenuItem[] => {
          return items.map(item => {
            if (item.id === newMenuItem.parent_id) {
              return {
                ...item,
                children: [...(item.children || []), { ...data, children: [] }]
              };
            }
            if (item.children?.length) {
              return { ...item, children: updateParentInTree(item.children) };
            }
            return item;
          });
        };
        setMenuItems(updateParentInTree(menuItems));
      } else {
        setMenuItems([...menuItems, { ...data, children: [] }]);
      }
      
      setShowAddModal(false);
      setNewMenuItem({});
    } catch (error) {
      console.error('Error adding menu item:', error);
      setActionError('Failed to add menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const validationErrors = validateMenuItem({ ...updates, title: updates.title || '' });
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSaving(true);
      setErrors([]);
      setActionError(null);

      const { error } = await supabase
        .from('tools')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      const updateItemInTree = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.id === id) {
            return { ...item, ...updates };
          }
          if (item.children?.length) {
            return { ...item, children: updateItemInTree(item.children) };
          }
          return item;
        });
      };

      setMenuItems(updateItemInTree(menuItems));
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating menu item:', error);
      setActionError('Failed to update menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return;
    }

    try {
      setIsSaving(true);
      setActionError(null);

      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const removeItemFromTree = (items: MenuItem[]): MenuItem[] => {
        return items.filter(item => {
          if (item.id === id) return false;
          if (item.children?.length) {
            item.children = removeItemFromTree(item.children);
          }
          return true;
        });
      };

      setMenuItems(removeItemFromTree(menuItems));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setActionError('Failed to delete menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreviewMenuItem = (item: MenuItem) => {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div className="menu-preview-item">
        <div 
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md transition-colors
            ${hasChildren ? 'font-medium' : 'text-sm'}
            hover:bg-accent/50 cursor-pointer
          `}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="p-1 hover:bg-accent rounded-md transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          <span className="truncate">{item.display_name || item.title}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4 pl-4 border-l border-border space-y-1 mt-1">
            {item.children?.map((child) => renderPreviewMenuItem(child))}
          </div>
        )}
      </div>
    );
  };

  const renderMenuItem = (item: MenuItem, index: number, parentId: string = 'root') => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;

    return (
      <Draggable key={item.id} draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`
              bg-card border border-border rounded-lg shadow-sm transition-all
              ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''}
              ${editingItem === item.id ? 'ring-2 ring-primary/50' : ''}
            `}
          >
            <div className="p-4">
              <div className="flex items-center gap-2">
                <div 
                  {...provided.dragHandleProps} 
                  className="cursor-move p-2 hover:bg-accent rounded-md transition-colors"
                  title="Drag to reorder"
                >
                  <Move className="h-4 w-4 text-muted-foreground" />
                </div>
                {hasChildren && (
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="p-2 hover:bg-accent rounded-md transition-colors"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
                {editingItem === item.id ? (
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Display Name</label>
                        <input
                          type="text"
                          value={item.display_name || item.title}
                          onChange={(e) => {
                            const updateItemInTree = (items: MenuItem[]): MenuItem[] => {
                              return items.map(i => {
                                if (i.id === item.id) {
                                  return { ...i, display_name: e.target.value };
                                }
                                if (i.children?.length) {
                                  return { ...i, children: updateItemInTree(i.children) };
                                }
                                return i;
                              });
                            };
                            setMenuItems(updateItemInTree(menuItems));
                          }}
                          className={`
                            w-full px-3 py-2 bg-background border rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-ring
                            ${errors.some(e => e.field === 'display_name') ? 'border-destructive' : 'border-input'}
                          `}
                          placeholder="Display Name"
                        />
                        {errors.map(error => 
                          error.field === 'display_name' && (
                            <p key={error.message} className="text-sm text-destructive mt-1">
                              {error.message}
                            </p>
                          )
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                          value={item.category || ''}
                          onChange={(e) => {
                            const updateItemInTree = (items: MenuItem[]): MenuItem[] => {
                              return items.map(i => {
                                if (i.id === item.id) {
                                  return { ...i, category: e.target.value };
                                }
                                if (i.children?.length) {
                                  return { ...i, children: updateItemInTree(i.children) };
                                }
                                return i;
                              });
                            };
                            setMenuItems(updateItemInTree(menuItems));
                          }}
                          className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">No Category</option>
                          {Object.values(TOOL_CATEGORIES).map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => updateMenuItem(item.id, {
                          display_name: item.display_name,
                          category: item.category
                        })}
                        disabled={isSaving}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(null);
                          setErrors([]);
                        }}
                        disabled={isSaving}
                        className="px-4 py-2 bg-muted hover:bg-accent rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.display_name || item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`
                          px-2 py-0.5 text-xs rounded-full
                          ${item.category ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
                        `}>
                          {item.category || 'No Category'}
                        </span>
                        {hasChildren && item.children && (
                          <span className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">
                            {item.children.length} {item.children.length === 1 ? 'item' : 'items'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingItem(item.id);
                          setErrors([]);
                        }}
                        className="p-2 hover:bg-accent rounded-md transition-colors"
                        title="Edit"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        disabled={isSaving}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {hasChildren && isExpanded && (
              <Droppable droppableId={item.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="pl-8 pr-4 pb-4 space-y-3"
                  >
                    {(item.children || []).map((child, childIndex) => renderMenuItem(child, childIndex, item.id))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = (item: MenuItem): boolean => {
      const titleMatch = (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.display_name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (selectedCategory === 'all' || item.category === selectedCategory);
      
      if (titleMatch) return true;
      
      if (item.children?.length) {
        return item.children.some(matchesSearch);
      }
      
      return false;
    };
    
    return matchesSearch(item);
  });

  const categories = ['all', ...new Set(menuItems.map(item => item.category).filter(Boolean))] as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{actionError}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Menu Management</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSplitView(!splitView)}
              className={`
                p-2 rounded-md transition-colors
                ${splitView ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
              `}
              title={splitView ? "Hide Preview" : "Show Preview"}
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setErrors([]);
            setActionError(null);
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      <div className={`grid gap-6 ${splitView ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MenuIcon className="h-5 w-5" />
              Menu Structure
            </h3>
            <span className="text-sm text-muted-foreground">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="root">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {filteredItems.map((item, index) => renderMenuItem(item, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {splitView && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </h3>
              <span className="text-sm text-muted-foreground">
                As shown on website
              </span>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card space-y-1">
              {menuItems.map((item) => renderPreviewMenuItem(item))}
            </div>
          </div>
        )}
      </div>

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Menu Item</h3>
            {actionError && (
              <div className="mb-4 bg-destructive/10 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p>{actionError}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newMenuItem.title || ''}
                  onChange={(e) => {
                    setNewMenuItem({ ...newMenuItem, title: e.target.value });
                    setErrors(errors.filter(error => error.field !== 'title'));
                  }}
                  className={`w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.some(e => e.field === 'title') ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Menu Item Title"
                />
                {errors.map(error => 
                  error.field === 'title' && (
                    <p key={error.message} className="text-sm text-destructive mt-1">
                      {error.message}
                    </p>
                  )
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  value={newMenuItem.display_name || ''}
                  onChange={(e) => {
                    setNewMenuItem({ ...newMenuItem, display_name: e.target.value });
                    setErrors(errors.filter(error => error.field !== 'display_name'));
                  }}
                  className={`w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.some(e => e.field === 'display_name') ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Display Name (optional)"
                />
                {errors.map(error => 
                  error.field === 'display_name' && (
                    <p key={error.message} className="text-sm text-destructive mt-1">
                      {error.message}
                    </p>
                  )
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newMenuItem.category || ''}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">No Category</option>
                  {Object.values(TOOL_CATEGORIES).map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parent Menu</label>
                <select
                  value={newMenuItem.parent_id || ''}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, parent_id: e.target.value || null })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">No Parent (Root Level)</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.display_name || item.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setErrors([]);
                  setNewMenuItem({});
                }}
                disabled={isSaving}
                className="px-4 py-2 bg-muted hover:bg-accent rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={addNewMenuItem}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 