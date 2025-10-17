#!/usr/bin/env node

const fs = require('fs');

// Load audit results
const enResults = JSON.parse(fs.readFileSync('audit-results-en-v2.json', 'utf8'));
const ruResults = JSON.parse(fs.readFileSync('audit-results-ru-v2.json', 'utf8'));

// Helper function to calculate pixel width estimate
function estimatePixelWidth(text) {
  if (!text) return 0;
  // Rough approximation: average 6px per character
  return text.length * 6;
}

// Helper function to detect duplicates
function findDuplicates(data, field) {
  const groups = {};
  data.forEach((item, index) => {
    const value = item[field];
    if (value) {
      if (!groups[value]) {
        groups[value] = [];
      }
      groups[value].push({
        url: item.url,
        index: index
      });
    }
  });
  
  return Object.entries(groups)
    .filter(([key, items]) => items.length > 1)
    .map(([value, items]) => ({
      value,
      count: items.length,
      urls: items.map(item => item.url)
    }));
}

// Helper function to calculate rule statistics
function calculateRuleStats(data) {
  const stats = {};
  const ruleNames = [
    'title_length', 'title_contains_tool_concept', 'title_avoids_boilerplate',
    'title_brand_consistent', 'title_no_truncation', 'description_length',
    'description_specific', 'canonical_self_referential', 'canonical_not_cross_language',
    'noindex_absent', 'og_title_present', 'og_description_present'
  ];
  
  ruleNames.forEach(rule => {
    stats[rule] = {
      pass: 0,
      fail: 0,
      total: 0
    };
  });
  
  data.forEach(item => {
    if (item.rules) {
      ruleNames.forEach(rule => {
        if (item.rules[rule]) {
          stats[rule].total++;
          if (item.rules[rule] === 'PASS') {
            stats[rule].pass++;
          } else {
            stats[rule].fail++;
          }
        }
      });
    }
  });
  
  return stats;
}

// Generate CSV for English results
function generateEnglishCSV() {
  const headers = [
    'url', 'http_status', 'title', 'title_pixel_width', 'meta_description', 
    'description_character_count', 'h1', 'canonical', 'robots_meta', 'x_robots_tag',
    'og_title', 'og_description', 'hreflang', 'detected_language', 'indexable',
    'registry_title', 'registry_description', 'registry_og_title', 'registry_og_description',
    'title_length', 'title_contains_tool_concept', 'title_avoids_boilerplate',
    'title_brand_consistent', 'title_no_truncation', 'description_length',
    'description_specific', 'canonical_self_referential', 'canonical_not_cross_language',
    'noindex_absent', 'og_title_present', 'og_description_present'
  ];
  
  const rows = enResults.map(item => {
    const title = item.registry_title || item.title;
    const description = item.registry_description || item.meta_description;
    const ogTitle = item.registry_og_title || item.og_title;
    const ogDescription = item.registry_og_description || item.og_description;
    
    return [
      item.url,
      item.http_status,
      title,
      estimatePixelWidth(title),
      description,
      description ? description.length : 0,
      item.h1,
      item.canonical,
      item.robots_meta,
      item.x_robots_tag,
      ogTitle,
      ogDescription,
      item.hreflang.map(h => `${h.lang}:${h.href}`).join(';'),
      item.detected_language,
      item.indexable,
      item.registry_title,
      item.registry_description,
      item.registry_og_title,
      item.registry_og_description,
      item.rules?.title_length || 'N/A',
      item.rules?.title_contains_tool_concept || 'N/A',
      item.rules?.title_avoids_boilerplate || 'N/A',
      item.rules?.title_brand_consistent || 'N/A',
      item.rules?.title_no_truncation || 'N/A',
      item.rules?.description_length || 'N/A',
      item.rules?.description_specific || 'N/A',
      item.rules?.canonical_self_referential || 'N/A',
      item.rules?.canonical_not_cross_language || 'N/A',
      item.rules?.noindex_absent || 'N/A',
      item.rules?.og_title_present || 'N/A',
      item.rules?.og_description_present || 'N/A'
    ].map(field => `"${(field || '').toString().replace(/"/g, '""')}"`);
  });
  
  return [headers.map(h => `"${h}"`), ...rows].map(row => row.join(',')).join('\n');
}

