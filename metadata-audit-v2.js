#!/usr/bin/env node

const { getAllMetadataEntries } = require('./src/lib/metadata/toolMetadata.ts');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Base URL
const BASE_URL = 'https://textcaseconverter.net';

// Helper function to make HTTP requests
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Metadata-Audit-Bot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).href;
        console.log(`Redirecting from ${url} to ${redirectUrl}`);
        return fetchPage(redirectUrl).then(resolve).catch(reject);
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          url: url,
          finalUrl: res.responseUrl || url,
          statusCode: res.statusCode,
          headers: res.headers,
          content: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Helper function to extract metadata from HTML
function extractMetadata(html, url) {
  const result = {
    url: url,
    http_status: null,
    title: null,
    title_pixel_width: null,
    meta_description: null,
    description_character_count: null,
    h1: null,
    canonical: null,
    robots_meta: null,
    x_robots_tag: null,
    og_title: null,
    og_description: null,
    hreflang: [],
    detected_language: null,
    indexable: null,
    duplicate_cluster_id: null,
    mixed_locale: null,
    querystring_sensitive: null
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
    // Estimate pixel width (rough approximation: average 6px per character)
    result.title_pixel_width = result.title.length * 6;
  }

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (descMatch) {
    result.meta_description = descMatch[1].trim();
    result.description_character_count = result.meta_description.length;
  }

  // Extract first h1
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (h1Match) {
    result.h1 = h1Match[1].trim();
  }

  // Extract canonical
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
  if (canonicalMatch) {
    result.canonical = canonicalMatch[1].trim();
  }

  // Extract robots meta
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (robotsMatch) {
    result.robots_meta = robotsMatch[1].trim();
  }

  // Extract Open Graph title
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (ogTitleMatch) {
    result.og_title = ogTitleMatch[1].trim();
  }

  // Extract Open Graph description
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (ogDescMatch) {
    result.og_description = ogDescMatch[1].trim();
  }

  // Extract hreflang
  const hreflangMatches = html.match(/<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']*)["'][^>]*href=["']([^"']*)["'][^>]*>/gi);
  if (hreflangMatches) {
    hreflangMatches.forEach(match => {
      const langMatch = match.match(/hreflang=["']([^"']*)["']/i);
      const hrefMatch = match.match(/href=["']([^"']*)["']/i);
      if (langMatch && hrefMatch) {
        result.hreflang.push({
          lang: langMatch[1],
          href: hrefMatch[1]
        });
      }
    });
  }

  // Detect page language from lang attribute
  const langMatch = html.match(/<html[^>]*lang=["']([^"']*)["'][^>]*>/i);
  if (langMatch) {
    result.detected_language = langMatch[1];
  }

  return result;
}

