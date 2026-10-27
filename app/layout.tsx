// Root layout — minimal, just sets <html> basics.
// Actual locale/dir/lang is set in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
