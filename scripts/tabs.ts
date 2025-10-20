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
  private tabBarElement: HTMLElement | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    let retryCount = 0;
    const maxRetries = 20; // Try for up to 2 seconds

    // Wait for DOM to be fully ready
    const initializeDOM = () => {
      // Try multiple selectors
      this.tabBarElement =
        document.querySelector("#tab-bar .flex-1") ||
        document.querySelector("#tab-bar") ||
        document.querySelector("[data-tab-container]") ||
        document.querySelector(".tab-container");

      if (!this.tabBarElement) {
        console.warn(
          `[BiFrost] Tab bar element not found (attempt ${
            retryCount + 1
          }/${maxRetries})`
        );
        console.warn(
          "[BiFrost] Tried selectors: #tab-bar .flex-1, #tab-bar, [data-tab-container], .tab-container"
        );

        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(initializeDOM, 100);
          return false;
        } else {
          console.error(
            "[BiFrost] Failed to find tab bar element after multiple attempts"
          );
          console.error(
            "[BiFrost] Please ensure your HTML has an element with id='tab-bar' or add data-tab-container attribute"
          );
          return false;
        }
      }

      // Create initial tab only if no tabs exist
      if (this.tabs.length === 0) {
        const initialTabId = `tab-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        const initialTab: Tab = {
          id: initialTabId,
          title: "New Tab",
          url: "about:blank",
          favicon: this.getDefaultFavicon("about:blank"),
          isActive: true,
        };

        this.tabs.push(initialTab);
      }

      this.isInitialized = true;
      console.log(
        "[BiFrost] TabManager initialized successfully with element:",
        this.tabBarElement
      );

      // Initial render
      this.renderTabs();

      return true;
    };

    // Try to initialize immediately if DOM is ready
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      initializeDOM();
    } else {
      // Wait for DOM to be ready
      document.addEventListener("DOMContentLoaded", initializeDOM);
    }
  }

  createTab(
    url = "about:blank",
    title = "New Tab",
    skipRender = false
  ): string {
    const tabId = `tab-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newTab: Tab = {
      id: tabId,
      title: this.sanitizeTitle(title),
      url,
      favicon: this.getFaviconUrl(url),
      isActive: false,
    };

    this.tabs.push(newTab);
    this.switchToTab(tabId, skipRender);

    if (!skipRender) {
      this.renderTabs();
    }

    console.log("[BiFrost] Created new tab:", tabId);
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
      // Create new tab if all tabs are closed
      this.createTab("about:blank", "New Tab");
    } else {
      this.renderTabs();
    }

    console.log("[BiFrost] Closed tab:", tabId);
  }

  switchToTab(tabId: string, skipRender = false) {
    let tabFound = false;

    this.tabs.forEach((tab) => {
      const wasActive = tab.isActive;
      tab.isActive = tab.id === tabId;

      if (tab.isActive) {
        tabFound = true;
      }

      // Only render if state actually changed
      if (wasActive !== tab.isActive && !skipRender) {
        this.renderTabs();
      }
    });

    if (!tabFound) {
      console.warn("[BiFrost] Tab not found:", tabId);
    } else if (!skipRender) {
      this.renderTabs();
    }

    console.log("[BiFrost] Switched to tab:", tabId);
  }

  private renderTabs() {
    if (!this.tabBarElement || !this.isInitialized) {
      console.warn("[BiFrost] Cannot render tabs - element not ready");
      return;
    }

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    const tempContainer = document.createElement("div");

    tempContainer.innerHTML = this.tabs
      .map((tab) => this.createTabHTML(tab))
      .join("");

    // Move children to fragment
    while (tempContainer.firstChild) {
      fragment.appendChild(tempContainer.firstChild);
    }

    // Clear and update in one operation
    this.tabBarElement.innerHTML = "";
    this.tabBarElement.appendChild(fragment);
  }

  private createTabHTML(tab: Tab): string {
    const isActive = tab.isActive;
    const favicon = tab.favicon || this.getDefaultFavicon(tab.url);

    return `
      <div
        class="flex items-center gap-2 px-4 py-2.5 transition cursor-pointer group relative ${
          isActive
            ? "bg-zinc-800 text-white"
            : "bg-zinc-700 text-zinc-300 hover:bg-zinc-700/80"
        }"
        style="width: 240px; height: 52px; border-radius: 8px 8px 0 0;"
        onclick="window.tabManager.switchToTab('${tab.id}')"
        data-tab-id="${tab.id}"
      >
        <!-- Favicon -->
       <!-- <img
          src="${favicon}"
          alt=""
          class="w-4 h-4 flex-shrink-0"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><rect width=%2216%22 height=%2216%22 fill=%22%23666%22/></svg>'"
        /> -->

        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.6663 1.66797V5.0013C11.6663 5.44333 11.8419 5.86725 12.1545 6.17981C12.4671 6.49237 12.891 6.66797 13.333 6.66797H16.6663M12.4997 1.66797H4.99967C4.55765 1.66797 4.13372 1.84356 3.82116 2.15612C3.5086 2.46868 3.33301 2.89261 3.33301 3.33464V16.668C3.33301 17.11 3.5086 17.5339 3.82116 17.8465C4.13372 18.159 4.55765 18.3346 4.99967 18.3346H14.9997C15.4417 18.3346 15.8656 18.159 16.1782 17.8465C16.4907 17.5339 16.6663 17.11 16.6663 16.668V5.83464L12.4997 1.66797Z" stroke="#868E96" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

         
        <!-- Title -->
        <span class="text-sm truncate flex-1 font-medium">${tab.title}</span>
        
        <!-- Close Button -->
        <button
          onclick="event.stopPropagation(); window.tabManager.closeTab('${
            tab.id
          }')"
          class="opacity-0 group-hover:opacity-100 hover:bg-zinc-600 rounded p-1 transition flex-shrink-0"
          title="Close tab"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L5 15M5 5L15 15" stroke="#868E96" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

          <svg
            class="w-3.5 h-3.5 hidden"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    `;
  }

  private getFaviconUrl(url: string): string {
    if (url === "about:blank" || !url) return "";

    try {
      const urlObj = new URL(url);
      // Use Google's favicon service as fallback
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return "";
    }
  }

  private getDefaultFavicon(url: string): string {
    if (url === "about:blank") {
      return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23444"/><text x="8" y="12" font-size="10" text-anchor="middle" fill="%23fff">📄</text></svg>';
    }
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>';
  }

  private sanitizeTitle(title: string): string {
    // Escape HTML to prevent XSS
    const div = document.createElement("div");
    div.textContent = title;
    return div.innerHTML || "New Tab";
  }

  updateTabTitle(tabId: string, title: string) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.title = this.sanitizeTitle(title);
      this.renderTabs();
      console.log("[BiFrost] Updated tab title:", tabId, title);
    }
  }

  updateTabUrl(tabId: string, url: string) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.url = url;
      tab.favicon = this.getFaviconUrl(url);
      this.renderTabs();
      console.log("[BiFrost] Updated tab URL:", tabId, url);
    }
  }

  getActiveTab(): Tab | null {
    return this.tabs.find((tab) => tab.isActive) || null;
  }

  getAllTabs(): Tab[] {
    return [...this.tabs]; // Return a copy to prevent external mutations
  }

  getTabCount(): number {
    return this.tabs.length;
  }
}

// Initialize TabManager and expose to window
let tabManager: TabManager | null = null;

// Ensure proper initialization
const initializeTabManager = () => {
  if (!tabManager) {
    tabManager = new TabManager();
    (window as any).tabManager = tabManager;
    console.log("[BiFrost] TabManager exposed to window");
  }
};

// Initialize based on document state
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeTabManager);
} else {
  // DOM is already ready - initialize immediately
  initializeTabManager();
}

// Export createNewTab function for the new tab button
(window as any).createNewTab = () => {
  if (tabManager) {
    (tabManager as TabManager).createTab();
  } else {
    console.error("[BiFrost] TabManager not initialized yet");
    // Try to initialize if it somehow wasn't
    initializeTabManager();
    if (tabManager) {
      (tabManager as TabManager).createTab();
    }
  }
};

// Export TabManager class for external use
(window as any).TabManager = TabManager;
