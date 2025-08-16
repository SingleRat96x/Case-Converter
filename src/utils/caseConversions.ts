export type CaseType = 'upper' | 'lower' | 'title' | 'sentence' | 'alternate';

export const caseConversions = {
  upper: (text: string) => text.toUpperCase(),
  lower: (text: string) => text.toLowerCase(),
  title: (text: string) => text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
  sentence: (text: string) => text.toLowerCase().replace(/(^\w|\.\s+\w)/g, c => c.toUpperCase()),
  alternate: (text: string) => text.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join('')
};

export const getCaseLabel = (type: CaseType): string => {
  const labels: Record<CaseType, string> = {
    upper: 'UPPERCASE',
    lower: 'lowercase',
    title: 'Title Case',
    sentence: 'Sentence case',
    alternate: 'aLtErNaTiNg cAsE'
  };
  return labels[type];
};

export const getDownloadFilename = (type: CaseType): string => {
  const filenames: Record<CaseType, string> = {
    upper: 'uppercase-text.txt',
    lower: 'lowercase-text.txt',
    title: 'title-case-text.txt',
    sentence: 'sentence-case-text.txt',
    alternate: 'alternating-case-text.txt'
  };
  return filenames[type];
};