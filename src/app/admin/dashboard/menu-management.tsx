'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '@/lib/supabase';
import { Save, Plus, Trash2 } from 'lucide-react';

interface MenuItem {
  id: string;
  title: string;
  display_name: string;
  parent_id: string | null;
  order: number;
  category: string;
}

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('order');
    
    if (error) {
      console.error('Error fetching menu items:', error);
      return;
    }

    setMenuItems(data || []);
    setLoading(false);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setMenuItems(updatedItems);

    // Update in database
    try {
      const updates = updatedItems.map((item) => ({
        id: item.id,
        order: item.order
      }));

      const { error } = await supabase
        .from('tools')
        .upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const { error } = await supabase
        .from('tools')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setMenuItems(menuItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Menu Management</h2>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="menu-items">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {menuItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4"
                    >
                      {editingItem === item.id ? (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={item.display_name || item.title}
                            onChange={(e) => setMenuItems(menuItems.map(i => 
                              i.id === item.id ? { ...i, display_name: e.target.value } : i
                            ))}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                            placeholder="Display Name"
                          />
                          <select
                            value={item.category || ''}
                            onChange={(e) => setMenuItems(menuItems.map(i => 
                              i.id === item.id ? { ...i, category: e.target.value } : i
                            ))}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                          >
                            <option value="">No Category</option>
                            <option value="Convert Case">Convert Case</option>
                            <option value="Text Modification/Formatting">Text Modification/Formatting</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateMenuItem(item.id, {
                                display_name: item.display_name,
                                category: item.category
                              })}
                              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <h3 className="font-medium">{item.display_name || item.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Category: {item.category || 'None'}
                            </p>
                          </div>
                          <button
                            onClick={() => setEditingItem(item.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 