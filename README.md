# Binary Froster Portfolio Applications Directory

## Executive Overview
This directory contains standalone, production-ready applications developed to back all Binary Froster portfolio case studies. Each application is independently buildable, fully interactive, and deployed live to production on Vercel.

---

## Production Applications Directory

| Project Name | Portfolio Category | Production URL | Framework & Tech Stack | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Nexus LLM Portal** | AI & Automation | [https://nexus-llm-portal.vercel.app](https://nexus-llm-portal.vercel.app) | Next.js 15, React 19, TypeScript, TailwindCSS, Lucide | Multi-model router (Claude 3.5, GPT-4o, Gemini 1.5, Llama 3.1), live streaming responses, interactive RAG document ingestion, citation inspector, token telemetry |
| **FlowOps ERP** | Management Systems | [https://flowops-erp-three.vercel.app](https://flowops-erp-three.vercel.app) | Next.js 15, React 19, TypeScript, TailwindCSS, Lucide | Manufacturing execution floor, 4-stage Kanban assembly pipeline, real-time inventory ledger with barcode scanner, purchase orders, COGS and margin calculators |
| **MediCare Hub** | Management Systems | [https://medicare-hub-sooty.vercel.app](https://medicare-hub-sooty.vercel.app) | Next.js 15, React 19, TypeScript, TailwindCSS, Lucide | HIPAA Level 3 encrypted patient EHR directory, live biometric vitals telemetry (BP, HR, SpO2), appointment queue, e-prescription composer, ICD-10 diagnostic billing |
| **LearnBridge LMS** | Management Systems | [https://learnbridge-lms.vercel.app](https://learnbridge-lms.vercel.app) | Next.js 15, React 19, TypeScript, TailwindCSS, Lucide | Adaptive video player with interactive timecode scrubbing, timestamped note-taking, 16-lesson syllabus tree, automated quiz engine with instant scoring, verified certificates |
| **EduTrack SIS** | Management Systems | [https://edutrack-sis.vercel.app](https://edutrack-sis.vercel.app) | Next.js 15, React 19, TypeScript, TailwindCSS, Lucide | STEM cohort student directory, live daily attendance register with dynamic rate recalculation, weighted GPA gradebook, broadcast emergency and academic bulletins |
| **PropValuate — Real Estate Predictor** | Real Estate / PropTech | [https://real-estate-predictor-zeta.vercel.app](https://real-estate-predictor-zeta.vercel.app) | Next.js 15, React 19, TypeScript, TailwindCSS, Lucide | ML property valuation calculator across London boroughs, real-time 92% confidence interval spread, SHAP feature importance breakdown, HM Land Registry comps, rental yield forecasting |
| **VocalFlow — Voice Call Automation** | AI & Automation | [https://voice-call-automation-delta.vercel.app](https://voice-call-automation-delta.vercel.app) | Next.js 15, React 19, TypeScript, TailwindCSS, Lucide | Telephony dispatch console, live HTML5 canvas oscilloscope audio visualizer, real-time turn-by-turn transcription feed (Agent vs. Customer), acoustic sentiment index, VAD sensitivity tuning |

---

## Architecture Standards
- Zero external runtime dependencies beyond React 19, Next.js 15, TailwindCSS, and Lucide React.
- Full responsive design supporting mobile (375px), tablet (768px), and high-resolution desktop (1440px+).
- Dark-mode-first aesthetic matching the Binary Froster cyber design system:
  - Deep obsidian background: `#08090C`
  - High-contrast card surfaces: `#0E121A` and `#111622`
  - Cyan and electric accents: `#00F2FE` and `#38BDF8`
  - Monospace telemetry typography: JetBrains Mono
- Self-contained in-memory and stateful mock persistence with real-time UI interaction.
- Zero emojis across all source files, schemas, and logs.

---

## Deployment & Verification
Every application is deployed to production via Vercel under the `binaryfrosters-projects` team organization:
- `nexus-llm-portal`: [https://nexus-llm-portal.vercel.app](https://nexus-llm-portal.vercel.app)
- `flowops-erp`: [https://flowops-erp-three.vercel.app](https://flowops-erp-three.vercel.app)
- `medicare-hub`: [https://medicare-hub-sooty.vercel.app](https://medicare-hub-sooty.vercel.app)
- `learnbridge-lms`: [https://learnbridge-lms.vercel.app](https://learnbridge-lms.vercel.app)
- `edutrack-sis`: [https://edutrack-sis.vercel.app](https://edutrack-sis.vercel.app)
- `real-estate-predictor`: [https://real-estate-predictor-zeta.vercel.app](https://real-estate-predictor-zeta.vercel.app)
- `voice-call-automation`: [https://voice-call-automation-delta.vercel.app](https://voice-call-automation-delta.vercel.app)
