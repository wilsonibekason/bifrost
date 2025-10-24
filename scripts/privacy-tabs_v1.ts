// Privacy Tab Management System with Special Tabs Support

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon: string;
  isActive: boolean;
  isSpecial: boolean;
  closable: boolean;
  contentType: "webview" | "iframe" | "html";
}

interface TabContentPanel {
  id: string;
  element: HTMLElement;
  loaded: boolean;
}

export class TabManager {
  private tabs: Tab[] = [];
  private tabBarElement: HTMLElement | null = null;
  private contentContainer: HTMLElement | null = null;
  private contentPanels: Map<string, TabContentPanel> = new Map();
  private isInitialized: boolean = false;
  private contentCache: Map<string, string> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize() {
    let retryCount = 0;
    const maxRetries = 20;

    const initializeDOM = () => {
      this.tabBarElement =
        document.querySelector("#tab-bar .flex-1") ||
        document.querySelector("#tab-bar") ||
        document.querySelector("[data-tab-container]");

      this.contentContainer =
        document.querySelector("#private-browser-content") ||
        document.querySelector("[data-content-container]");

      if (!this.tabBarElement || !this.contentContainer) {
        console.warn(
          `[BiFrost] Elements not found (attempt ${
            retryCount + 1
          }/${maxRetries})`
        );

        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(initializeDOM, 100);
          return false;
        } else {
          console.error("[BiFrost] Failed to find required elements");
          return false;
        }
      }

      // Set content container to relative positioning
      this.contentContainer.style.position = "relative";

      // Create initial tab with Private Mode content
      if (this.tabs.length === 0) {
        const initialTabId = `tab-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        const initialTab: Tab = {
          id: initialTabId,
          title: "Private Browsing",
          url: "private-mode", // Keep this as is
          favicon: "",
          isActive: true,
          isSpecial: true,
          closable: true,
          contentType: "html",
        };

        this.tabs.push(initialTab);
        this.createContentPanel(initialTab);
      }

      this.isInitialized = true;
      console.log("[BiFrost] TabManager initialized successfully");

      this.renderTabs();
      this.setupKeyboardNavigation();

      return true;
    };

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      initializeDOM();
    } else {
      document.addEventListener("DOMContentLoaded", initializeDOM);
    }
  }

  addOrActivateTab(options: {
    id?: string;
    title: string;
    url: string;
    favicon?: string;
    closable?: boolean;
    isSpecial?: boolean;
    contentType?: "webview" | "iframe" | "html";
  }): string {
    if (!this.isInitialized) {
      console.error("[BiFrost] Cannot create tab - TabManager not initialized");
      return "";
    }

    const {
      id,
      title,
      url,
      favicon,
      closable = true,
      isSpecial = false,
      contentType = "webview",
    } = options;

    const tabId =
      id || `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const existingTab = this.tabs.find((tab) => tab.id === tabId);
    if (existingTab) {
      console.log("[BiFrost] Tab exists, activating:", tabId);
      this.switchToTab(tabId);
      return tabId;
    }

    const newTab: Tab = {
      id: tabId,
      title: this.sanitizeTitle(title),
      url,
      favicon: favicon || (isSpecial ? "" : this.getFaviconUrl(url)),
      isActive: false,
      isSpecial,
      closable,
      contentType,
    };

    this.tabs.push(newTab);
    this.createContentPanel(newTab);
    this.switchToTab(tabId);
    this.renderTabs();

    console.log("[BiFrost] Created new tab:", tabId);
    return tabId;
  }

  openHistory(): string {
    return this.addOrActivateTab({
      id: "tab-history",
      title: "History",
      url: "history",
      closable: true,
      isSpecial: true,
      contentType: "html",
    });
  }

  openSettings(): string {
    return this.addOrActivateTab({
      id: "tab-settings",
      title: "Settings",
      url: "settings",
      closable: true,
      isSpecial: true,
      contentType: "html",
    });
  }

  openTabGroups(): string {
    return this.addOrActivateTab({
      id: "tab-groups",
      title: "Tab Groups",
      url: "tabgroups",
      closable: true,
      isSpecial: true,
      contentType: "html",
    });
  }

  private createContentPanel(tab: Tab) {
    if (!this.contentContainer) return;

    const panelId = `panel-${tab.id}`;
    let panel = document.getElementById(panelId);

    if (!panel) {
      panel = document.createElement("div");
      panel.id = panelId;
      panel.className = "absolute inset-0 overflow-auto";
      panel.style.display = "none";
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);

      this.contentContainer.appendChild(panel);

      this.contentPanels.set(tab.id, {
        id: panelId,
        element: panel,
        loaded: false,
      });
    }
  }

