# Os-Ve (Open Source Video Editor)


> LIVE WebApp: https://dovvnloading.github.io/Os-Video-Editor/

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)

**Os-Ve** is a professional-grade, web-based non-linear video editing (NLE) suite constructed entirely on modern web technologies. It leverages the HTML5 Canvas API for high-performance rendering and the MediaRecorder API for client-side encoding, providing a seamless editing experience without server-side processing dependencies.

The architecture mimics industry-standard NLEs, featuring a multi-track timeline, keyframe-ready rendering engine, real-time compositing, and a robust asset management system.

<img width="1920" height="1080" alt="Os-Ve Interface" src="https://github.com/user-attachments/assets/e3af3cdf-7409-4e2d-8f20-295391c3221e" />

## Project Information

*   **Repository:** [github.com/dovvnloading/Os-Video-Editor](https://github.com/dovvnloading/Os-Video-Editor)
*   **Live Application:** [AI Studio Launchpad](https://ai.studio/apps/drive/16rRYYZN3fHEpMgWp4l1TV15szBi-wjGP)
*   **Developer:** Matthew Weseny
*   **License:** MIT

## Installation and Deployment

This project utilizes Vite for a lightning-fast development server and optimized production builds.

### Prerequisites
*   Node.js (v18.0.0 or higher recommended)
*   npm or yarn

### Local Development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/dovvnloading/Os-Video-Editor.git
    cd Os-Video-Editor
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

---

# Technical Architecture Documentation

Os-Ve is architected as a Single Page Application (SPA) where the rendering engine is decoupled from the UI layer, though both share a unified state via React Context.

## 1. System Core: State Management
The heart of the application is the `ProjectContext` (located in `store/ProjectContext.tsx`). It employs a rigorous Reducer pattern to manage the complex state of a video project.

### The Project State
The state object (`ProjectState`) serves as the single source of truth for the entire renderer. It tracks:
*   **Assets:** Raw media files (Blob URLs) and metadata.
*   **Tracks:** Ordered layers for compositing logic (Video/Audio distinction, Locking, Hiding).
*   **Clips:** Temporal instances of assets placed on the timeline, containing offset data, duration, and effect parameters.
*   **Playback:** `currentTime`, `isPlaying` boolean, and `zoom` levels.

### The Game Loop (Tick)
Unlike standard web apps that react only to user input, Os-Ve implements a `requestAnimationFrame` loop within the Provider. When `isPlaying` is true, the loop dispatches `TICK` actions, advancing the `currentTime` based on the delta time between frames. This ensures playback speed remains consistent regardless of frame rate fluctuations.

## 2. The Rendering Engine (`renderUtils.ts`)
The rendering pipeline is a pure function that transforms the `ProjectState` into visual pixels on an HTML5 Canvas. This engine handles compositing, transformations, and effects in real-time.

### Pipeline Stages
1.  **Clear & Prep:** The canvas is wiped, and a black background is applied.
2.  **Temporal Filtering:** The engine filters the `clips` array to identify only those active at the current timestamp.
3.  **Z-Index Sorting:** Clips are mapped to their respective tracks. The array is sorted based on track order to ensure upper tracks render *over* lower tracks (standard NLE compositing behavior).
4.  **Synchronization:**
    *   For video assets, the engine calculates the precise frame required: `(currentTime - clip.startTime) + clip.offset`.
    *   It updates the underlying hidden DOM `<video>` elements to this time.
5.  **Context Transformation:**
    *   **Translation:** Moves the context to the center of the canvas.
    *   **Affine Transforms:** Applies Rotation and Scale based on clip properties.
    *   **Filters:** Applies CSS-style filters (Blur, Grayscale, Sepia, Contrast, etc.) directly to the context.
    *   **Compositing:** Sets the `globalCompositeOperation` based on the clip's Blend Mode (e.g., Screen, Overlay, Multiply).
6.  **Draw:** The media source (Video Frame or Image) is drawn to the canvas.
7.  **Post-Processing:** Overlays such as Vignettes or Tinting are applied via procedural gradient generation or fill layers on top of the source.

## 3. Timeline Mechanics
The Timeline (`Timeline.tsx` and `TimelineComponents.tsx`) is a specialized UI component that translates spatial mouse events into temporal data.

*   **Virtualization:** To maintain performance with long projects, the timeline calculations allow for optimized DOM updates.
*   **Snapping Algorithm:** When dragging clips, a custom algorithm calculates the delta between the drag edge and nearby "magnet" points (Playhead, start/end of other clips). If within a threshold (20px), the time is mathematically clamped to the snap point.
*   **Zoom Logic:** The timeline relies on a `pixelsPerSecond` (zoom) constant. All rendering of clips and the ruler is derived from `time * zoom`.

## 4. Export & Encoding Module
The Export system (`ExportModal.tsx`) enables client-side rendering without backend ffmpeg dependency.

### The Render Loop
1.  **Canvas Capture:** A secondary, off-screen canvas is created matching the target output resolution (up to 4K).
2.  **Frame Stepping:** The engine pauses the UI playback and enters a rendering mode. It creates a `MediaRecorder` stream from the canvas.
3.  **Synchronous Advancement:** The loop advances `currentTime` by `1 / fps` intervals.
4.  **Draw & Capture:** For every interval, `renderFrame` is called, and the stream captures the resulting pixel data.
5.  **Blob Generation:** Once the duration is reached, the chunks are assembled into a Blob (WebM/MP4) and triggered for download.

## 5. Asset Management
The application uses the browser's `URL.createObjectURL` to handle large media files efficiently.
*   **Import:** Files are not uploaded to a server. They remain local. A Blob URL is generated, serving as a pointer to the file in the browser's memory.
*   **Media Caching:** `Preview.tsx` maintains a `Map<string, HTMLVideoElement>` ref. This ensures that creating multiple clips from a single asset does not duplicate the heavy DOM element, but rather references a shared media source.

## 6. Directory Structure

```text
src/
├── components/
│   ├── Editor/
│   │   ├── AssetManager.tsx    # Media import and list
│   │   ├── EffectsLibrary.tsx  # Drag-and-drop preset system
│   │   ├── ExportModal.tsx     # Rendering logic and UI
│   │   ├── Preview.tsx         # The Canvas viewport
│   │   ├── PropertiesPanel.tsx # Attribute editor (Scale, Opacity, etc.)
│   │   ├── Timeline.tsx        # Main timeline container
│   │   └── TimelineComponents.tsx # Tracks, Clips, Ruler, Playhead
│   └── UI/
│       ├── ContextMenu.tsx     # Custom right-click logic
│       └── Icons.tsx           # SVG Icon system
├── store/
│   └── ProjectContext.tsx      # Global State & Reducer
├── utils/
│   └── renderUtils.ts          # Core Canvas rendering engine
├── constants.ts                # Configuration defaults
├── types.ts                    # TypeScript interfaces
├── App.tsx                     # Layout orchestration
└── main.tsx                    # Entry point
```

---

Copyright © 2025 Matthew Weseny.
