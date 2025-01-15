"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface HeaderScript {
  id: string;
  label: string;
  script: string;
  is_enabled: boolean;
}

export function HeaderScriptManager() {
  const [scripts, setScripts] = useState<HeaderScript[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newScript, setNewScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch existing scripts
  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("header_scripts")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error("Error fetching scripts:", error);
      toast({
        title: "Error",
        description: "Failed to load scripts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateScript = (script: string): boolean => {
    // Basic validation - check for potentially harmful content
    const dangerousPatterns = [
      /<\s*script[^>]*src\s*=\s*["']?http:\/\//i, // Prevent non-HTTPS scripts
      /document\.write/i, // Prevent document.write
      /eval\s*\(/i, // Prevent eval
    ];

    return !dangerousPatterns.some(pattern => pattern.test(script));
  };

  const handleAddScript = async () => {
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

    setIsSaving(true);
    try {
      const { error } = await supabase.from("header_scripts").insert([
        {
          label: newLabel,
          script: newScript,
          is_enabled: true,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Script added successfully.",
      });

      setNewLabel("");
      setNewScript("");
      fetchScripts();
    } catch (error) {
      console.error("Error adding script:", error);
      toast({
        title: "Error",
        description: "Failed to add script. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleScript = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("header_scripts")
        .update({ is_enabled: !currentState })
        .eq("id", id);

      if (error) throw error;

      setScripts(scripts.map(script => 
        script.id === id 
          ? { ...script, is_enabled: !currentState }
          : script
      ));

      toast({
        title: "Success",
        description: `Script ${!currentState ? "enabled" : "disabled"} successfully.`,
      });
    } catch (error) {
      console.error("Error toggling script:", error);
      toast({
        title: "Error",
        description: "Failed to update script status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteScript = async (id: string) => {
    if (!confirm("Are you sure you want to delete this script?")) return;

    try {
      const { error } = await supabase
        .from("header_scripts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setScripts(scripts.filter(script => script.id !== id));
      toast({
        title: "Success",
        description: "Script deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting script:", error);
      toast({
        title: "Error",
        description: "Failed to delete script. Please try again.",
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
        <h2 className="text-2xl font-bold mb-4">Add New Script</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="script-label">Script Label</Label>
            <Input
              id="script-label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g., Google Analytics"
              className="mt-1"
            />
          </div>
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
            <div>
              <Label>Preview</Label>
              <pre className="mt-1 p-4 bg-secondary rounded-md overflow-x-auto">
                <code>{newScript}</code>
              </pre>
            </div>
          )}
          <Button
            onClick={handleAddScript}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Add Script"
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Existing Scripts</h2>
        <div className="space-y-4">
          {scripts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No scripts added yet.
            </p>
          ) : (
            scripts.map((script) => (
              <Card key={script.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{script.label}</div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={script.is_enabled}
                      onCheckedChange={() =>
                        handleToggleScript(script.id, script.is_enabled)
                      }
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteScript(script.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <pre className="p-2 bg-secondary rounded-md overflow-x-auto">
                  <code>{script.script}</code>
                </pre>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
} 