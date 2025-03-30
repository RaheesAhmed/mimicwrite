# Human-Like Writing Generator - Frontend

A modern Next.js application that provides an intuitive interface for generating human-like content that mimics a user's writing style while avoiding detection by AI content detectors.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (latest version)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Rich Text Editor**: [Tiptap](https://tiptap.dev/)
- **Animations**: Framer Motion
- **Theming**: next-themes (supports light/dark mode)

## Features

- Rich text editor with formatting controls
- User input collection (profession, writing sample)
- Content generation with customizable parameters
- Responsive design that works across devices
- Modern, Apple-inspired UI with clean aesthetics

## Getting Started

1. **Install dependencies**:

```bash
npm install
```

2. **Set up environment variables**:

Create a `.env.local` file with required variables:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Run the development server**:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Main application pages and routing
  - `page.tsx` - Homepage with writing interface
  - `write/` - Content generation page
- `components/` - Reusable UI components
- `lib/` - Utility functions and shared code

## Build for Production

```bash
npm run build
npm run start
```

## Learn More

This project is part of the Human-Like Writing Generator system that helps content creators avoid false positives in AI detection systems while maintaining their authentic writing voice.

For more information about the overall project, check the main [README.md](../README.md) in the root directory.