  private async loadPanelContent(tab: Tab) {
    const contentPanel = this.contentPanels.get(tab.id);
    if (!contentPanel || contentPanel.loaded) return;

    const { element } = contentPanel;

    try {
      if (tab.contentType === "html" && tab.isSpecial) {
        // FIX: Check for "private-mode" instead of "bifrost://private"
        if (tab.url === "private-mode") {
          element.innerHTML = this.getPrivateModeHTML();
          contentPanel.loaded = true;
          console.log("[BiFrost] Loaded Private Mode content for tab:", tab.id);
          return;
        }

        if (tab.url === "history") {
          const historyContent = await this.loadExternalHTML(
            "../components/tabs/history/history.html"
          );
          element.innerHTML = historyContent;
          this.executeScripts(element);
        } else if (tab.url === "settings") {
          const settingsContent = await this.loadExternalHTML(
            "../components/tabs/settings/settings.html"
          );
          element.innerHTML = settingsContent;
          this.executeScripts(element);
        } else if (tab.url === "tabgroups") {
          const tabGroupsContent = await this.loadExternalHTML(
            "../components/tabs/tabGroups/tabGroups.html"
          );
          element.innerHTML = tabGroupsContent;

          // Initialize TabGroups after DOM is ready
          setTimeout(() => {
            if (typeof (window as any).initializeTabGroups === "function") {
              (window as any).initializeTabGroups();
            }
          }, 100);
          this.executeScripts(element);
        }
      } else if (tab.contentType === "iframe") {
        element.innerHTML = `
          <iframe 
            src="${tab.url}" 
            class="w-full h-full border-0"
            title="${tab.title}"
            sandbox="allow-scripts allow-same-origin allow-forms"
          ></iframe>
        `;
      } else {
        // Default webview behavior for about:blank and new tabs
        element.innerHTML = `
          <div class="flex items-center justify-center h-full text-zinc-400">
            <div class="text-center">
              <div class="text-6xl mb-4">🌐</div>
              <div class="text-lg">${tab.title}</div>
              <div class="text-sm mt-2">${tab.url}</div>
            </div>
          </div>
        `;
      }

      contentPanel.loaded = true;
      console.log("[BiFrost] Loaded content for tab:", tab.id);
    } catch (error) {
      console.error("[BiFrost] Error loading content:", error);
      element.innerHTML = `
        <div class="flex items-center justify-center h-full text-red-400">
          <div class="text-center">
            <div class="text-6xl mb-4">⚠️</div>
            <div class="text-lg">Failed to load content</div>
            <div class="text-sm mt-2">${tab.url}</div>
          </div>
        </div>
      `;
    }
  }

