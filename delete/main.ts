import "./tabs.js";
import "./search.js";
import "./utils.js";
// import { TabManager } from "./tabs.js";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __TAURI__?: {
      core: {
        invoke: (cmd: string, args?: any) => Promise<any>;
      };
    };
    atlasState: {
      tabs: any[];
      activeTabId: string | null;
      bookmarks: any[];
      history: any[];
      downloads: any[];
      notes: any[];
      tasks: any[];
    };
    showPanel: (panelName: string) => void;
    hidePanel: () => void;
    // tabManager?: TabManager;
    searchAutocomplete?: any;
    addToHistory?: (url: string, title: string) => void;
  }
}

const { invoke } = window.__TAURI__?.core || { invoke: async () => {} };

// Load toolbar component
async function loadComponent(elementId: string, componentPath: string) {
  try {
    const response = await fetch(componentPath);
    const html = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    }
  } catch (error) {
    console.error(`Error loading component ${componentPath}:`, error);
  }
}

// Initialize toolbar
async function initializeToolbar() {
  await loadComponent("toolbar-container", "./components/toolbar.html");

  // Initialize Tauri commands
  await invoke("create_window").catch(console.error);
}

// Global state management
window.atlasState = {
  tabs: [],
  activeTabId: null,
  bookmarks: [],
  history: [],
  downloads: [],
  notes: [],
  tasks: [],
};

// Panel management
window.showPanel = (panelName: string) => {
  const panelsContainer = document.getElementById("overlay-panels");
  if (!panelsContainer) return;

  panelsContainer.classList.remove("pointer-events-none");

  loadComponent("overlay-panels", `./components/${panelName}-panel.html`).then(
    () => {
      const panel = panelsContainer.querySelector(".panel");
      if (panel) {
        panel.classList.add("panel-slide-enter");
      }
    }
  );
};

window.hidePanel = () => {
  const panelsContainer = document.getElementById("overlay-panels");
  if (!panelsContainer) return;

  panelsContainer.innerHTML = "";
  panelsContainer.classList.add("pointer-events-none");
};

// Add to history helper
window.addToHistory = (url: string, title: string) => {
  window.atlasState.history.unshift({
    url,
    title,
    favicon: getFaviconUrl(url),
    timestamp: new Date().toISOString(),
  });

  // Keep only last 100 items
  if (window.atlasState.history.length > 100) {
    window.atlasState.history = window.atlasState.history.slice(0, 100);
  }
};

function getFaviconUrl(url: string): string {
  if (url === "about:blank") return "";
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
  initializeToolbar();
});
