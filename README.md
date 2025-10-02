# Text Case Converter v4

A modern, responsive Next.js 15 application for text case conversion with support for multiple languages (English and Russian) and a beautiful dark/light theme toggle.

## ✨ Features

- **Text Case Conversion**: Convert text to various cases (uppercase, lowercase, title case, sentence case, camel case, snake case, kebab case, alternating case)
- **Multi-language Support**: English and Russian interfaces
- **Dark/Light Theme**: Beautiful OKLCH color scheme with theme toggle
- **File Upload**: Support for various text file formats (.txt, .md, .js, .ts, .jsx, .tsx, .json, .css, .html)
- **Responsive Design**: Mobile-first design that works on all devices
- **Accessibility**: Built with Radix-UI primitives for excellent accessibility
- **Modular Architecture**: Reusable components designed for future tool expansion

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 with OKLCH color space
- **UI Components**: Radix-UI primitives
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **Internationalization**: Custom i18n implementation

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and theme variables
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # English homepage
│   └── ru/                # Russian routes
│       └── page.tsx       # Russian homepage
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   │   ├── button.tsx    # Button component
│   │   ├── card.tsx      # Card components
│   │   └── theme-toggle.tsx # Theme toggle
│   ├── layout/           # Layout components
│   │   ├── Header.tsx    # Site header
│   │   ├── Footer.tsx    # Site footer
│   │   └── Layout.tsx    # Main layout wrapper
│   ├── tools/            # Tool-specific components
│   │   ├── TextCaseConverter.tsx # Main text converter
│   │   └── ToolCard.tsx  # Tool card for other tools
│   └── sections/         # Page sections
│       └── OtherTools.tsx # Other tools section
└── lib/                  # Utility functions
    ├── i18n.ts          # Internationalization utilities
    ├── translations.ts   # Translation strings
    └── utils.ts         # Common utility functions
```

## 🎨 Theme System

The application uses a modern OKLCH color space with:

- **Light Theme**: Clean, bright interface with subtle shadows
- **Dark Theme**: Easy on the eyes with proper contrast ratios
- **Automatic Detection**: Respects system theme preferences
- **Persistent Storage**: Remembers user's theme choice

## 🌍 Internationalization

- **English**: Default language at `/`
- **Russian**: Available at `/ru/`
- **Language Switching**: Seamless navigation between languages
- **Localized Content**: All text content is properly translated

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd text-case-converter-v4
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## 📱 Usage

### Text Case Conversion

1. **Input Text**: Type or paste text in the left textarea
2. **Select Case**: Choose from 9 different case transformations
3. **View Result**: See the converted text in the right textarea
4. **Actions**: Copy, clear, download, or upload text files

### Available Case Transformations

- **Original**: No change
- **Uppercase**: ALL CAPS
- **Lowercase**: all lowercase
- **Title Case**: Each Word Capitalized
- **Sentence case**: First letter of each sentence capitalized
- **camelCase**: camelCaseFormat
- **snake_case**: snake_case_format
- **kebab-case**: kebab-case-format
- **aLtErNaTiNg**: Alternating case

### File Upload

Supported file formats:
- Text files (.txt)
- Markdown (.md)
- Code files (.js, .ts, .jsx, .tsx)
- Data files (.json)
- Style files (.css, .html)

## 🔧 Customization

### Adding New Tools

1. Create a new component in `src/components/tools/`
2. Add tool information to `src/lib/translations.ts`
3. Update the `OtherTools` component to include the new tool

### Modifying Themes

Edit `src/app/globals.css` to customize:
- Color schemes
- Border radius
- Typography scales

### Adding Languages

1. Add new locale to `src/lib/i18n.ts`
2. Create translation strings in `src/lib/translations.ts`
3. Add new route in `src/app/[locale]/`

## 📊 Performance

- **Static Generation**: Pages are pre-rendered for optimal performance
- **Code Splitting**: Automatic code splitting for better loading times
- **Image Optimization**: Built-in Next.js image optimization
- **SEO Optimized**: Meta tags and structured data for search engines

## 🎯 Future Enhancements

This project is designed as a foundation for building over 60 different tools:

- Text analysis tools
- Image processing utilities
- Data conversion tools
- Developer utilities
- Content management tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Made with ❤️ for developers**
