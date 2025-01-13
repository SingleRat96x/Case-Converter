-- Create the tool_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS tool_categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the tool_category_mappings table if it doesn't exist
CREATE TABLE IF NOT EXISTS tool_category_mappings (
    tool_id TEXT REFERENCES tools(id),
    category_id TEXT REFERENCES tool_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (tool_id, category_id)
);

-- Add new tools to the tools table
INSERT INTO tools (id, name, title, short_description, long_description, updated_at) VALUES
('big-text', 'Big Text', 'Big Text Converter', 'Convert your text into big letters', '', NOW()),
('bold-text', 'Bold Text', 'Bold Text Generator', 'Create bold text for social media', '', NOW()),
('bubble-text', 'Bubble Text', 'Bubble Text Generator', 'Create bubble-style text', '', NOW()),
('cursed-text', 'Cursed Text', 'Cursed Text Tool', 'Create creepy and cursed text effects', '', NOW()),
('discord-font', 'Discord Font', 'Discord Font Generator', 'Create stylized text for Discord', '', NOW()),
('duplicate-line-remover', 'Duplicate Line Remover', 'Duplicate Line Remover', 'Remove duplicate lines from your text', '', NOW()),
('facebook-font', 'Facebook Font', 'Facebook Font Generator', 'Create stylized text for Facebook', '', NOW()),
('instagram-fonts', 'Instagram Fonts', 'Fonts for Instagram', 'Create stylized text for Instagram', '', NOW()),
('invisible-text', 'Invisible Text', 'Invisible Text Generator', 'Create invisible characters and text', '', NOW()),
('italic-text', 'Italic Text', 'Italic Text Converter', 'Convert text to italic style', '', NOW()),
('mirror-text', 'Mirror Text', 'Mirror Text Generator', 'Create mirrored text effects', '', NOW()),
('phonetic-spelling', 'Phonetic Spelling', 'Phonetic Spelling Generator', 'Convert text to phonetic spelling', '', NOW()),
('pig-latin', 'Pig Latin', 'Pig Latin Translator', 'Convert text to Pig Latin', '', NOW()),
('plain-text', 'Plain Text', 'Plain Text Converter', 'Remove all formatting from text', '', NOW()),
('remove-line-breaks', 'Remove Line Breaks', 'Remove Line Breaks', 'Clean up text by removing line breaks', '', NOW()),
('remove-formatting', 'Remove Formatting', 'Remove Text Formatting', 'Strip all formatting from text', '', NOW());

-- Create a new category for text modification tools
INSERT INTO tool_categories (id, title, description) VALUES
('text-modification', 'Text Modification/Formatting', 'Tools for modifying and formatting text in various ways');

-- Associate tools with the new category
INSERT INTO tool_category_mappings (tool_id, category_id) VALUES
('big-text', 'text-modification'),
('bold-text', 'text-modification'),
('bubble-text', 'text-modification'),
('cursed-text', 'text-modification'),
('discord-font', 'text-modification'),
('duplicate-line-remover', 'text-modification'),
('facebook-font', 'text-modification'),
('instagram-fonts', 'text-modification'),
('invisible-text', 'text-modification'),
('italic-text', 'text-modification'),
('mirror-text', 'text-modification'),
('phonetic-spelling', 'text-modification'),
('pig-latin', 'text-modification'),
('plain-text', 'text-modification'),
('remove-line-breaks', 'text-modification'),
('remove-formatting', 'text-modification'); 