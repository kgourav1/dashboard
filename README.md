# 🚀 DevDash: Notion-Inspired Productivity Workspace

## 📝 Overview
**DevDash** is a highly polished, lightweight, and modular productivity dashboard designed specifically for developers and power users. Built entirely with vanilla web technologies—requiring absolutely zero frameworks or external libraries—it serves as a persistent, centralized hub for daily tasks, quick notes, meeting schedules, and frequently used web shortcuts. 

It heavily borrows design cues from premium tools like Notion and Raycast, featuring a sleek dark-mode aesthetic, smooth interactions, and a keyboard-first command palette.

## ✨ Core Features

* **🧩 Customizable Widget Grid:** Arrange your workspace your way. The dashboard features draggable cards using the native HTML5 Drag & Drop API. Layout positions are saved instantly.
* **📌 Floating Sticky Note System:** Spawn multiple draggable, pastel-colored sticky notes. Each note features a realistic paper-curl CSS effect, can be freely moved around the screen, and retains its exact position and text data upon page refresh.
* **✅ Advanced Task Management:** A built-in Todo system featuring priority levels (Low, Medium, High), status filtering (All, Active, Done), and instant deletion.
* **📓 Notion-Style Quick Notes:** A distraction-free `contenteditable` text area that supports basic Markdown-style shortcuts (e.g., typing `# ` converts text to an H1). Content is auto-saved as you type.
* **🔗 Smart Shortcuts Panel:** A grid of frequently visited websites. Adding a URL automatically fetches the site's favicon. Includes a hover-state UI for quick inline editing or deletion.
* **📅 Meeting Tracker:** Track upcoming meetings. It highlights events happening "Today" and automatically cleans up past events as time passes.
* **🔍 Global Command Palette:** Press `Cmd/Ctrl + K` to trigger a sleek overlay command palette. Instantly search across tasks and shortcuts, navigating the dashboard entirely via the keyboard.
* **💡 Daily Motivation:** A clean, static JSON array injects a randomized, tech-focused motivational quote at the bottom of the dashboard on every page load.

## 🛠️ Tech Stack

* **Structure:** HTML5
* **Styling:** CSS3 (Custom Variables, CSS Grid & Flexbox, Smooth Animations)
* **Logic:** Vanilla JavaScript (ES6+, IIFE Module Pattern, Event Delegation)
* **Storage:** Browser `localStorage` (No backend or database required)

## 🚀 Getting Started

### Prerequisites
None! You only need a modern web browser (Chrome, Firefox, Safari, Edge, Brave).

### Installation & Usage
1. Clone or download this repository to your local machine.
2. Ensure you have the following three files in the same directory:
   - `index.html`
   - `style.css`
   - `script.js`
3. Simply double-click `index.html` to open it in your browser. **No local server required.**

## 📁 File Structure

```text
/
├── index.html   # Main layout, system bar, modal overlays, and widget skeleton
├── style.css    # Premium dark-mode theme, grid systems, and drag/drop states
└── script.js    # Core logic, localStorage hydration, and UI renderers
