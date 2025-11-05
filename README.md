# Text Case Converter v4

A modern, responsive Next.js 15 application for text case conversion with support for multiple languages (English and Russian) and a beautiful dark/light theme toggle.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

## ✨ Features

- **🔄 Text Case Conversion**: Convert text to various cases (uppercase, lowercase, title case, sentence case, camel case, snake case, kebab case, alternating case)
- **🌍 Multi-language Support**: English and Russian interfaces with seamless language switching
- **🎨 Dark/Light Theme**: Beautiful OKLCH color scheme with automatic theme detection and persistent storage
- **📁 File Upload**: Support for various text file formats (.txt, .md, .js, .ts, .jsx, .tsx, .json, .css, .html)
- **📱 Responsive Design**: Mobile-first design that works perfectly on all devices and screen sizes
- **♿ Accessibility**: Built with Radix-UI primitives for excellent accessibility and keyboard navigation
- **🏗️ Modular Architecture**: Reusable components designed for future tool expansion and easy maintenance
- **⚡ Performance**: Optimized with Next.js 15 features including static generation and code splitting
- **🔍 SEO Optimized**: Built-in SEO optimization with meta tags and structured data

## 🚀 Tech Stack

- **⚛️ Framework**: Next.js 15 (App Router) with React 18
- **🎨 Styling**: Tailwind CSS v4 with OKLCH color space for better color accuracy
- **🧩 UI Components**: Radix-UI primitives for accessible, unstyled components
- **🎯 Icons**: Lucide React for beautiful, consistent iconography
- **📘 TypeScript**: Full type safety with strict mode enabled
- **🌐 Internationalization**: Custom i18n implementation with locale routing
- **📦 Package Manager**: npm with lockfile for consistent installs
- **🔧 Development**: ESLint, Prettier for code quality and formatting

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

- **Node.js**: Version 18.0 or higher
- **Package Manager**: npm (recommended) or yarn
- **Git**: For cloning the repository

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/text-case-converter-v4.git
cd text-case-converter-v4
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Start the development server:**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Type checking
npm run type-check   # Run TypeScript compiler check
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

The built application will be optimized and ready for deployment.

## 📱 Usage

### Text Case Conversion

1. **📝 Input Text**: Type or paste text in the left textarea
2. **🔄 Select Case**: Choose from 9 different case transformations using the dropdown
3. **👀 View Result**: See the converted text instantly in the right textarea
4. **⚡ Actions**: Copy, clear, download, or upload text files with one click

### Available Case Transformations

| Case Type | Example | Description |
|-----------|---------|-------------|
| **Original** | `Hello World` | No change to the text |
| **Uppercase** | `HELLO WORLD` | All letters in uppercase |
| **Lowercase** | `hello world` | All letters in lowercase |
| **Title Case** | `Hello World` | Each word capitalized |
| **Sentence case** | `Hello world` | First letter of each sentence capitalized |
| **camelCase** | `helloWorld` | First word lowercase, subsequent words capitalized |
| **snake_case** | `hello_world` | Words separated by underscores |
| **kebab-case** | `hello-world` | Words separated by hyphens |
| **aLtErNaTiNg** | `HeLlO WoRlD` | Alternating case pattern |

### File Upload & Download

**Supported file formats:**
- 📄 Text files (`.txt`)
- 📝 Markdown (`.md`)
- 💻 Code files (`.js`, `.ts`, `.jsx`, `.tsx`)
- 📊 Data files (`.json`)
- 🎨 Style files (`.css`, `.html`)

**Features:**
- Drag and drop file upload
- File validation and error handling
- Download converted text as `.txt` file
- Preserve original formatting where applicable

## 🔧 Customization

### Adding New Tools

1. **Create Component**: Add a new component in `src/components/tools/`
2. **Add Translations**: Include tool information in `src/lib/translations.ts`
3. **Update Navigation**: Modify the `OtherTools` component to include the new tool
4. **Add Routes**: Create new routes in `src/app/[locale]/` if needed

### Modifying Themes

