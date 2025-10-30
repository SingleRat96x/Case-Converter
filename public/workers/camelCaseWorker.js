/**
 * Camel Case Web Worker
 * Processes large text and JSON conversions off the main thread
 */

// Helper functions
function isAcronym(word) {
  return /^[A-Z]{2,}$/.test(word);
}

function handleAcronym(word, isFirst, caseStyle) {
  if (word.length === 0) return word;
  
  if (caseStyle === 'PascalCase' || !isFirst) {
    return word.charAt(0).toUpperCase() + word.slice(1).toUpperCase();
  } else {
    return word.toLowerCase();
  }
}

function safeCharactersOnly(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x00-\x7F]/g, '');
}

function convertWord(word, isFirst, options) {
  if (!word) return word;
  
  if (options.preserveAcronyms && isAcronym(word)) {
    return handleAcronym(word, isFirst, options.caseStyle);
  }
  
  const lower = word.toLowerCase();
  if (isFirst && options.caseStyle === 'camelCase') {
    return lower;
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function snakeToCamel(text, options) {
  const words = text.split('_').filter(w => w.length > 0);
  return words.map((word, idx) => convertWord(word, idx === 0, options)).join('');
}

function kebabToCamel(text, options) {
  const words = text.split('-').filter(w => w.length > 0);
  return words.map((word, idx) => convertWord(word, idx === 0, options)).join('');
}

function titleToCamel(text, options) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.map((word, idx) => convertWord(word, idx === 0, options)).join('');
}

function camelToSnake(text) {
  return text
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

function convertTextToCamelCase(text, options) {
  if (!text) return text;
  
  let result = text;
  
  if (options.trimWhitespace) {
    result = result.trim().replace(/\s+/g, ' ');
  }
  
  if (options.safeCharsOnly) {
    result = safeCharactersOnly(result);
  }
  
  switch (options.mode) {
    case 'snake-to-camel':
      result = snakeToCamel(result, options);
      break;
    case 'kebab-to-camel':
      result = kebabToCamel(result, options);
      break;
    case 'title-to-camel':
      result = titleToCamel(result, options);
      break;
    case 'reverse':
      result = camelToSnake(result);
      break;
  }
  
  return result;
}

function shouldExcludePath(path, excludePaths) {
  return excludePaths.some(excludePath => {
    if (excludePath.includes('*')) {
      const pattern = excludePath.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    }
    return path === excludePath || path.startsWith(excludePath + '.');
  });
}

function convertJsonKeys(obj, options, currentPath = '$') {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map((item, index) => 
      convertJsonKeys(item, options, `${currentPath}[${index}]`)
    );
  }
  
  if (typeof obj === 'object') {
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newPath = currentPath === '$' ? `$.${key}` : `${currentPath}.${key}`;
      
      const shouldExclude = options.excludePaths && 
        shouldExcludePath(newPath, options.excludePaths);
      
      const newKey = shouldExclude ? key : convertTextToCamelCase(key, {
        ...options,
        mode: options.mode === 'reverse' ? 'reverse' : 'snake-to-camel'
      });
      
      if (options.convertKeysOnly) {
        result[newKey] = typeof value === 'object' ? 
          convertJsonKeys(value, options, newPath) : 
          value;
      } else {
        result[newKey] = convertJsonKeys(value, options, newPath);
      }
    }
    
    return result;
  }
  
  return obj;
}

function convertCsvHeaders(csv, options) {
  const lines = csv.split('\n');
  if (lines.length === 0) return csv;
  
  const headers = lines[0].split(',').map(header => 
    convertTextToCamelCase(header.trim(), options)
  );
  
  lines[0] = headers.join(',');
  return lines.join('\n');
}

// Main message handler
self.onmessage = function(e) {
  const { text, inputType, options } = e.data;
  
  try {
    let result;
    
    // Process based on input type
    if (inputType === 'json') {
      const parsed = JSON.parse(text);
      const converted = convertJsonKeys(parsed, options);
      result = options.prettyPrint 
        ? JSON.stringify(converted, null, 2)
        : JSON.stringify(converted);
    } else if (inputType === 'csv') {
      result = convertCsvHeaders(text, options);
    } else {
      // Text mode - process line by line
      const lines = text.split('\n');
      result = lines.map(line => convertTextToCamelCase(line, options)).join('\n');
    }
    
    // Send success response
    self.postMessage({
      type: 'success',
      result: result
    });
  } catch (error) {
    // Send error response
    self.postMessage({
      type: 'error',
      error: error.message || String(error)
    });
  }
};
