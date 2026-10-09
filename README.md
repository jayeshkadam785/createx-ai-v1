CreateX AI V1
CreateX AI is a starter AI creation platform: Describe it. Create it. Launch it.
V1 features
CreateX AI dashboard
Prompt-to-website workflow
Structured website generation demo API
Live website preview UI
AI editor interface
Recent projects with browser storage
Templates and deployment UI
Responsive SaaS dashboard
GitHub/Vercel-ready Next.js structure
> **V1 note:** The `/api/generate` endpoint currently uses mock structured data so the project can be developed at ₹0. A real AI provider can be connected later without changing the dashboard flow.
Tech stack
Next.js 15.5.27
React 19.1.0
TypeScript
Lucide React
CSS
Run locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.
Build for production
```bash
npm run build
npm run start
```
GitHub
Do not commit:
`node_modules/`
`.next/`
`.env*`
`.vercel/`
API keys or secrets
The included `.gitignore` protects these files.
Next development steps
Connect a real AI API to `/api/generate`.
Return validated website JSON.
Render reusable website components from that JSON.
Add project persistence/database.
Add export and Vercel deployment.
Add AI image, video and voice generation in later versions.
