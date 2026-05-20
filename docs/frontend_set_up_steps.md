# Frontend Setup Guide & Architecture Summary

## 1. Project Structure
Current state of the Monorepo (`recruitment-system`):

```text
├── pnpm-workspace.yaml      # Defines the Monorepo structure
├── .gitignore               # Security (ignores node_modules, secrets, etc.)
└── apps/
    └── web/                 # REACT FRONTEND
        ├── vite.config.ts   # Build tool config (handling Aliases)
        ├── tsconfig.json    # TypeScript config (handling Aliases)
        ├── tailwind.config.js # Style configuration (v3)
        ├── postcss.config.js  # CSS processing config
        └── src/
            ├── index.css    # Global CSS (Tailwind imports)
            └── lib/utils.ts # Shadcn utility helper

```

## 2. Installation Steps (Recap) 
### A. Monorepo Initialization
Tool: pnpm (Performant Node Package Manager).
Config: pnpm-workspace.yaml tells the system that apps/* contains the packages.
### B. Frontend Core
Stack: React 18 + TypeScript + Vite.
Command: pnpm create vite web --template react-ts.
### C. Styling Engine (Crucial Fix)
Framework: Tailwind CSS Version 3.4.17.
Note: Explicitly pinned to v3 to avoid v4 PostCSS conflicts.
Configuration Files:
tailwind.config.js: Defines where to look for class names (content array).
postcss.config.js: Connects Tailwind to the build process.
src/index.css: Injects @tailwind directives.
### D. Path Aliases (@/)
Goal: Allow clean imports like import Button from "@/components/ui/button".
Implementation:
Vite: configured resolve.alias to map @ -> ./src.
TypeScript: configured compilerOptions.paths to map @/* -> ./src/*.
### E. UI Library
Library: Shadcn/UI.
Setup: Initialized via pnpm dlx shadcn-ui@latest init.
Components: Installed into src/components/ui.
## 3. Debugging Checklist
If the frontend breaks in the future, check these files based on the symptom:

Symptom	File to Check	What to look for
Styles not applying	apps/web/tailwind.config.js

Ensure content: ["./src/**/*.{ts,tsx}"] covers your files.
"Module not found: @"	apps/web/tsconfig.json	Check if "paths": { "@/*": ... } is present. 

PostCSS / Tailwind Error	apps/web/package.json	Ensure tailwindcss is version ^3.x.x (NOT 4.x).
Components look broken	apps/web/src/index.css	Ensure @tailwind base; is at the very top.

### 4. How to Run

    cd apps/web
    pnpm dev