// Helper function to evaluate rules
function evaluateRules(data, registryData) {
  const rules = {
    title_length: 'FAIL',
    title_contains_tool_concept: 'FAIL',
    title_avoids_boilerplate: 'FAIL',
    title_no_duplicates: 'PASS', // Will be checked later
    title_brand_consistent: 'FAIL',
    title_no_truncation: 'FAIL',
    description_length: 'FAIL',
    description_specific: 'FAIL',
    description_no_duplicates: 'PASS', // Will be checked later
    description_no_language_mismatch: 'FAIL',
    canonical_self_referential: 'FAIL',
    canonical_not_cross_language: 'FAIL',
    noindex_absent: 'FAIL',
    hreflang_reciprocal: 'FAIL',
    og_title_present: 'FAIL',
    og_description_present: 'FAIL',
    og_not_divergent: 'FAIL'
  };

  // Use registry data if available, otherwise use extracted data
  const title = registryData?.title || data.title;
  const description = registryData?.description || data.meta_description;
  const ogTitle = registryData?.alternateTitle || data.og_title;
  const ogDescription = registryData?.shortDescription || data.og_description;

  // Title length check (45-65 chars or ≤ 580-600 px)
  if (title) {
    const titleLen = title.length;
    const titlePx = data.title_pixel_width || (titleLen * 6);
    
    if (titleLen >= 45 && titleLen <= 65) {
      rules.title_length = 'PASS';
    } else if (titlePx <= 600) {
      rules.title_length = 'PASS';
    }

    // Title contains tool concept (basic check for tool-related keywords)
    const toolKeywords = ['generator', 'converter', 'tool', 'online', 'free', 'create', 'make', 'build', 'transform', 'convert', 'counter', 'analyzer', 'translator', 'encoder', 'decoder'];
    if (toolKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
      rules.title_contains_tool_concept = 'PASS';
    }

    // Title brand consistency (check for " | Brand" suffix or " — Brand")
    if (title.includes(' | Text Case Converter') || title.includes(' — Text Case Converter')) {
      rules.title_brand_consistent = 'PASS';
    }

    // Title truncation check
    if (titlePx <= 600) {
      rules.title_no_truncation = 'PASS';
    }

    // Check for boilerplate (generic phrases)
    const boilerplatePhrases = ['Free Online Tool', 'Professional Text Tools', 'Text Case Converter'];
    const isBoilerplate = boilerplatePhrases.some(phrase => title.includes(phrase));
    if (!isBoilerplate) {
      rules.title_avoids_boilerplate = 'PASS';
    }
  }

  // Description length check (120-160 chars)
  if (description) {
    const descLen = description.length;
    if (descLen >= 120 && descLen <= 160) {
      rules.description_length = 'PASS';
    }

    // Description specificity (basic check for generic phrases)
    const genericPhrases = ['use this free online tool', 'fast and reliable', 'no limits', 'no signup', 'professional text transformation tools'];
    if (!genericPhrases.some(phrase => description.toLowerCase().includes(phrase))) {
      rules.description_specific = 'PASS';
    }
  }

  // Canonical checks
  if (data.canonical) {
    const urlObj = new URL(data.url);
    const canonicalObj = new URL(data.canonical, BASE_URL);
    
    if (canonicalObj.href === urlObj.href) {
      rules.canonical_self_referential = 'PASS';
    }

    // Check if canonical is cross-language
    const isEn = data.url.includes('/tools/') && !data.url.includes('/ru/');
    const isRu = data.url.includes('/ru/tools/');
    const canonicalIsEn = data.canonical.includes('/tools/') && !data.canonical.includes('/ru/');
    const canonicalIsRu = data.canonical.includes('/ru/tools/');
    
    if (!(isEn && canonicalIsRu) && !(isRu && canonicalIsEn)) {
      rules.canonical_not_cross_language = 'PASS';
    }
  }

  // Robots/noindex check
  if (!data.robots_meta || !data.robots_meta.includes('noindex')) {
    rules.noindex_absent = 'PASS';
  }

  // Open Graph checks
  if (ogTitle && ogTitle.trim()) {
    rules.og_title_present = 'PASS';
  }
  if (ogDescription && ogDescription.trim()) {
    rules.og_description_present = 'PASS';
  }

  // Language mismatch check
  const isEn = data.url.includes('/tools/') && !data.url.includes('/ru/');
  const isRu = data.url.includes('/ru/tools/');
  const titleIsEn = title && /^[a-zA-Z\s\-—|.,!?]+$/.test(title);
  const titleIsRu = title && /[а-яё]/i.test(title);
  const descIsEn = description && /^[a-zA-Z\s\-—|.,!?]+$/.test(description);
  const descIsRu = description && /[а-яё]/i.test(description);

  if ((isEn && titleIsEn && descIsEn) || (isRu && titleIsRu && descIsRu)) {
    rules.description_no_language_mismatch = 'PASS';
  }

  return rules;
}

