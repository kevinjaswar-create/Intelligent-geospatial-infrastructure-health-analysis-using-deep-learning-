# GeoInfra AI — Intelligent Geospatial Infrastructure Health Analysis

GeoInfra AI is an enterprise-grade full-stack web application designed for civil engineers, transportation departments, and municipal asset managers. It combines **Deep Learning Computer Vision**, **Geospatial Information Systems (GIS)**, **automated defect detection**, and **transparent health scoring** to monitor transportation corridors, bridges, highways, overpasses, and tunnels in real time.

---

## 1. Project Overview & Objectives

Civil infrastructure across highway corridors and metropolitan areas deteriorates due to heavy traffic loading, environmental cycles, and material fatigue. Traditional manual inspection is slow, hazardous, and difficult to cross-correlate geographically.

**GeoInfra AI provides:**
- **Automated Defect Recognition:** Scans surface and structural distress (potholes, longitudinal/transverse cracks, fatigue alligator cracking, concrete spalling, exposed reinforcing rebar, joint failure).
- **Bounding Box Localization:** High-precision normalized bounding box coordinates with confidence percentages and dimension/depth estimates.
- **Transparent Health Scoring (GeoInfra Index v2.4):** Transparent, configurable civil health scoring formula (0–100) calibrated with defect penalties, structure age degradation, and AI confidence weighting.
- **Geospatial GIS Integration:** Real-time interactive spatial map using Leaflet and OpenStreetMap/CartoDB with color-coded severity markers, pulsating critical alerts, and GeoJSON export.
- **Maintenance Priority Dispatch:** Risk-ranked maintenance queue with work order generation, crew allocation, and cost estimation.
- **Engineering Condition Reports:** Certified executive summaries, CSV exports, JSON exports, and print/PDF-ready engineering audits.

---

## 2. Key Features

- **Role-Based Access Control (RBAC):**
  - **ADMIN:** Full rights to configure scoring weights, delete assets, manage users, and inspect the complete audit trail.
  - **ENGINEER / INSPECTOR:** Perform AI vision scans, register infrastructure, and dispatch work orders.
  - **VIEWER:** Read-only access to GIS corridor maps, condition reports, and executive dashboards.
  - *Instant 1-Click Role Switcher included in the top navigation bar for seamless evaluation.*
- **Dual Inference Engine Architecture:**
  - **Real Multimodal Vision AI:** Powered by `@google/genai` with `gemini-3.8-flash` multimodal vision. Analyzes uploaded high-resolution imagery and returns structured bounding boxes and defect telemetry.
  - **Calibrated Benchmark Simulator (YOLO Mode):** Deterministic civil benchmark inference with clearly labeled badges and metadata, ensuring full functionality even in offline or air-gapped environments.
- **Interactive Defect Bounding Box Canvas:**
  - Zoom & Pan controls (75% to 250%).
  - Hover synchronization between defect cards and image bounding boxes.
  - Toggle bounding boxes on and off.
  - Color-coded borders based on severity: Red (Critical), Amber (High), Yellow (Medium), Cyan (Low).
- **Curated 1-Click Sample Library:**
  - Real-world distress samples (I-880 asphalt pothole, San Mateo Bridge column spalling, MacArthur Maze deck cracks, Skyline Ridge retaining wall joint displacement).
  - Custom file upload with client-side format and size validation.
- **GIS Mapping Station:**
  - Interactive Leaflet map with dark, standard, and satellite tile layers.
  - Health rating filters and structural type filters.
  - GeoJSON export of the regional corridor.

---

## 3. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 React SPA Client (Vite)                     │
│  - Tailwind CSS 4 UI                                        │
│  - Leaflet GIS Interactive Map                              │
│  - Bounding Box SVG Inspection Canvas                       │
│  - Role-Based Access Control (Admin / Inspector / Viewer)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST / JSON
┌──────────────────────────────▼──────────────────────────────┐
│             Express Full-Stack Server (server.ts)           │
│  - Port 3000                                                │
│  - Auth & Bearer Token Verification                         │
│  - Asset Management CRUD                                    │
│  - Work Orders & Maintenance Priority Queue                 │
│  - Audit Trail Logging                                      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼─────────────┐ ┌──────────────▼───────────────┐
│     Google GenAI SDK       │ │   Configurable Scoring GHI   │
│  - gemini-3.8-flash Vision │ │   Formula Engine             │
│  - Structured JSON Schema  │ │   - Defect Penalties         │
│  - Multimodal Detection    │ │   - Age Degradation          │
└────────────────────────────┘ └─────────────────────────────┘
```

---

## 4. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Lucide React icons.
- **Geospatial & Mapping:** Leaflet, OpenStreetMap, CartoDB Basemaps.
- **Backend & APIs:** Node.js, Express, tsx.
- **Artificial Intelligence & Vision:** `@google/genai` TypeScript SDK (`gemini-3.8-flash`).
- **Telemetry & Validation:** TypeScript 5, Vite compiler, ESLint.

---

## 5. Prerequisites

- **Node.js:** v18.0.0 or higher (v20+ recommended).
- **npm:** v9.0.0 or higher.
- *(Optional for real-time Gemini Vision):* `GEMINI_API_KEY` set in your environment.

---

## 6. Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd geoinfra-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key (optional; if omitted, the application seamlessly runs on the calibrated benchmark YOLO simulation):
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```

