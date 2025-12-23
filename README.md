# 🎬 VideoSceneFlow AI

**VideoSceneFlow AI** is a professional-grade video storyboarding and pre-visualization tool powered by the Google Gemini API. It transforms raw ideas, images, or videos into detailed, consistent, and cinematic storyboards tailored for modern social media and film production.

---

## 🌟 Key Features

### 1. Multi-Modal Input Processing
- **Text-to-Storyboard**: Turn a simple prompt or script idea into a full roadmap.
- **Media-to-Storyboard**: Upload an existing photo or video; the AI analyzes the content to extract, remake, or extend the script while maintaining visual continuity.

### 2. Specialized AI Modes
- **Script Extraction**: Analyze media to reverse-engineer the existing structure.
- **Deep Analysis**: A thorough breakdown of context, vibe, and technical details.
- **Remake Script**: Create a fresh, creative spin on your input idea.
- **TikTok/Shorts Optimizer**: Tailor the pacing and hook for viral short-form content.

### 3. Professional Visual Consistency
- **Top Model Standard**: Specialized system instructions ensure characters are generated with a consistent "Top Model" Vietnamese aesthetic—sexy, glamorous, and high-fashion.
- **Visual Style Guide**: AI generates a master style guide (lighting, mood, textures) used to anchor all generated images and videos.

### 4. High-Fidelity Asset Generation
- **Image Quality**: Choose between **1K, 2K, and 4K** resolutions using `gemini-3-pro-image-preview`.
- **Video Generation**: Transform static frames into motion with **720p or 1080p** renders via Google's **Veo** model.

### 5. Cinematic Slideshow Preview
- **Dynamic Transitions**: Choose between **Smooth Dissolve**, **Ken Burns (Slow Pan/Zoom)**, or **Dynamic Slide** effects.
- **Audio Integration**: Upload a reference audio track to preview the pacing of your storyboard with music.
- **Sync Playback**: Automatic transitions based on scene duration.

### 6. Export & Management
- **History System**: Save versions locally to revisit and reload previous projects.
- **Bulk Export**: Download all generated images or videos as a single **ZIP archive**.
- **Script Copy**: One-click copy for the entire storyboard text (Time, Script, Visuals).

---

## 🛠 Tech Stack

- **Frontend**: React 19 (ES6 Modules)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Engine**: Google GenAI SDK (`@google/genai`)
  - **Logic**: `gemini-3-pro-preview`
  - **Images**: `gemini-3-pro-image-preview`
  - **Video**: `veo-3.1-fast-generate-preview`
- **Utilities**: JSZip for asset bundling.

---

## 🚀 Getting Started

### Prerequisites
1. A valid **Google Gemini API Key**.
2. For high-quality image and video generation, ensure your API key is associated with a **Paid Google Cloud Project** (billing enabled).

### Usage Instructions
1. **API Key**: Click the **"SELECT API KEY"** button in the header to authenticate.
2. **Source**: Choose **FILE** (upload photo/video) or **PROMPT** (enter text).
3. **Configure**: 
   - Set the **Location & Vibe**.
   - Define **Character counts** and descriptions.
   - Select **Quality settings** and **Transition effects**.
4. **Generate**: Click **"Generate Storyboard"** to let the AI build your plan.
5. **Assets**: Once the plan is ready, click **"Gen All Images"** or individual **"Gen Image"** buttons in the table. You can further upgrade images to **Video** clips.
6. **Preview**: Use the top player to watch your cinematic storyboard come to life.

---

## ⚠️ Important Notes

- **Quota Usage**: Generating 4K images and 1080p videos consumes a significant amount of API tokens. Use 1K/720p for rapid prototyping.
- **Regional Focus**: The system is pre-configured to prioritize Vietnamese cultural aesthetics and beauty standards as requested.
- **Exporting**: ZIP downloads require the assets to be fully generated and cached in the browser.

---

## 🔗 Links

- **Main Engine**: [fcalgobot.com](https://fcalgobot.com)
- **Powered by**: [8a5.com](https://8a5.com)
- **AI Studio App**: [VideoSceneFlow on AI Studio](https://ai.studio/apps/drive/1DtdtmnDh_jZtRjxMtK-pw_I_Fiwh-5E2?fullscreenApplet=true)

Developed with ❤️ by Senior Frontend Engineering Team.
