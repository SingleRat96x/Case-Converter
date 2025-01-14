import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - Case Converter Tool',
  description: 'Learn more about our free online case converter tool and its features.',
};

export default function AboutPage() {
  return (
    <div className="container py-8 max-w-[800px]">
      <h1 className="text-4xl font-bold mb-8">About Case Converter</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          Case Converter is a free online tool designed to help you transform text between different cases quickly and easily. Whether you&apos;re a writer, developer, or anyone who works with text, our tool makes it simple to convert text to the format you need.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Our Tool?</h2>
        <ul className="space-y-3 list-disc pl-6">
          <li>
            <strong>Simple and Fast:</strong> Our tool is designed with simplicity in mind. Just paste your text and click a button to transform it.
          </li>
          <li>
            <strong>Multiple Case Options:</strong> Convert to UPPERCASE, lowercase, Title Case, Sentence case, or aLtErNaTiNg case with a single click.
          </li>
          <li>
            <strong>Text Statistics:</strong> Get instant counts of characters, words, sentences, and lines as you type or paste text.
          </li>
          <li>
            <strong>Privacy First:</strong> Your text is processed entirely in your browser. We don&apos;t store or transmit any of your content.
          </li>
          <li>
            <strong>Free to Use:</strong> No registration required, no hidden fees, and no limitations on usage.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Use Cases</h2>
        <ul className="space-y-3 list-disc pl-6">
          <li>
            <strong>Content Creation:</strong> Format titles, headings, and text for articles, blog posts, or social media content.
          </li>
          <li>
            <strong>Development:</strong> Convert variable names between different naming conventions (e.g., camelCase, snake_case).
          </li>
          <li>
            <strong>Documentation:</strong> Ensure consistent capitalization in technical documentation or user guides.
          </li>
          <li>
            <strong>Data Formatting:</strong> Clean up and standardize text data for databases or spreadsheets.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Commitment</h2>
        <p className="mb-6">
          We&apos;re committed to providing a reliable, easy-to-use tool that helps you work more efficiently. We regularly update our tool based on user feedback and continue to add new features to make it even more useful.
        </p>
      </div>
    </div>
  );
} 