// Generate CSV for Russian results
function generateRussianCSV() {
  const headers = [
    'url', 'http_status', 'title', 'title_pixel_width', 'meta_description', 
    'description_character_count', 'h1', 'canonical', 'robots_meta', 'x_robots_tag',
    'og_title', 'og_description', 'hreflang', 'detected_language', 'indexable',
    'registry_title', 'registry_description', 'registry_og_title', 'registry_og_description',
    'title_length', 'title_contains_tool_concept', 'title_avoids_boilerplate',
    'title_brand_consistent', 'title_no_truncation', 'description_length',
    'description_specific', 'canonical_self_referential', 'canonical_not_cross_language',
    'noindex_absent', 'og_title_present', 'og_description_present'
  ];
  
  const rows = ruResults.map(item => {
    const title = item.registry_title || item.title;
    const description = item.registry_description || item.meta_description;
    const ogTitle = item.registry_og_title || item.og_title;
    const ogDescription = item.registry_og_description || item.og_description;
    
    return [
      item.url,
      item.http_status,
      title,
      estimatePixelWidth(title),
      description,
      description ? description.length : 0,
      item.h1,
      item.canonical,
      item.robots_meta,
      item.x_robots_tag,
      ogTitle,
      ogDescription,
      item.hreflang.map(h => `${h.lang}:${h.href}`).join(';'),
      item.detected_language,
      item.indexable,
      item.registry_title,
      item.registry_description,
      item.registry_og_title,
      item.registry_og_description,
      item.rules?.title_length || 'N/A',
      item.rules?.title_contains_tool_concept || 'N/A',
      item.rules?.title_avoids_boilerplate || 'N/A',
      item.rules?.title_brand_consistent || 'N/A',
      item.rules?.title_no_truncation || 'N/A',
      item.rules?.description_length || 'N/A',
      item.rules?.description_specific || 'N/A',
      item.rules?.canonical_self_referential || 'N/A',
      item.rules?.canonical_not_cross_language || 'N/A',
      item.rules?.noindex_absent || 'N/A',
      item.rules?.og_title_present || 'N/A',
      item.rules?.og_description_present || 'N/A'
    ].map(field => `"${(field || '').toString().replace(/"/g, '""')}"`);
  });
  
  return [headers.map(h => `"${h}"`), ...rows].map(row => row.join(',')).join('\n');
}

