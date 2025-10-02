import "../globals.css";
import { LanguageDetector } from "@/components/LanguageDetector";

export default function RuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LanguageDetector />
      {children}
    </>
  );
}