Edit `src/app/globals.css` to customize:
- **🎨 Color Schemes**: Update OKLCH color values for light/dark themes
- **📐 Border Radius**: Modify border radius variables for different corner styles
- **📝 Typography**: Adjust font sizes, weights, and line heights
- **🔤 Fonts**: Add custom font families and loading strategies

### Adding Languages

1. **Configure i18n**: Add new locale to `src/lib/i18n.ts`
2. **Create Translations**: Add translation strings in `src/lib/translations.ts`
3. **Add Routes**: Create new route structure in `src/app/[locale]/`
4. **Test Locale**: Ensure all components work with the new language

### Environment Configuration

Create a `.env.local` file for environment variables:
```bash
# Optional: Add any environment-specific configurations
NEXT_PUBLIC_APP_NAME="Text Case Converter"
NEXT_PUBLIC_APP_VERSION="4.0.0"
```

## 📊 Performance

- **⚡ Static Generation**: Pages are pre-rendered at build time for optimal performance
- **📦 Code Splitting**: Automatic code splitting for better loading times and smaller bundles
- **🖼️ Image Optimization**: Built-in Next.js image optimization with WebP support
- **🔍 SEO Optimized**: Meta tags, structured data, and Open Graph tags for search engines
- **🚀 Core Web Vitals**: Optimized for Google's Core Web Vitals metrics
- **💾 Caching**: Intelligent caching strategies for static assets and API responses
- **📱 Mobile Performance**: Optimized for mobile devices with touch-friendly interactions

## 🎯 Future Enhancements

This project is designed as a foundation for building over 60 different tools:

### Planned Tools Categories

- **📝 Text Analysis**: Word count, readability scores, sentiment analysis
- **🖼️ Image Processing**: Resize, compress, format conversion utilities
- **🔄 Data Conversion**: JSON, XML, CSV, YAML converters
- **👨‍💻 Developer Utilities**: Code formatters, validators, generators
- **📊 Content Management**: SEO analyzers, meta tag generators
- **🔐 Security Tools**: Password generators, hash functions, encryption
- **📈 Data Visualization**: Chart generators, graph creators
- **🌐 Web Tools**: URL shorteners, QR code generators, color pickers

### Roadmap

- [ ] **v4.1**: Add more text transformation options
- [ ] **v4.2**: Implement user preferences and settings
- [ ] **v4.3**: Add batch processing capabilities
- [ ] **v4.4**: Integrate with external APIs for advanced features
- [ ] **v5.0**: Complete tool suite with 60+ utilities

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. **🍴 Fork the repository** on GitHub
2. **📋 Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/text-case-converter-v4.git
   cd text-case-converter-v4
   ```
3. **🌿 Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Process

1. **💻 Make your changes** following our coding standards
2. **🧪 Test thoroughly** - ensure all tests pass
3. **📝 Update documentation** if needed
4. **🔍 Run linting** and fix any issues:
   ```bash
   npm run lint:fix
   ```
5. **📤 Commit your changes** with descriptive messages
6. **📨 Submit a pull request** with a clear description

### Code Standards

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure accessibility compliance
- Test on multiple devices and browsers

### Reporting Issues

Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **⚛️ Built with** [Next.js](https://nextjs.org/) - The React framework for production
- **🎨 Styled with** [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- **🧩 UI components from** [Radix UI](https://www.radix-ui.com/) - Low-level UI primitives
- **🎯 Icons from** [Lucide](https://lucide.dev/) - Beautiful & consistent icon toolkit
- **📘 TypeScript** - For type safety and better developer experience
- **🌐 Vercel** - For hosting and deployment platform

## 📞 Support

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/yourusername/text-case-converter-v4/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/yourusername/text-case-converter-v4/discussions)
- **📧 Contact**: [your-email@example.com](mailto:your-email@example.com)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/text-case-converter-v4&type=Date)](https://star-history.com/#yourusername/text-case-converter-v4&Date)

---

<div align="center">

**Made with ❤️ for developers**

[⭐ Star this repo](https://github.com/yourusername/text-case-converter-v4) • [🐛 Report Bug](https://github.com/yourusername/text-case-converter-v4/issues) • [💡 Request Feature](https://github.com/yourusername/text-case-converter-v4/discussions)

</div>