// Generate issue catalog
function generateIssueCatalog() {
  const issues = [];
  let issueId = 1;
  
  // Analyze English results
  const enStats = calculateRuleStats(enResults);
  const enTitleDuplicates = findDuplicates(enResults, 'registry_title');
  const enDescDuplicates = findDuplicates(enResults, 'registry_description');
  
  // Analyze Russian results
  const ruStats = calculateRuleStats(ruResults);
  const ruTitleDuplicates = findDuplicates(ruResults, 'registry_title');
  const ruDescDuplicates = findDuplicates(ruResults, 'registry_description');
  
  // Title length issues
  if (enStats.title_length.fail > 0) {
    issues.push({
      issue_id: issueId++,
      rule: 'title_length',
      evidence_example: 'Titles outside 45-65 character range or >600px width',
      affected_urls_count: enStats.title_length.fail,
      sample_urls: enResults
        .filter(item => item.rules?.title_length === 'FAIL')
        .slice(0, 10)
        .map(item => item.url)
    });
  }
  
  // Title brand consistency issues
  if (enStats.title_brand_consistent.fail > 0) {
    issues.push({
      issue_id: issueId++,
      rule: 'title_brand_consistent',
      evidence_example: 'Missing " | Text Case Converter" or " — Text Case Converter" suffix',
      affected_urls_count: enStats.title_brand_consistent.fail,
      sample_urls: enResults
        .filter(item => item.rules?.title_brand_consistent === 'FAIL')
        .slice(0, 10)
        .map(item => item.url)
    });
  }
  
  // Description length issues
  if (enStats.description_length.fail > 0) {
    issues.push({
      issue_id: issueId++,
      rule: 'description_length',
      evidence_example: 'Descriptions outside 120-160 character range',
      affected_urls_count: enStats.description_length.fail,
      sample_urls: enResults
        .filter(item => item.rules?.description_length === 'FAIL')
        .slice(0, 10)
        .map(item => item.url)
    });
  }
  
  // Canonical issues
  if (enStats.canonical_self_referential.fail > 0) {
    issues.push({
      issue_id: issueId++,
      rule: 'canonical_self_referential',
      evidence_example: 'Canonical URL not self-referential',
      affected_urls_count: enStats.canonical_self_referential.fail,
      sample_urls: enResults
        .filter(item => item.rules?.canonical_self_referential === 'FAIL')
        .slice(0, 10)
        .map(item => item.url)
    });
  }
  
  // Open Graph issues
  if (enStats.og_title_present.fail > 0) {
    issues.push({
      issue_id: issueId++,
      rule: 'og_title_present',
      evidence_example: 'Missing or empty og:title',
      affected_urls_count: enStats.og_title_present.fail,
      sample_urls: enResults
        .filter(item => item.rules?.og_title_present === 'FAIL')
        .slice(0, 10)
        .map(item => item.url)
    });
  }
  
  // Duplicate titles
  enTitleDuplicates.forEach(dup => {
    issues.push({
      issue_id: issueId++,
      rule: 'title_no_duplicates',
      evidence_example: `Duplicate title: "${dup.value}"`,
      affected_urls_count: dup.count,
      sample_urls: dup.urls.slice(0, 10)
    });
  });
  
  // Duplicate descriptions
  enDescDuplicates.forEach(dup => {
    issues.push({
      issue_id: issueId++,
      rule: 'description_no_duplicates',
      evidence_example: `Duplicate description: "${dup.value.substring(0, 100)}..."`,
      affected_urls_count: dup.count,
      sample_urls: dup.urls.slice(0, 10)
    });
  });
  
  return issues;
}

// Generate summary metrics
function generateSummaryMetrics() {
  const enStats = calculateRuleStats(enResults);
  const ruStats = calculateRuleStats(ruResults);
  const enTitleDuplicates = findDuplicates(enResults, 'registry_title');
  const enDescDuplicates = findDuplicates(enResults, 'registry_description');
  const ruTitleDuplicates = findDuplicates(ruResults, 'registry_title');
  const ruDescDuplicates = findDuplicates(ruResults, 'registry_description');
  
  return {
    total_tool_pages_scanned: {
      en: enResults.length,
      ru: ruResults.length
    },
    title_rules_pass_rate: {
      en: Math.round((enStats.title_length.pass / enStats.title_length.total) * 100),
      ru: Math.round((ruStats.title_length.pass / ruStats.title_length.total) * 100)
    },
    description_rules_pass_rate: {
      en: Math.round((enStats.description_length.pass / enStats.description_length.total) * 100),
      ru: Math.round((ruStats.description_length.pass / ruStats.description_length.total) * 100)
    },
    duplicate_counts: {
      titles_en: enTitleDuplicates.reduce((sum, dup) => sum + dup.count, 0),
      titles_ru: ruTitleDuplicates.reduce((sum, dup) => sum + dup.count, 0),
      descriptions_en: enDescDuplicates.reduce((sum, dup) => sum + dup.count, 0),
      descriptions_ru: ruDescDuplicates.reduce((sum, dup) => sum + dup.count, 0)
    },
    canonical_errors: {
      en: enStats.canonical_self_referential.fail,
      ru: ruStats.canonical_self_referential.fail
    },
    hreflang_errors: {
      en: enStats.canonical_not_cross_language.fail,
      ru: ruStats.canonical_not_cross_language.fail
    }
  };
}

