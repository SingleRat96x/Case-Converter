"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface HeaderElement {
  id: string;
  label: string;
  type: 'script' | 'meta' | 'html';
  script?: string;
  meta_name?: string;
  meta_content?: string;
  html_content?: string;
  is_enabled: boolean;
  position: number;
}

export function HeaderScriptManager() {
  const [elements, setElements] = useState<HeaderElement[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newScript, setNewScript] = useState("");
  const [newMetaName, setNewMetaName] = useState("");
  const [newMetaContent, setNewMetaContent] = useState("");
  const [newHtmlContent, setNewHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'meta' | 'html'>('script');
  const { toast } = useToast();

  useEffect(() => {
    fetchElements();
  }, []);

  const fetchElements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("header_scripts")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      setElements(data || []);
    } catch (error) {
      console.error("Error fetching elements:", error);
      toast({
        title: "Error",
        description: "Failed to load header elements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateScript = (script: string): boolean => {
    const dangerousPatterns = [
      /<\s*script[^>]*src\s*=\s*["']?http:\/\//i,
      /document\.write/i,
      /eval\s*\(/i,
    ];

    return !dangerousPatterns.some(pattern => pattern.test(script));
  };

  const handleAdd = async () => {
    if (activeTab === 'script') {
      if (!newLabel.trim() || !newScript.trim()) {
        toast({
          title: "Error",
          description: "Please provide both a label and script content.",
          variant: "destructive",
        });
        return;
      }

      if (!validateScript(newScript)) {
        toast({
          title: "Error",
          description: "The script contains potentially unsafe content.",
          variant: "destructive",
        });
        return;
      }
    } else if (activeTab === 'meta') {
      if (!newLabel.trim() || !newMetaName.trim() || !newMetaContent.trim()) {
        toast({
          title: "Error",
          description: "Please provide a label, meta name, and content.",
          variant: "destructive",
        });
        return;
      }
    } else if (activeTab === 'html') {
      if (!newLabel.trim() || !newHtmlContent.trim()) {
        toast({
          title: "Error",
          description: "Please provide both a label and HTML content.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("header_scripts").insert([{
        label: newLabel,
        type: activeTab,
        script: activeTab === 'script' ? newScript : null,
        meta_name: activeTab === 'meta' ? newMetaName : null,
        meta_content: activeTab === 'meta' ? newMetaContent : null,
        html_content: activeTab === 'html' ? newHtmlContent : null,
        is_enabled: true,
        position: elements.length,
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${activeTab === 'script' ? 'Script' : activeTab === 'meta' ? 'Meta tag' : 'HTML tag'} added successfully.`,
      });

      setNewLabel("");
      setNewScript("");
      setNewMetaName("");
      setNewMetaContent("");
      setNewHtmlContent("");
      fetchElements();
    } catch (error) {
      console.error("Error adding element:", error);
      toast({
        title: "Error",
        description: "Failed to add element. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("header_scripts")
        .update({ is_enabled: !currentState })
        .eq("id", id);

      if (error) throw error;

      setElements(elements.map(element => 
        element.id === id 
          ? { ...element, is_enabled: !currentState }
          : element
      ));

      toast({
        title: "Success",
        description: `Element ${!currentState ? "enabled" : "disabled"} successfully.`,
      });
    } catch (error) {
      console.error("Error toggling element:", error);
      toast({
        title: "Error",
        description: "Failed to update element status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this element?")) return;

    try {
      const { error } = await supabase
        .from("header_scripts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setElements(elements.filter(element => element.id !== id));
      toast({
        title: "Success",
        description: "Element deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting element:", error);
      toast({
        title: "Error",
        description: "Failed to delete element. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'script' | 'meta' | 'html')}>
          <TabsList className="mb-4">
            <TabsTrigger value="script">Add Script</TabsTrigger>
            <TabsTrigger value="meta">Add Meta Tag</TabsTrigger>
            <TabsTrigger value="html">Add HTML Tag</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div>
              <Label htmlFor="element-label">Label</Label>
              <Input
                id="element-label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., Google Analytics"
                className="mt-1"
              />
            </div>

            <TabsContent value="script">
              <div>
                <Label htmlFor="script-content">Script Content</Label>
                <Textarea
                  id="script-content"
                  value={newScript}
                  onChange={(e) => setNewScript(e.target.value)}
                  placeholder="Paste your script here..."
                  className="mt-1 font-mono"
                  rows={5}
                />
              </div>
              {newScript && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <pre className="mt-1 p-4 bg-secondary rounded-md overflow-x-auto">
                    <code>{newScript}</code>
                  </pre>
                </div>
              )}
            </TabsContent>

            <TabsContent value="meta">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meta-name">Meta Name</Label>
                  <Input
                    id="meta-name"
                    value={newMetaName}
                    onChange={(e) => setNewMetaName(e.target.value)}
                    placeholder="e.g., google-site-verification"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="meta-content">Meta Content</Label>
                  <Input
                    id="meta-content"
                    value={newMetaContent}
                    onChange={(e) => setNewMetaContent(e.target.value)}
                    placeholder="Meta tag content value"
                    className="mt-1"
                  />
                </div>
                {newMetaName && newMetaContent && (
                  <div>
                    <Label>Preview</Label>
                    <pre className="mt-1 p-4 bg-secondary rounded-md overflow-x-auto">
                      <code>{`<meta name="${newMetaName}" content="${newMetaContent}" />`}</code>
                    </pre>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="html">
              <div>
                <Label htmlFor="html-content">HTML Content</Label>
                <Textarea
                  id="html-content"
                  value={newHtmlContent}
                  onChange={(e) => setNewHtmlContent(e.target.value)}
                  placeholder="Paste your HTML tag here..."
                  className="mt-1 font-mono"
                  rows={5}
                />
              </div>
              {newHtmlContent && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <pre className="mt-1 p-4 bg-secondary rounded-md overflow-x-auto">
                    <code>{newHtmlContent}</code>
                  </pre>
                </div>
              )}
            </TabsContent>

            <Button
              onClick={handleAdd}
              disabled={isSaving}
              className="w-full mt-4"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                `Add ${activeTab === 'script' ? 'Script' : activeTab === 'meta' ? 'Meta Tag' : 'HTML Tag'}`
              )}
            </Button>
          </div>
        </Tabs>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Existing Elements</h2>
        <div className="space-y-4">
          {elements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No elements added yet.
            </p>
          ) : (
            elements.map((element) => (
              <Card key={element.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{element.label}</div>
                    <div className="text-sm text-muted-foreground">
                      Type: {element.type}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={element.is_enabled}
                      onCheckedChange={() =>
                        handleToggle(element.id, element.is_enabled)
                      }
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(element.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <pre className="p-2 bg-secondary rounded-md overflow-x-auto">
                  <code>
                    {element.type === 'meta' 
                      ? `<meta name="${element.meta_name}" content="${element.meta_content}" />`
                      : element.type === 'html'
                      ? element.html_content
                      : element.script}
                  </code>
                </pre>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
} 