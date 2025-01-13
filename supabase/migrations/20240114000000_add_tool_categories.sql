-- Add category column to tools table
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Update existing tools with their categories
UPDATE tools
SET category = 'Convert Case'
WHERE id IN ('uppercase', 'lowercase', 'title-case', 'sentence-case', 'alternating-case');

UPDATE tools
SET category = 'Text Modification/Formatting'
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
    'remove-formatting'
);

-- Add comment to explain the column
COMMENT ON COLUMN tools.category IS 'The category this tool belongs to for organization in the admin dashboard'; 