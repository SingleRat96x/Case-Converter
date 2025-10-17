#!/usr/bin/env node

// Let me manually extract and analyze the metadata from the file
const fs = require('fs');

// Read the metadata file
const content = fs.readFileSync('/workspace/src/lib/metadata/toolMetadata.ts', 'utf8');

// Extract all the tool metadata entries
const toolEntries = [];

// Find all the tool entries in the overrides array
const overrideMatch = content.match(/const overrides: Array<ToolMetadataConfig> = \[([\s\S]*?)\];/);
if (overrideMatch) {
  const overridesContent = overrideMatch[1];
  
  // Split by tool entries (look for slug: pattern)
  const entries = overridesContent.split(/(?=\s*{\s*slug:)/);
  
  for (const entry of entries) {
    if (entry.trim() && entry.includes('slug:')) {
      // Extract slug
      const slugMatch = entry.match(/slug:\s*['"`]([^'"`]+)['"`]/);
      if (slugMatch) {
        const slug = slugMatch[1];
        
        // Extract English title
        const enTitleMatch = entry.match(/en:\s*{[\s\S]*?title:\s*['"`]([^'"`]+)['"`]/);
        const enTitle = enTitleMatch ? enTitleMatch[1] : null;
        
        // Extract English description
        const enDescMatch = entry.match(/en:\s*{[\s\S]*?description:\s*['"`]([^'"`]+)['"`]/);
        const enDesc = enDescMatch ? enDescMatch[1] : null;
        
        // Extract Russian title
        const ruTitleMatch = entry.match(/ru:\s*{[\s\S]*?title:\s*['"`]([^'"`]+)['"`]/);
        const ruTitle = ruTitleMatch ? ruTitleMatch[1] : null;
        
        // Extract Russian description
        const ruDescMatch = entry.match(/ru:\s*{[\s\S]*?description:\s*['"`]([^'"`]+)['"`]/);
        const ruDesc = ruDescMatch ? ruDescMatch[1] : null;
        
        if (enTitle && enDesc && ruTitle && ruDesc) {
          toolEntries.push({
            slug,
            en: {
              title: enTitle,
              description: enDesc,
              titleLength: enTitle.length,
              descLength: enDesc.length
            },
            ru: {
              title: ruTitle,
              description: ruDesc,
              titleLength: ruTitle.length,
              descLength: ruDesc.length
            }
          });
        }
      }
    }
  }
}

console.log('=== METADATA ANALYSIS REPORT ===\n');

console.log(`Total tools analyzed: ${toolEntries.length}\n`);

// Analyze English titles
console.log('=== ENGLISH TITLES ===');
const enTitles = toolEntries.map(t => ({ slug: t.slug, title: t.en.title, length: t.en.titleLength }));

const enTitleLengths = enTitles.map(t => t.length);
const enTitleAvg = enTitleLengths.reduce((a, b) => a + b, 0) / enTitleLengths.length;
const enTitleMin = Math.min(...enTitleLengths);
const enTitleMax = Math.max(...enTitleLengths);

console.log(`Average length: ${enTitleAvg.toFixed(1)} characters`);
console.log(`Range: ${enTitleMin} - ${enTitleMax} characters\n`);

// Find titles outside 45-65 range
const enTitleIssues = enTitles.filter(t => t.length < 45 || t.length > 65);
console.log(`Titles outside 45-65 char range: ${enTitleIssues.length}`);
enTitleIssues.forEach(t => {
  console.log(`  ${t.slug}: "${t.title}" (${t.length} chars)`);
});

console.log('\n=== ENGLISH DESCRIPTIONS ===');
const enDescs = toolEntries.map(t => ({ slug: t.slug, description: t.en.description, length: t.en.descLength }));

const enDescLengths = enDescs.map(t => t.length);
const enDescAvg = enDescLengths.reduce((a, b) => a + b, 0) / enDescLengths.length;
const enDescMin = Math.min(...enDescLengths);
const enDescMax = Math.max(...enDescLengths);

console.log(`Average length: ${enDescAvg.toFixed(1)} characters`);
console.log(`Range: ${enDescMin} - ${enDescMax} characters\n`);

// Find descriptions outside 120-160 range
const enDescIssues = enDescs.filter(t => t.length < 120 || t.length > 160);
console.log(`Descriptions outside 120-160 char range: ${enDescIssues.length}`);
enDescIssues.forEach(t => {
  console.log(`  ${t.slug}: "${t.description}" (${t.length} chars)`);
});

console.log('\n=== RUSSIAN TITLES ===');
const ruTitles = toolEntries.map(t => ({ slug: t.slug, title: t.ru.title, length: t.ru.titleLength }));

const ruTitleLengths = ruTitles.map(t => t.length);
const ruTitleAvg = ruTitleLengths.reduce((a, b) => a + b, 0) / ruTitleLengths.length;
const ruTitleMin = Math.min(...ruTitleLengths);
const ruTitleMax = Math.max(...ruTitleLengths);

console.log(`Average length: ${ruTitleAvg.toFixed(1)} characters`);
console.log(`Range: ${ruTitleMin} - ${ruTitleMax} characters\n`);

// Find titles outside 45-65 range
const ruTitleIssues = ruTitles.filter(t => t.length < 45 || t.length > 65);
console.log(`Titles outside 45-65 char range: ${ruTitleIssues.length}`);
ruTitleIssues.forEach(t => {
  console.log(`  ${t.slug}: "${t.title}" (${t.length} chars)`);
});

console.log('\n=== RUSSIAN DESCRIPTIONS ===');
const ruDescs = toolEntries.map(t => ({ slug: t.slug, description: t.ru.description, length: t.ru.descLength }));

const ruDescLengths = ruDescs.map(t => t.length);
const ruDescAvg = ruDescLengths.reduce((a, b) => a + b, 0) / ruDescLengths.length;
const ruDescMin = Math.min(...ruDescLengths);
const ruDescMax = Math.max(...ruDescLengths);

console.log(`Average length: ${ruDescAvg.toFixed(1)} characters`);
console.log(`Range: ${ruDescMin} - ${ruDescMax} characters\n`);

// Find descriptions outside 120-160 range
const ruDescIssues = ruDescs.filter(t => t.length < 120 || t.length > 160);
console.log(`Descriptions outside 120-160 char range: ${ruDescIssues.length}`);
ruDescIssues.forEach(t => {
  console.log(`  ${t.slug}: "${t.description}" (${t.length} chars)`);
});

// Check for brand consistency
console.log('\n=== BRAND CONSISTENCY CHECK ===');
const enBrandIssues = enTitles.filter(t => !t.title.includes('Text Case Converter') && !t.title.includes('—') && !t.title.includes('|'));
const ruBrandIssues = ruTitles.filter(t => !t.title.includes('Text Case Converter') && !t.title.includes('—') && !t.title.includes('|'));

console.log(`English titles missing brand: ${enBrandIssues.length}`);
enBrandIssues.forEach(t => {
  console.log(`  ${t.slug}: "${t.title}"`);
});

console.log(`\nRussian titles missing brand: ${ruBrandIssues.length}`);
ruBrandIssues.forEach(t => {
  console.log(`  ${t.slug}: "${t.title}"`);
});

// Check for duplicates
console.log('\n=== DUPLICATE CHECK ===');
const enTitleTexts = enTitles.map(t => t.title);
const enTitleDuplicates = enTitleTexts.filter((title, index) => enTitleTexts.indexOf(title) !== index);
console.log(`English title duplicates: ${enTitleDuplicates.length}`);
if (enTitleDuplicates.length > 0) {
  console.log('Duplicates:', [...new Set(enTitleDuplicates)]);
}

const enDescTexts = enDescs.map(t => t.description);
const enDescDuplicates = enDescTexts.filter((desc, index) => enDescTexts.indexOf(desc) !== index);
console.log(`English description duplicates: ${enDescDuplicates.length}`);
if (enDescDuplicates.length > 0) {
  console.log('Duplicates:', [...new Set(enDescDuplicates)]);
}

const ruTitleTexts = ruTitles.map(t => t.title);
const ruTitleDuplicates = ruTitleTexts.filter((title, index) => ruTitleTexts.indexOf(title) !== index);
console.log(`Russian title duplicates: ${ruTitleDuplicates.length}`);
if (ruTitleDuplicates.length > 0) {
  console.log('Duplicates:', [...new Set(ruTitleDuplicates)]);
}

const ruDescTexts = ruDescs.map(t => t.description);
const ruDescDuplicates = ruDescTexts.filter((desc, index) => ruDescTexts.indexOf(desc) !== index);
console.log(`Russian description duplicates: ${ruDescDuplicates.length}`);
if (ruDescDuplicates.length > 0) {
  console.log('Duplicates:', [...new Set(ruDescDuplicates)]);
});