  private getPrivateModeHTML(): string {
    return `
      <div class="w-full h-full flex items-center justify-center bg-zinc-200 relative">
        <!-- Main Content Container -->
        <div class="flex flex-col items-center justify-center px-4 max-w-2xl mx-auto text-center">
          <!-- Icon Container -->
          <div class="mb-8">
            <svg width="66" height="66" viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg" class="mx-auto">
              <rect width="66" height="66" rx="33" fill="#212529"/>
              <path d="M43.998 31.1667C41.498 31.1667 39.832 31.9999 39.0986 34.8333M21.998 31.1667C24.498 31.1667 26.1646 31.9999 26.898 34.8333M18.3313 22C17.4471 22 16.5992 22.3863 15.9741 23.0739C15.349 23.7616 14.998 24.6942 14.998 25.6667V33C14.998 35.4754 15.9813 37.8493 17.7317 39.6016C19.4821 41.3539 21.8541 42.3333 24.3313 42.3333C27.6189 42.4928 30.7573 43.9886 32.998 46.6333C35.2388 43.9886 38.3772 42.4928 41.6647 42.3333C44.142 42.3333 46.514 41.3539 48.2644 39.6016C50.0147 37.8493 50.998 35.4754 50.998 33V25.6667C50.998 24.6942 50.647 23.7616 50.0219 23.0739C49.3968 22.3863 48.5489 22 47.6647 22H42.3313C38.3772 22.126 34.5722 23.6217 31.498 26.3333C28.4237 23.6217 24.6187 22.126 20.6647 22H18.3313Z" stroke="#F1F3F5" stroke-width="3.66667" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <!-- Title -->
          <h1 class="text-zinc-900 text-2xl font-semibold mb-6">
            You are now in Private Mode.
          </h1>

          <!-- Description -->
          <p class="text-zinc-900 text-base leading-relaxed max-w-md">
            Browse with more privacy. Websites may still collect data, but once you close this window, Bifrost won't save your browsing history, search records, or site data, helping you keep your activity private.
          </p>
        </div>

        <!-- Floating Button - Bottom Right -->
        <div class="fixed bottom-8 right-8">
          <button class="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center shadow-lg transition-colors duration-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#60A5FA" stroke="#60A5FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  private executeScripts(container: HTMLElement) {
    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }

  private async loadExternalHTML(filePath: string): Promise<string> {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error("[BiFrost] Error loading external HTML:", error);
      throw error;
    }
  }

  createTab(url = "about:blank", title = "New Tab"): string {
    return this.addOrActivateTab({
      title,
      url,
      closable: true,
      isSpecial: false,
      contentType: "webview",
    });
  }

  closeTab(tabId: string) {
    const tabIndex = this.tabs.findIndex((tab) => tab.id === tabId);
    if (tabIndex === -1) return;

    const wasActive = this.tabs[tabIndex].isActive;
    const contentPanel = this.contentPanels.get(tabId);

    if (contentPanel) {
      contentPanel.element.remove();
      this.contentPanels.delete(tabId);
    }

    this.tabs.splice(tabIndex, 1);

    if (wasActive && this.tabs.length > 0) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      this.switchToTab(this.tabs[newActiveIndex].id);
    } else if (this.tabs.length === 0) {
      this.createTab("about:blank", "New Tab");
    } else {
      this.renderTabs();
    }

    console.log("[BiFrost] Closed tab:", tabId);
  }

  switchToTab(tabId: string) {
    this.tabs.forEach((tab) => {
      tab.isActive = tab.id === tabId;
      const contentPanel = this.contentPanels.get(tab.id);

      if (contentPanel) {
        if (tab.isActive) {
          if (!contentPanel.loaded) {
            this.loadPanelContent(tab);
          }
          contentPanel.element.style.display = "block";
        } else {
          contentPanel.element.style.display = "none";
        }
      }
    });

    this.renderTabs();
    console.log("[BiFrost] Switched to tab:", tabId);
  }

  private renderTabs() {
    if (!this.tabBarElement || !this.isInitialized) return;

    const fragment = document.createDocumentFragment();

    // Calculate dynamic tab width
    const tabWidth = this.calculateTabWidth();

    this.tabs.forEach((tab) => {
      const tabElement = this.createTabElement(tab, tabWidth);
      fragment.appendChild(tabElement);
    });

    this.tabBarElement.innerHTML = "";
    this.tabBarElement.appendChild(fragment);
  }

  private calculateTabWidth(): number {
    if (!this.tabBarElement) return 240;

    // Get the parent container (tab-bar)
    const tabBar = this.tabBarElement.parentElement;
    if (!tabBar) return 240;

    // Calculate available width (account for actions buttons ~100px and padding)
    const availableWidth = tabBar.clientWidth - 120; // Reserve space for action buttons
    const tabCount = this.tabs.length;

    // Define max and min widths
    const MAX_TAB_WIDTH = 240;
    const MIN_TAB_WIDTH = 100;

    // Calculate ideal width per tab
    let tabWidth = availableWidth / tabCount;

    // Clamp between min and max
    tabWidth = Math.max(MIN_TAB_WIDTH, Math.min(MAX_TAB_WIDTH, tabWidth));

    return tabWidth;
  }

  private calculateTabWidth_DONOT_REMOVE(): number {
    if (!this.tabBarElement) return 240;

    // Get the parent container (tab-bar)
    const tabBar = this.tabBarElement.parentElement;
    if (!tabBar) return 240;

    // Calculate available width (account for window controls ~120px, actions buttons ~100px and padding)
    const availableWidth = tabBar.clientWidth - 220; // Reserve space for both window controls and action buttons
    const tabCount = this.tabs.length;

    // Define max and min widths
    const MAX_TAB_WIDTH = 240;
    const MIN_TAB_WIDTH = 100;

    // Calculate ideal width per tab
    let tabWidth = availableWidth / tabCount;

    // Clamp between min and max
    tabWidth = Math.max(MIN_TAB_WIDTH, Math.min(MAX_TAB_WIDTH, tabWidth));

    return tabWidth;
  }

  private createTabElement(tab: Tab, width: number): HTMLElement {
    const tabDiv = document.createElement("div");
    tabDiv.className = `flex items-center gap-2 px-4 py-2.5 transition cursor-pointer group relative ${
      tab.isActive
        ? "bg-zinc-800 text-white"
        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-700/80"
    }`;
    // Updated: Dynamic width with flex-shrink-0 to prevent unwanted compression
    tabDiv.style.cssText = `width: ${width}px; height: 52px; border-radius: 8px 8px 0 0; flex-shrink: 0;`;
    tabDiv.setAttribute("role", "tab");
    tabDiv.setAttribute("aria-selected", tab.isActive.toString());
    tabDiv.setAttribute("data-tab-id", tab.id);

    // Add click handler
    tabDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      this.switchToTab(tab.id);
    });

    // Icon/Favicon
    const iconSpan = document.createElement("span");
    iconSpan.className = "flex-shrink-0";
    if (tab.isSpecial) {
      iconSpan.innerHTML = this.getSpecialTabIcon(tab.id, tab.url);
    } else {
      const img = document.createElement("img");
      img.src = tab.favicon || this.getDefaultFavicon(tab.url);
      img.className = "w-4 h-4";
      img.onerror = () => {
        img.src =
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>';
      };
      iconSpan.appendChild(img);
    }
    tabDiv.appendChild(iconSpan);

    // Title
    const titleSpan = document.createElement("span");
    titleSpan.className = "text-sm truncate flex-1 font-medium";
    titleSpan.textContent = tab.title;
    tabDiv.appendChild(titleSpan);

    // Close button
    if (tab.closable) {
      const closeBtn = document.createElement("button");
      closeBtn.className =
        "opacity-0 group-hover:opacity-100 hover:bg-zinc-600 rounded p-1 transition flex-shrink-0";
      closeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeTab(tab.id);
      });
      tabDiv.appendChild(closeBtn);
    }

    return tabDiv;
  }

  private getSpecialTabIcon(tabId: string, url: string): string {
    // FIX: Check for "private-mode" instead of "bifrost://private"
    if (url === "private-mode") {
      return `<svg class="w-4 h-4 text-zinc-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="16" rx="8" fill="#212529"/>
        <path d="M10.6663 7.41663C10.1663 7.41663 9.83301 7.58329 9.66634 8.41663M5.33301 7.41663C5.83301 7.41663 6.16634 7.58329 6.33301 8.41663M4.33301 5.33329C4.14512 5.33329 3.96479 5.40805 3.83352 5.53932C3.70226 5.67058 3.62749 5.85091 3.62749 6.03879V7.99996C3.62749 8.68693 3.90063 9.34585 4.38822 9.83344C4.87581 10.321 5.53473 10.5941 6.22169 10.5941C7.04574 10.6309 7.83715 10.9275 8.47469 11.4416C9.11224 10.9275 9.90365 10.6309 10.7277 10.5941C11.4147 10.5941 12.0736 10.321 12.5612 9.83344C13.0488 9.34585 13.3219 8.68693 13.3219 7.99996V6.03879C13.3219 5.85091 13.2471 5.67058 13.1159 5.53932C12.9846 5.40805 12.8043 5.33329 12.6164 5.33329H10.7277C9.90365 5.36998 9.11224 5.66656 8.47469 6.18063C7.83715 5.66656 7.04574 5.36998 6.22169 5.33329H4.33301Z" stroke="#F1F3F5" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }

