import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Accountant Bano | Practical Accounting Academy",
    template: "%s | Accountant Bano",
  },
  description:
    "Accounting Seekho. Skill Banao. Career Banao. Practical accounting courses, notes and personal doubt support.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
