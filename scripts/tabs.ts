// Tab Management System

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon: string;
  isActive: boolean;
}

export class TabManager {
  private tabs: Tab[] = [];
  // private activeTabId: string | null = null;
  private tabBarElement: HTMLElement | null = null;

  constructor() {
    this.tabBarElement = document.querySelector("#tab-bar .flex-1");
    this.initialize();
  }

  private initialize() {
    this.createTab("about:blank", "New Tab");
    console.log("[v0] TabManager initialized with default tab");
  }

  createTab(url = "about:blank", title = "New Tab"): string {
    const tabId = `tab-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newTab: Tab = {
      id: tabId,
      title,
      url,
      favicon: this.getFaviconUrl(url),
      isActive: false,
    };

    this.tabs.push(newTab);
    this.switchToTab(tabId);
    this.renderTabs();

    console.log("[v0] Created new tab:", tabId);
    return tabId;
  }

  closeTab(tabId: string) {
    const tabIndex = this.tabs.findIndex((tab) => tab.id === tabId);
    if (tabIndex === -1) return;

    const wasActive = this.tabs[tabIndex].isActive;
    this.tabs.splice(tabIndex, 1);

    // If we closed the active tab, activate another one
    if (wasActive && this.tabs.length > 0) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      this.switchToTab(this.tabs[newActiveIndex].id);
    } else if (this.tabs.length === 0) {
      this.createTab("about:blank", "New Tab");
    }

    this.renderTabs();
    console.log("[v0] Closed tab:", tabId);
  }

  switchToTab(tabId: string) {
    this.tabs.forEach((tab) => {
      tab.isActive = tab.id === tabId;
    });
    // this.activeTabId = tabId;
    this.renderTabs();
    console.log("[v0] Switched to tab:", tabId);
  }

  private renderTabs() {
    if (!this.tabBarElement) return;

    this.tabBarElement.innerHTML = this.tabs
      .map(
        (tab) => `
        <div
          class="flex items-center space-x-2 px-3 py-1.5 rounded-t ${
            tab.isActive
              ? "bg-zinc-800 text-white"
              : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
          } transition cursor-pointer min-w-[120px] max-w-[200px] group"
          onclick="window.tabManager.switchToTab('${tab.id}')"
        >
          <img
            src="${tab.favicon || "/placeholder.svg?height=16&width=16"}"
            alt=""
            class="w-4 h-4"
            onerror="this.src='/placeholder.svg?height=16&width=16'"
          />
          <span class="text-xs truncate flex-1">${tab.title}</span>
          <button
            onclick="event.stopPropagation(); window.tabManager.closeTab('${
              tab.id
            }')"
            class="opacity-0 group-hover:opacity-100 hover:bg-zinc-600 rounded p-0.5 transition"
          >
            <svg
              class="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      `
      )
      .join("");
  }

  private getFaviconUrl(url: string): string {
    if (url === "about:blank") return "";
    try {
      const urlObj = new URL(url);
      return `${urlObj.origin}/favicon.ico`;
    } catch {
      return "";
    }
  }

  updateTabTitle(tabId: string, title: string) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.title = title;
      this.renderTabs();
    }
  }

  updateTabUrl(tabId: string, url: string) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.url = url;
      tab.favicon = this.getFaviconUrl(url);
      this.renderTabs();
    }
  }
}

// Initialize TabManager and expose to window
let tabManager: TabManager | null = null;

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    tabManager = new TabManager();
    window.tabManager = tabManager;
  });
} else {
  // DOM is already ready
  setTimeout(() => {
    tabManager = new TabManager();
    window.tabManager = tabManager;
  }, 100);
}

// Export createNewTab function for the new tab button
window.createNewTab = () => {
  if (tabManager) {
    tabManager.createTab();
  } else {
    console.error("[v0] TabManager not initialized yet");
  }
};
