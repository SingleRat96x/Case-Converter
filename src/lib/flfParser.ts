interface FLFHeader {
  signature: string;
  hardblank: string;
  height: number;
  baseline: number;
  maxLength: number;
  oldLayout: number;
  commentLines: number;
  printDirection?: number;
  fullLayout?: number;
  codetagCount?: number;
}

export interface FLFFont {
  header: FLFHeader;
  characters: Record<string, string[]>;
}

export async function parseFLFFont(fontName: string): Promise<FLFFont> {
  try {
    const response = await fetch(`/fonts/${fontName}.flf`);
    if (!response.ok) {
      throw new Error(`Failed to load font: ${fontName}`);
    }
    
    const fontData = await response.text();
    return parseFLFData(fontData);
  } catch (error) {
    console.error(`Error loading font ${fontName}:`, error);
    throw error;
  }
}

function parseFLFData(data: string): FLFFont {
  const lines = data.split('\n');
  let lineIndex = 0;
  
  // Parse header
  const headerLine = lines[lineIndex++];
  const headerParts = headerLine.split(' ');
  
  const header: FLFHeader = {
    signature: headerParts[0],
    hardblank: headerParts[0].slice(-1),
    height: parseInt(headerParts[1]),
    baseline: parseInt(headerParts[2]),
    maxLength: parseInt(headerParts[3]),
    oldLayout: parseInt(headerParts[4]),
    commentLines: parseInt(headerParts[5]),
    printDirection: headerParts[6] ? parseInt(headerParts[6]) : undefined,
    fullLayout: headerParts[7] ? parseInt(headerParts[7]) : undefined,
    codetagCount: headerParts[8] ? parseInt(headerParts[8]) : undefined
  };
  
  // Skip comment lines
  for (let i = 0; i < header.commentLines; i++) {
    lineIndex++;
  }
  
  const characters: Record<string, string[]> = {};
  
  // Standard ASCII characters (32-126)
  for (let charCode = 32; charCode <= 126; charCode++) {
    const char = String.fromCharCode(charCode);
    const charLines: string[] = [];
    
    for (let i = 0; i < header.height; i++) {
      if (lineIndex < lines.length) {
        let line = lines[lineIndex++];
        // Remove end marks (@ or @@)
        line = line.replace(/[@]{1,2}$/, '');
        // Replace hardblank with space
        line = line.replace(new RegExp(escapeRegExp(header.hardblank), 'g'), ' ');
        charLines.push(line);
      }
    }
    
    characters[char] = charLines;
  }
  
  return { header, characters };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function generateAsciiArt(text: string, font: FLFFont): string {
  const chars = text.split('');
  const height = font.header.height;
  
  const lines: string[] = Array(height).fill('').map(() => '');
  
  chars.forEach(char => {
    const charLines = font.characters[char] || font.characters[' '] || Array(height).fill('');
    for (let i = 0; i < height; i++) {
      lines[i] += charLines[i] || '';
    }
  });
  
  // Clean up lines - remove trailing spaces
  const cleanedLines = lines.map(line => line.trimEnd());
  
  return cleanedLines.join('\n');
}