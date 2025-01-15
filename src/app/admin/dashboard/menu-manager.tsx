'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  AlertCircle,
  Plus,
  Save,
  Trash2,
  Search,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { invalidateAllCaches } from '@/lib/tools';

interface MenuItem {
  id: string;
  name: string;
  title: string;
  display_name?: string;
  category: string;
  order: number;
  show_in_index: boolean;
  custom_style?: string;
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'alternating';
  created_at: string;
  updated_at: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export function MenuManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const validateMenuItem = (item: Partial<MenuItem>): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!item.title?.trim()) {
      errors.push({ field: 'title', message: 'Title is required' });
    }

    if (item.title && item.title.length > 100) {
      errors.push({ field: 'title', message: 'Title must be less than 100 characters' });
    }

    if (!item.category?.trim()) {
      errors.push({ field: 'category', message: 'Category is required' });
    }

    return errors;
  };

  const handleAddMenuItem = async () => {
    try {
      const validationErrors = validateMenuItem(newMenuItem);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSaving(true);
      setErrors([]);

      const { data, error } = await supabase
        .from('tools')
        .insert([{
          ...newMenuItem,
          name: newMenuItem.title?.toLowerCase().replace(/\s+/g, '-'),
          order: menuItems.length + 1,
          show_in_index: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      await fetchMenuItems();
      invalidateAllCaches();
      setShowAddModal(false);
      setNewMenuItem({});
      toast.success('Menu item added successfully');
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const validationErrors = validateMenuItem({ ...updates, title: updates.title || '' });
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSaving(true);
      const { error } = await supabase
        .from('tools')
        .update({
          title: updates.title,
          display_name: updates.display_name,
          category: updates.category,
          order: updates.order,
          custom_style: updates.custom_style,
          text_transform: updates.text_transform,
          name: updates.title?.toLowerCase().replace(/\s+/g, '-'),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchMenuItems();
      invalidateAllCaches();
      setEditingItem(null);
      setErrors([]);
      toast.success('Menu item updated successfully');
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchMenuItems();
      invalidateAllCaches();
      toast.success('Menu item deleted successfully');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('tools')
        .update({
          show_in_index: !currentVisibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchMenuItems();
      invalidateAllCaches();
      toast.success('Visibility updated successfully');
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error('Failed to update visibility');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const getDisplayText = (item: MenuItem) => {
    let text = item.display_name || item.title;
    
    switch (item.text_transform) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'capitalize':
        return text.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      case 'alternating':
        return text.split('').map((char: string, i: number) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join('');
      default:
        return text;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          disabled={isSaving}
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

      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-lg p-4"
          >
            {editingItem === item.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title (Internal)</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updatedItems = menuItems.map(i =>
                          i.id === item.id ? { ...i, title: e.target.value } : i
                        );
                        setMenuItems(updatedItems);
                      }}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Title (Optional)</label>
                    <input
                      type="text"
                      value={item.display_name || ''}
                      onChange={(e) => {
                        const updatedItems = menuItems.map(i =>
                          i.id === item.id ? { ...i, display_name: e.target.value } : i
                        );
                        setMenuItems(updatedItems);
                      }}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Leave empty to use title"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Transform</label>
                    <select
                      value={item.text_transform || 'none'}
                      onChange={(e) => {
                        const updatedItems = menuItems.map(i =>
                          i.id === item.id ? { ...i, text_transform: e.target.value as MenuItem['text_transform'] } : i
                        );
                        setMenuItems(updatedItems);
                      }}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="none">None</option>
                      <option value="uppercase">UPPERCASE</option>
                      <option value="lowercase">lowercase</option>
                      <option value="capitalize">Capitalize</option>
                      <option value="alternating">aLtErNaTiNg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => {
                        const updatedItems = menuItems.map(i =>
                          i.id === item.id ? { ...i, category: e.target.value } : i
                        );
                        setMenuItems(updatedItems);
                      }}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Order</label>
                    <input
                      type="number"
                      value={item.order}
                      onChange={(e) => {
                        const updatedItems = menuItems.map(i =>
                          i.id === item.id ? { ...i, order: parseInt(e.target.value) } : i
                        );
                        setMenuItems(updatedItems);
                      }}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Custom Style</label>
                    <input
                      type="text"
                      value={item.custom_style || ''}
                      onChange={(e) => {
                        const updatedItems = menuItems.map(i =>
                          i.id === item.id ? { ...i, custom_style: e.target.value } : i
                        );
                        setMenuItems(updatedItems);
                      }}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="CSS classes or styles"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preview</label>
                  <div className="p-3 bg-background border border-input rounded-md">
                    <span className={item.custom_style}>{getDisplayText(item)}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleUpdateMenuItem(item.id, item)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      fetchMenuItems();
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    {item.display_name && (
                      <span className="text-sm text-muted-foreground">
                        (Displays as: <span className={item.custom_style}>{getDisplayText(item)}</span>)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                      {item.category}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Order: {item.order}
                    </span>
                    {item.text_transform && item.text_transform !== 'none' && (
                      <span className="text-sm text-muted-foreground">
                        Transform: {item.text_transform}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(item.id, item.show_in_index)}
                    className={`p-2 rounded-md transition-colors ${
                      item.show_in_index ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    title={item.show_in_index ? 'Hide item' : 'Show item'}
                  >
                    {item.show_in_index ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setEditingItem(item.id)}
                    className="p-2 hover:bg-accent rounded-md transition-colors"
                    title="Edit item"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMenuItem(item.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Menu Item</h3>
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
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={newMenuItem.category || ''}
                  onChange={(e) => {
                    setNewMenuItem({ ...newMenuItem, category: e.target.value });
                    setErrors(errors.filter(error => error.field !== 'category'));
                  }}
                  className={`w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.some(e => e.field === 'category') ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.map(error => 
                  error.field === 'category' && (
                    <p key={error.message} className="text-sm text-destructive mt-1">
                      {error.message}
                    </p>
                  )
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Custom Style (Optional)</label>
                <input
                  type="text"
                  value={newMenuItem.custom_style || ''}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, custom_style: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="CSS classes or styles"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewMenuItem({});
                  setErrors([]);
                }}
                disabled={isSaving}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMenuItem}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
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