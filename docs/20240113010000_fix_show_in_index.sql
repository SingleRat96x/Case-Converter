-- First, let's see current values
SELECT id, name, show_in_index 
FROM tools 
ORDER BY name;

-- Update show_in_index for all text modification tools
UPDATE tools
SET show_in_index = true
WHERE id IN (
    'big-text',
    'bold-text',
    'bubble-text',
    'cursed-text',
    'discord-font',
    'duplicate-line-remover',
    'facebook-font',
    'instagram-fonts',
    'invisible-text',
    'italic-text',
    'mirror-text',
    'phonetic-spelling',
    'pig-latin',
    'plain-text',
    'remove-line-breaks',
    'remove-text-formatting'
);

-- Verify the changes
SELECT id, name, show_in_index 
FROM tools 
ORDER BY name;

-- Clear the cache in the tools table
UPDATE tools
SET updated_at = NOW()
WHERE show_in_index = true; 