// Main execution
console.log('Generating audit reports...');

// Generate CSVs
const enCSV = generateEnglishCSV();
const ruCSV = generateRussianCSV();

// Generate issue catalog
const issueCatalog = generateIssueCatalog();

// Generate summary metrics
const summaryMetrics = generateSummaryMetrics();

// Save files
fs.writeFileSync('english-audit.csv', enCSV);
fs.writeFileSync('russian-audit.csv', ruCSV);
fs.writeFileSync('issue-catalog.json', JSON.stringify(issueCatalog, null, 2));
fs.writeFileSync('summary-metrics.json', JSON.stringify(summaryMetrics, null, 2));

// Generate text summary
const textSummary = `
METADATA AUDIT SUMMARY
=====================

Base URL: https://textcaseconverter.net
Audit Date: ${new Date().toISOString()}
Timezone: Africa/Tunis

SCOPE
-----
- Language order: English first, then Russian
- Pages: Tool pages only (${enResults.length} EN + ${ruResults.length} RU = ${enResults.length + ruResults.length} total)
- User-Agent: Metadata-Audit-Bot/1.0
- Follow redirects: Yes

SUMMARY METRICS
---------------
Total tool pages scanned: ${summaryMetrics.total_tool_pages_scanned.en} (EN) / ${summaryMetrics.total_tool_pages_scanned.ru} (RU)

Title Rules Pass Rate:
- English: ${summaryMetrics.title_rules_pass_rate.en}%
- Russian: ${summaryMetrics.title_rules_pass_rate.ru}%

Description Rules Pass Rate:
- English: ${summaryMetrics.description_rules_pass_rate.en}%
- Russian: ${summaryMetrics.description_rules_pass_rate.ru}%

Duplicate Counts:
- English titles: ${summaryMetrics.duplicate_counts.titles_en} duplicates
- Russian titles: ${summaryMetrics.duplicate_counts.titles_ru} duplicates
- English descriptions: ${summaryMetrics.duplicate_counts.descriptions_en} duplicates
- Russian descriptions: ${summaryMetrics.duplicate_counts.descriptions_ru} duplicates

Canonical Errors:
- English: ${summaryMetrics.canonical_errors.en} pages
- Russian: ${summaryMetrics.canonical_errors.ru} pages

Hreflang Errors:
- English: ${summaryMetrics.hreflang_errors.en} pages
- Russian: ${summaryMetrics.hreflang_errors.ru} pages

ISSUE CATALOG
-------------
Found ${issueCatalog.length} unique issue types:

${issueCatalog.map(issue => `
${issue.issue_id}. ${issue.rule}
   Evidence: ${issue.evidence_example}
   Affected URLs: ${issue.affected_urls_count}
   Sample URLs: ${issue.sample_urls.slice(0, 3).join(', ')}${issue.sample_urls.length > 3 ? '...' : ''}
`).join('')}

FILES GENERATED
---------------
- english-audit.csv: Complete English audit data
- russian-audit.csv: Complete Russian audit data
- issue-catalog.json: Detailed issue catalog
- summary-metrics.json: Summary statistics

NOTE: This audit used registry metadata as the source of truth since the live pages use client-side rendering where metadata is not present in the initial HTML response.
`;

fs.writeFileSync('audit-summary.txt', textSummary);

console.log('Audit reports generated successfully!');
console.log('Files created:');
console.log('- english-audit.csv');
console.log('- russian-audit.csv');
console.log('- issue-catalog.json');
console.log('- summary-metrics.json');
console.log('- audit-summary.txt');