---

## 7. Running the Application

### Development Mode (with hot-reload and Vite middleware on Express):
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Production Build:
```bash
npm run build
npm start
```

### Type Checking & Linting:
```bash
npm run lint
```

---

## 8. Demo Accounts & Roles

The system is pre-seeded with three demo roles accessible via the top role selector:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@geoinfra.io` | `admin123` | Full access to scoring weights, asset deletion, user management, audit logs. |
| **Inspector (Engineer)** | `inspector@geoinfra.io` | `inspector123` | Upload images, run AI scans, register assets, dispatch work orders. |
| **Viewer** | `viewer@geoinfra.io` | `viewer123` | Read-only access to GIS maps, condition reports, and dashboards. |

---

## 9. API Reference

### Authentication
- `POST /api/auth/login` — Authenticate and receive session token.
- `GET /api/auth/me` — Retrieve active user session profile.

### Infrastructure Assets
- `GET /api/infrastructure` — List assets with optional `type`, `status`, `priority`, and `search` query filters.
- `GET /api/infrastructure/:id` — Retrieve detailed asset record, linked inspection scans, and work orders.
- `POST /api/infrastructure` — Register a new asset with GPS coordinates.
- `DELETE /api/infrastructure/:id` — Remove asset (Admin only).

### Deep Learning Defect Detection
- `POST /api/analysis/detect` — Execute computer vision scan.
  - Body: `{ imageBase64?: string, imageUrl?: string, infrastructureId?: string, mode?: "gemini" | "mock" }`
  - Returns: Structured defects, bounding boxes, severity, and computed health score.
- `GET /api/analysis` — List previous inspection analyses.
- `GET /api/analysis/:id` — Retrieve specific inspection record.

### Maintenance & Work Orders
- `GET /api/work-orders` — Retrieve work order priority queue.
- `POST /api/work-orders` — Dispatch a new maintenance work order.
- `PATCH /api/work-orders/:id/status` — Update order status (`PENDING`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`).

### Configuration & Telemetry
- `GET /api/dashboard/stats` — Corridor-wide statistical overview.
- `GET /api/config/health-score` — Retrieve scoring formula weights.
- `PUT /api/config/health-score` — Calibrate formula weights (Admin only).
- `GET /api/audit-logs` — Retrieve system audit trail.

---

## 10. Health Score Formula (GHI v2.4)

The GeoInfra Health Index generates an engineering condition score between 0 and 100:

$$\text{Health Score} = \max\left(0, \min\left(100, 100 - \sum (\text{Defect Penalty} \times \text{Confidence Weight}) - \text{Age Degradation}\right)\right)$$

### Default Calibrated Deductions:
- **Critical Defect** (e.g., structural pothole, exposed rebar): **-22 pts**
- **High Defect** (e.g., severe alligator cracking, concrete spalling): **-12 pts**
- **Medium Defect** (e.g., transverse thermal crack, joint displacement): **-6 pts**
- **Low Defect** (e.g., surface hairline crack, raveling): **-2.5 pts**
- **Age Factor:** **-0.15 pts per decade** of asset age.

### Rating Bands:
- **90–100:** Healthy (Nominal maintenance)
- **70–89:** Good (Minor surface distress)
- **40–69:** Moderate (Scheduled rehabilitation recommended)
- **20–39:** Poor (Severe distress; lane restriction advised)
- **0–19:** Critical (Immediate structural emergency intervention)

---

## 11. Security & Compliance

- Server-side only Gemini API key handling; no secrets exposed to client browser bundles.
- Role-based route authorization.
- Client-side and server-side image MIME type and size checks.
- Sanitized input handling and telemetry headers (`User-Agent: aistudio-build`).
- Clear engineering disclaimers distinguishing application-generated estimates from statutory certified engineering stamps.
