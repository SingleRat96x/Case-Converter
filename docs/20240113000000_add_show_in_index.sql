-- Add show_in_index column to tools table
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS show_in_index BOOLEAN DEFAULT false;

-- Set show_in_index to true for specific tools
UPDATE tools
SET show_in_index = true
WHERE id IN (
    'uppercase',
    'lowercase',
    'title-case',
    'sentence-case',
    'alternating-case',
    'text-counter'
);

-- Add comment to explain the column
COMMENT ON COLUMN tools.show_in_index IS 'Determines whether the tool should be shown in the More Tools section on the index page';

-- Verify the changes
SELECT id, name, show_in_index 
FROM tools 
ORDER BY name; 