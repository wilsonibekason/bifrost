# BiFrost Browser

A modern web browser built with pure HTML, CSS (Tailwind), and TypeScript.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

### Development

Start the development server:
\`\`\`bash
npm run dev
\`\`\`

This will start Vite dev server at `http://localhost:8080`. The server will:

- Compile TypeScript files automatically
- Enable hot module replacement (HMR)
- Serve files with correct MIME types

**Important:** Do NOT open `index.html` directly in the browser. Always use the Vite dev server.

### Building for Production

Build the project:
\`\`\`bash
npm run build
\`\`\`

Preview the production build:
\`\`\`bash
npm run preview
\`\`\`

## Project Structure

\`\`\`
bifrost-browser/
├── index.html # Main HTML entry point
├── components/ # HTML component files
│ ├── toolbar.html
│ ├── history-panel.html
│ ├── downloads-panel.html
│ ├── bookmarks-panel.html
│ ├── notes-panel.html
│ ├── tasks-panel.html
│ └── settings-panel.html
├── scripts/ # TypeScript source files
│ ├── main.ts # Main entry point
│ ├── tabs.ts # Tab management
│ ├── search.ts # Search autocomplete
│ └── utils.ts # Utility functions
├── package.json
├── tsconfig.json
└── vite.config.ts
\`\`\`

## Features

- Tab management (create, close, switch tabs)
- Search with autocomplete
- History tracking
- Bookmarks management
- Downloads panel
- Notes and tasks
- Settings panel

## Technology Stack

- **HTML5** - Structure
- **Tailwind CSS** - Styling
- **TypeScript** - Logic and interactivity
- **Vite** - Build tool and dev server