    const icons: Record<string, string> = {
      "tab-history": `<svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      "tab-settings": `<svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
    };
    return icons[tabId] || "";
  }

  private setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + Tab
      if ((e.ctrlKey || e.metaKey) && e.key === "Tab") {
        e.preventDefault();
        const currentIndex = this.tabs.findIndex((tab) => tab.isActive);
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + this.tabs.length) % this.tabs.length
          : (currentIndex + 1) % this.tabs.length;
        this.switchToTab(this.tabs[nextIndex].id);
      }

      // Ctrl/Cmd + W
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        const activeTab = this.getActiveTab();
        if (activeTab && activeTab.closable) {
          this.closeTab(activeTab.id);
        }
      }

      // Ctrl/Cmd + T
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        this.createTab();
      }
    });
  }

  private getFaviconUrl(url: string): string {
    if (url === "about:blank" || !url) return "";
    try {
      const urlObj = new URL(url);
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
    const div = document.createElement("div");
    div.textContent = title;
    return div.innerHTML || "New Tab";
  }

  updateTabTitle(tabId: string, title: string) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.title = this.sanitizeTitle(title);
      this.renderTabs();
    }
  }

  updateTabUrl(tabId: string, url: string) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.url = url;
      if (!tab.isSpecial) {
        tab.favicon = this.getFaviconUrl(url);
      }
      this.renderTabs();
    }
  }

  getActiveTab(): Tab | null {
    return this.tabs.find((tab) => tab.isActive) || null;
  }

  getAllTabs(): Tab[] {
    return [...this.tabs];
  }

  getTabCount(): number {
    return this.tabs.length;
  }
}

// Initialize TabManager
let tabManager: TabManager | null = null;

const initializeTabManager = () => {
  if (!tabManager) {
    tabManager = new TabManager();
    (window as any).tabManager = tabManager;
    console.log("[BiFrost] TabManager exposed to window");
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeTabManager);
} else {
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

(window as any).openHistory = () => {
  if (tabManager) {
    return tabManager.openHistory();
  } else {
    console.error("[BiFrost] TabManager not initialized");
  }
};

(window as any).openSettings = () => {
  if (tabManager) {
    return tabManager.openSettings();
  } else {
    console.error("[BiFrost] TabManager not initialized");
  }
};

(window as any).openTabGroups = () => {
  if (tabManager) {
    return tabManager.openTabGroups();
  } else {
    console.error("[BiFrost] TabManager not initialized");
  }
};

(window as any).TabManager = TabManager;
