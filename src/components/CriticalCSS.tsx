// This component is for critical CSS - we'll handle this through Next.js optimization instead
export function CriticalCSS() {
  // Remove inline CSS approach to fix ESLint warning
  // Critical CSS should be handled through Next.js built-in CSS optimization
  return null;
}

// Component to lazy load non-critical CSS
export function NonCriticalCSS() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      {/* Load remaining CSS asynchronously */}
      <link
        rel="preload"
        href="/_next/static/css/main.css"
        as="style"
        onLoad={(e) => {
          const target = e.target as HTMLLinkElement;
          target.onload = null;
          target.rel = 'stylesheet';
        }}
      />
      <noscript>
        <link rel="stylesheet" href="/_next/static/css/main.css" />
      </noscript>
    </>
  );
}