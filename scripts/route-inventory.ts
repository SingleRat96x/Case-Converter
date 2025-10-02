import { getAllMetadataEntries, validateRegistry } from '@/lib/metadata/toolMetadata';

function main() {
  const entries = getAllMetadataEntries();
  const issues = validateRegistry();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ count: entries.length, entries, issues }, null, 2));
}

main();

