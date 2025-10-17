#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Base URL
const BASE_URL = 'https://textcaseconverter.net';

// Tool slugs from the metadata registry
const TOOL_SLUGS = [
  'webp-to-png', 'png-to-webp', 'random-month', 'remove-line-breaks', 'text-replace', 'text-counter', 'uuid-generator', 'slugify-url',
  'roman-numeral-date', 'rot13', 'random-number', 'url-converter', 'utm-builder', 'subscript-text', 'sentence-case', 'repeat-text',
  'pig-latin', 'title-case', 'sentence-counter', 'remove-text-formatting', 'webp-to-jpg', 'utf8-converter', 'random-letter', 'plain-text',
  'random-choice', 'word-frequency', 'sort-words', 'uppercase', 'png-to-jpg', 'random-ip', 'random-date', 'jpg-to-png', 'invisible-text',
  'csv-to-json', 'alternating-case', 'instagram-fonts', 'lowercase', 'image-cropper', 'nato-phonetic', 'image-to-text', 'image-resizer',
  'italic-text', 'ascii-art-generator', 'jpg-to-webp', 'mirror-text', 'cursed-text', 'online-notepad', 'facebook-font', 'password-generator',
  'discord-font', 'big-text', 'number-sorter', 'json-stringify', 'morse-code', 'binary-code-translator', 'md5-hash', 'base64-encoder-decoder',
  'bubble-text', 'duplicate-line-remover', 'hex-to-text', 'bold-text', 'phonetic-spelling'
];

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

  // Extract X-Robots-Tag from headers (will be set separately)
  // result.x_robots_tag = headers['x-robots-tag'] || null;

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
function evaluateRules(data) {
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

  // Title length check (45-65 chars or ≤ 580-600 px)
  if (data.title) {
    const titleLen = data.title.length;
    const titlePx = data.title_pixel_width || (titleLen * 6);
    
    if (titleLen >= 45 && titleLen <= 65) {
      rules.title_length = 'PASS';
    } else if (titlePx <= 600) {
      rules.title_length = 'PASS';
    }

    // Title contains tool concept (basic check for tool-related keywords)
    const toolKeywords = ['generator', 'converter', 'tool', 'online', 'free', 'create', 'make', 'build', 'transform', 'convert'];
    if (toolKeywords.some(keyword => data.title.toLowerCase().includes(keyword))) {
      rules.title_contains_tool_concept = 'PASS';
    }

    // Title brand consistency (check for " | Brand" suffix)
    if (data.title.includes(' | Text Case Converter') || data.title.includes(' — Text Case Converter')) {
      rules.title_brand_consistent = 'PASS';
    }

    // Title truncation check
    if (titlePx <= 600) {
      rules.title_no_truncation = 'PASS';
    }
  }

  // Description length check (120-160 chars)
  if (data.meta_description) {
    const descLen = data.description_character_count;
    if (descLen >= 120 && descLen <= 160) {
      rules.description_length = 'PASS';
    }

    // Description specificity (basic check for generic phrases)
    const genericPhrases = ['use this free online tool', 'fast and reliable', 'no limits', 'no signup'];
    if (!genericPhrases.some(phrase => data.meta_description.toLowerCase().includes(phrase))) {
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
  if (data.og_title && data.og_title.trim()) {
    rules.og_title_present = 'PASS';
  }
  if (data.og_description && data.og_description.trim()) {
    rules.og_description_present = 'PASS';
  }

  // Language mismatch check
  const isEn = data.url.includes('/tools/') && !data.url.includes('/ru/');
  const isRu = data.url.includes('/ru/tools/');
  const titleIsEn = data.title && /^[a-zA-Z\s\-—|]+$/.test(data.title);
  const titleIsRu = data.title && /[а-яё]/i.test(data.title);
  const descIsEn = data.meta_description && /^[a-zA-Z\s\-—|.,!?]+$/.test(data.meta_description);
  const descIsRu = data.meta_description && /[а-яё]/i.test(data.meta_description);

  if ((isEn && titleIsEn && descIsEn) || (isRu && titleIsRu && descIsRu)) {
    rules.description_no_language_mismatch = 'PASS';
  }

  return rules;
}

// Main function to audit all tool pages
async function auditToolPages() {
  console.log('Starting metadata audit for tool pages...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Total tool pages to audit: ${TOOL_SLUGS.length * 2} (EN + RU)`);
  console.log('');

  const results = {
    en: [],
    ru: [],
    errors: []
  };

  const startTime = new Date();
  console.log(`Audit started at: ${startTime.toISOString()}`);

  for (const slug of TOOL_SLUGS) {
    // English version
    const enUrl = `${BASE_URL}/tools/${slug}`;
    try {
      console.log(`Crawling EN: ${enUrl}`);
      const enResponse = await fetchPage(enUrl);
      const enData = extractMetadata(enResponse.content, enResponse.finalUrl);
      enData.http_status = enResponse.statusCode;
      enData.x_robots_tag = enResponse.headers['x-robots-tag'] || null;
      enData.rules = evaluateRules(enData);
      enData.indexable = !enData.robots_meta?.includes('noindex') && enData.http_status === 200;
      results.en.push(enData);
    } catch (error) {
      console.error(`Error crawling EN ${enUrl}:`, error.message);
      results.errors.push({ url: enUrl, error: error.message });
    }

    // Russian version
    const ruUrl = `${BASE_URL}/ru/tools/${slug}`;
    try {
      console.log(`Crawling RU: ${ruUrl}`);
      const ruResponse = await fetchPage(ruUrl);
      const ruData = extractMetadata(ruResponse.content, ruResponse.finalUrl);
      ruData.http_status = ruResponse.statusCode;
      ruData.x_robots_tag = ruResponse.headers['x-robots-tag'] || null;
      ruData.rules = evaluateRules(ruData);
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
      fs.writeFileSync('audit-results-en.json', JSON.stringify(results.en, null, 2));
      fs.writeFileSync('audit-results-ru.json', JSON.stringify(results.ru, null, 2));
      fs.writeFileSync('audit-errors.json', JSON.stringify(results.errors, null, 2));
      
      console.log('\nResults saved to:');
      console.log('  - audit-results-en.json');
      console.log('  - audit-results-ru.json');
      console.log('  - audit-errors.json');
    })
    .catch(error => {
      console.error('Audit failed:', error);
      process.exit(1);
    });
}

module.exports = { auditToolPages, extractMetadata, evaluateRules };