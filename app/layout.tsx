import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
title: {
default: "CreateX AI | Create Without Limits",
template: "%s | CreateX AI",
},
description:
"Turn your ideas into websites and digital experiences with CreateX AI.",
applicationName: "CreateX AI",
keywords: [
"CreateX AI",
"AI website generator",
"website builder",
"AI content creation",
"AI tools",
],
authors: [{ name: "CreateX AI" }],
};

export const viewport: Viewport = {
width: "device-width",
initialScale: 1,
themeColor: "#10111b",
};

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode;
}>) {
return ( <html lang="en"> <body>{children}</body> </html>
);
}