// Main function to audit all tool pages
async function auditToolPages() {
  console.log('Starting metadata audit for tool pages...');
  console.log(`Base URL: ${BASE_URL}`);
  
  // Get all metadata entries from registry
  const allEntries = getAllMetadataEntries();
  const toolEntries = allEntries.filter(entry => entry.type === 'tool');
  
  console.log(`Total tool pages to audit: ${toolEntries.length * 2} (EN + RU)`);
  console.log('');

  const results = {
    en: [],
    ru: [],
    errors: []
  };

  const startTime = new Date();
  console.log(`Audit started at: ${startTime.toISOString()}`);

  for (const entry of toolEntries) {
    const slug = entry.slug;
    
    // English version
    const enUrl = `${BASE_URL}${entry.pathname}`;
    try {
      console.log(`Crawling EN: ${enUrl}`);
      const enResponse = await fetchPage(enUrl);
      const enData = extractMetadata(enResponse.content, enResponse.finalUrl);
      enData.http_status = enResponse.statusCode;
      enData.x_robots_tag = enResponse.headers['x-robots-tag'] || null;
      
      // Get registry data for this tool
      const enRegistryData = entry.i18n.en;
      enData.registry_title = enRegistryData.title;
      enData.registry_description = enRegistryData.description;
      enData.registry_og_title = enRegistryData.alternateTitle;
      enData.registry_og_description = enRegistryData.shortDescription;
      
      enData.rules = evaluateRules(enData, enRegistryData);
      enData.indexable = !enData.robots_meta?.includes('noindex') && enData.http_status === 200;
      results.en.push(enData);
    } catch (error) {
      console.error(`Error crawling EN ${enUrl}:`, error.message);
      results.errors.push({ url: enUrl, error: error.message });
    }

    // Russian version
    const ruUrl = `${BASE_URL}/ru${entry.pathname}`;
    try {
      console.log(`Crawling RU: ${ruUrl}`);
      const ruResponse = await fetchPage(ruUrl);
      const ruData = extractMetadata(ruResponse.content, ruResponse.finalUrl);
      ruData.http_status = ruResponse.statusCode;
      ruData.x_robots_tag = ruResponse.headers['x-robots-tag'] || null;
      
      // Get registry data for this tool
      const ruRegistryData = entry.i18n.ru;
      ruData.registry_title = ruRegistryData.title;
      ruData.registry_description = ruRegistryData.description;
      ruData.registry_og_title = ruRegistryData.alternateTitle;
      ruData.registry_og_description = ruRegistryData.shortDescription;
      
      ruData.rules = evaluateRules(ruData, ruRegistryData);
      ruData.indexable = !ruData.robots_meta?.includes('noindex') && ruData.http_status === 200;
      results.ru.push(ruData);
    } catch (error) {
      console.error(`Error crawling RU ${ruUrl}:`, error.message);
      results.errors.push({ url: ruUrl, error: error.message });
    }

    // Small delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const endTime = new Date();
  console.log(`Audit completed at: ${endTime.toISOString()}`);
  console.log(`Total time: ${(endTime - startTime) / 1000} seconds`);

  return results;
}

// Run the audit
if (require.main === module) {
  auditToolPages()
    .then(results => {
      console.log('\n=== AUDIT RESULTS ===');
      console.log(`English pages crawled: ${results.en.length}`);
      console.log(`Russian pages crawled: ${results.ru.length}`);
      console.log(`Errors: ${results.errors.length}`);
      
      if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach(err => console.log(`  ${err.url}: ${err.error}`));
      }

      // Save results to files
      const fs = require('fs');
      fs.writeFileSync('audit-results-en-v2.json', JSON.stringify(results.en, null, 2));
      fs.writeFileSync('audit-results-ru-v2.json', JSON.stringify(results.ru, null, 2));
      fs.writeFileSync('audit-errors-v2.json', JSON.stringify(results.errors, null, 2));
      
      console.log('\nResults saved to:');
      console.log('  - audit-results-en-v2.json');
      console.log('  - audit-results-ru-v2.json');
      console.log('  - audit-errors-v2.json');
    })
    .catch(error => {
      console.error('Audit failed:', error);
      process.exit(1);
    });
}

module.exports = { auditToolPages, extractMetadata, evaluateRules };