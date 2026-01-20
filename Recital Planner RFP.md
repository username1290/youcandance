# **Request for Proposal: Recital Planner Coordination Platform**

## **1\. The Big Picture: Executive Summary**

The Recital Planner is a specialized logistics engine designed to bridge the gap between studio administrative data (spreadsheets) and backstage physical execution. We are not building a new database; we are building a **visual intelligence layer** that converts static rows into actionable show-day choreography.

The primary goals are to automate costume conflict detection, standardize measurements using the **metric system**, and provide a high-contrast, offline-resilient interface for theater environments.

## **2\. Technical Philosophy & Stack**

* **Architecture:** Top-down decoupling. Core logic must be separate from UI.  
* **Frontend:** Vite \+ React (PWA) with a migration path to Next.js.  
* **Source of Truth:** Google Sheets (MVP phase).  
* **Reliability:** Offline-first caching for theater "dead zones."  
* **Design Standards:** High-contrast "Theater Mode" (accessible UI), touch-friendly targets (min 44px), and metric-only data fields.

## **2.5. Design Framework (Tailwind CSS)**

To ensure consistency and reduce custom CSS, the project will utilize Tailwind CSS with a strict configuration.

### **Color Palette**
*   **Primary (Action):** `emerald-600` (Success/Go), `emerald-700` (Hover)
*   **Secondary (Accent):** `violet-600` (Creative/AI), `violet-700` (Hover)
*   **Danger (Alert):** `rose-500` (Conflict/Stop)
*   **Warning (Caution):** `amber-400` (Near Conflict)
*   **Neutral (Surface):** `slate-50` (Background), `slate-900` (Text)
*   **Theater Mode:** `neutral-900` (Background), `yellow-400` (High Contrast Text)

### **Typography**
*   **Headings:** `text-2xl` (Page), `text-xl` (Section), `font-bold`
*   **Body:** `text-base` (Standard), `text-sm` (Metadata)
*   **Labels:** `text-xs`, `uppercase`, `tracking-wide`

### **Spacing System**
*   **Container Padding:** `p-4` (Mobile), `p-6` (Tablet), `p-8` (Desktop)
*   **Component Gap:** `gap-4` (Standard), `gap-2` (Tight)
*   **Touch Targets:** `min-h-[44px]`, `min-w-[44px]` (Accessibility)

## **3\. Phased Deliverables**

### **Phase 0: The MVP (The "Sheet-to-Stage" Bridge)**

**Objective:** Validate the conflict engine using existing user data.

* **Google Sheets Integration:** OAuth 2.0 connection with a "Field Mapping" interface to link user columns to system attributes.  
* **The Conflict Engine:** Real-time analysis of show order to flag dancers with \< 2 pieces between appearances.  
* **Metric Measurement Dashboard:** Visualizing Dancer profiles (Girth, Chest, Waist, Hips in cm).  
* **Basic Lookbook:** A digital card for each piece containing the reference photo and text-based costume requirements.

### **Phase I: The Execution Layer (The "Live Show" Hub)**

**Objective:** Digitize the physical backstage workflow.

* **Backstage "Check-in" Mode:** High-contrast tablet view for marking dancers as "Dressed" or "In Wings."  
* **QR Label Generation:** Automated PDF generation of labels for garment bags linked to digital "Looks."  
* **Offline-First Sync:** Service workers to ensure the show order remains accessible without Wi-Fi.  
* **Advanced Sizing Logic:** Scripting to map metric measurements to common manufacturer size charts.

### **Phase II: The Creative Ecosystem (Expansion)**

**Objective:** Scale to stakeholders and creative planning.

* **AI Costume Creative Studio:** Prompt-to-garment generation for concept moodboarding.  
* **Parent Portal:** Limited-access view for families to submit measurements and view costume "Looks."  
* **The "Crisis" Broadcast:** Real-time push notifications for immediate schedule changes.  
* **Multi-Show Management:** Ability to toggle between different casts or performance dates within the same sheet.

## **4\. Design Checklist (Mandatory for Developers)**

All design submissions must account for:

1. **Metric-First Inputs:** No imperial units; all measurements in cm.  
2. **Visual Conflict Indicators:** Color-coded severity levels (Red/Yellow/Blue).  
3. **Sync Heartbeat:** A clear visual indicator showing if the app is currently connected to the Google Sheet.  
4. **Field Mapping UI:** A robust way for handling "dirty" spreadsheet data.

## **5\. Submission Requirements**

Developers should provide:

* An architectural diagram showing the Google Sheets sync flow.  
* A plan for handling offline data persistence.  
* A fixed-price quote for Phase 0 (MVP).