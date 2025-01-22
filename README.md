# Case Converter Tool

A modern, responsive web application for converting text between different cases. Built with Next.js, TypeScript, and TailwindCSS.

## Features

- Convert text to:
  - UPPERCASE
  - lowercase
  - Title Case
  - Sentence case
  - aLtErNaTiNg case
- Real-time text statistics:
  - Character count
  - Word count
  - Sentence count
  - Line count
- Responsive design that works on all devices
- Dark/Light theme support
- Clean and modern user interface

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for production
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Beautiful icons
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management

## Integration References

- [Journey by Mediavine (Grow.me) NextJS Integration Guide](https://fchiaramonte.com/blog/journey-mediavine-nextjs-integration) - Guide for implementing Grow.me in Next.js

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd case-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── tools/
│   │       └── CaseChangerTool.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   ├── page.tsx
│   │   └── contact-form.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

test
