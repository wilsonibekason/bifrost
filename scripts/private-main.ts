import "./privacy-tabs.js";
import "./search.js";
import "./utils.js";
import { SettingsManager } from "./settings.ts";
import "./history.js";
// import "./tab-groups.ts";
import { initializeTabGroups } from "./tab-groups.ts";

(window as any).initializeTabGroups = initializeTabGroups;

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
      settings?: any;
    };
    showPanel: (panelName: string) => void;
    hidePanel: () => void;
    searchAutocomplete?: any;
    addToHistory?: (url: string, title: string) => void;
    openHistory?: () => void;
    openSettings?: () => void;
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
  await loadComponent("toolbar-container", "./window/toolbar.html");

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
  settings: {},
};

// Panel management (for overlay panels like old history/downloads)
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

  console.log("[Atlas] Added to history:", title);
};

function getFaviconUrl(url: string): string {
  if (url === "about:blank") return "";
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return "";
  }
}

// Add some demo history for testing
function addDemoHistory() {
  const demoSites = [
    { url: "https://github.com", title: "GitHub" },
    { url: "https://stackoverflow.com", title: "Stack Overflow" },
    { url: "https://developer.mozilla.org", title: "MDN Web Docs" },
    { url: "https://www.youtube.com", title: "YouTube" },
    { url: "https://twitter.com", title: "Twitter" },
  ];

  demoSites.forEach((site, index) => {
    setTimeout(() => {
      window.addToHistory?.(site.url, site.title);
    }, index * 100);
  });
}

function initializeSettings() {
  console.log("[Settings] Initializing settings manager");
  new SettingsManager();
}

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
  initializeToolbar();

  // Add demo history after a short delay (for testing)
  setTimeout(() => {
    addDemoHistory();
    console.log("[Atlas] Demo history added");
  }, 2000);

  // Initialize settings
  initializeSettings();

  // (window as any).initializeTabGroups = initializeTabGroups;

  // Setup keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + H for History
    if ((e.ctrlKey || e.metaKey) && e.key === "h") {
      e.preventDefault();
      window.openHistory?.();
    }

    // Ctrl/Cmd + , for Settings
    if ((e.ctrlKey || e.metaKey) && e.key === ",") {
      e.preventDefault();
      window.openSettings?.();
    }
  });

  console.log("[Atlas] Keyboard shortcuts initialized:");
  console.log("  Ctrl/Cmd + H - Open History");
  console.log("  Ctrl/Cmd + , - Open Settings");
  console.log("  Ctrl/Cmd + T - New Tab");
  console.log("  Ctrl/Cmd + W - Close Tab");
  console.log("  Ctrl/Cmd + Tab - Switch Tabs");
});
