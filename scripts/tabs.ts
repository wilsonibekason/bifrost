// Tab Management System with Special Tabs Support

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
      this.tabBarElement = document.querySelector("#public-tabs-container");

      this.contentContainer =
        document.querySelector("#browser-content") ||
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

      // Create initial tab
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
          isSpecial: false,
          closable: true,
          contentType: "webview",
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

  private initialize_del() {
    let retryCount = 0;
    const maxRetries = 20;

    const initializeDOM = () => {
      this.tabBarElement =
        document.querySelector("#tab-bar .flex-1") ||
        document.querySelector("#tab-bar") ||
        document.querySelector("[data-tab-container]");

      this.contentContainer =
        document.querySelector("#browser-content") ||
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

      // Create initial tab
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
          isSpecial: false,
          closable: true,
          contentType: "webview",
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

  private async loadPanelContent_del(tab: Tab) {
    const contentPanel = this.contentPanels.get(tab.id);
    if (!contentPanel || contentPanel.loaded) return;

    const { element } = contentPanel;

    try {
      if (tab.contentType === "html" && tab.isSpecial) {
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
          // ✅ FIXED
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
        // Default webview behavior
        element.innerHTML = `
          <div class="flex items-center justify-center h-full text-zinc-400">
            <div class="text-center">
              <div class="text-6xl mb-4">🌐</div>
              <div class="text-6xl mb-4">jejjff</div>
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

  private async loadPanelContent(tab: Tab) {
    const contentPanel = this.contentPanels.get(tab.id);
    if (!contentPanel || contentPanel.loaded) return;

    const { element } = contentPanel;

    try {
      if (tab.contentType === "html" && tab.isSpecial) {
        // Load special tabs (History, Settings, Tab Groups)
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
        // Load iframe content
        element.innerHTML = `
        <iframe 
          src="${tab.url}" 
          class="w-full h-full border-0"
          title="${tab.title}"
          sandbox="allow-scripts allow-same-origin allow-forms"
        ></iframe>
      `;
      } else if (tab.url === "about:blank" || !tab.url || tab.url === "") {
        // Load default window view for new tabs
        const defaultWindowContent = await this.loadExternalHTML(
          "../components/tabs/default-window/default-window.html"
        );
        element.innerHTML = defaultWindowContent;

        // Load and execute the default-window TypeScript logic
        // const scriptTag = document.createElement("script");
        // scriptTag.src = "../components/tabs/default-window/default-window.js";
        // scriptTag.type = "module";
        // element.appendChild(scriptTag);

        // this.executeScripts(element);

        console.log("[BiFrost] Loaded default window view for tab:", tab.id);
      } else {
        // Regular webview behavior for actual URLs
        element.innerHTML = `
        <div class="flex items-center justify-center h-full text-zinc-400">
          <div class="text-center">
            <div class="text-6xl mb-4">🌐</div>
            <div class="text-lg">${tab.title}</div>
            <div class="text-sm mt-2">${tab.url}</div>
            <div class="text-xs mt-4 text-zinc-500">
              Web content loading will be implemented with Tauri WebView
            </div>
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
          <div class="text-xs mt-4">${
            error instanceof Error ? error.message : "Unknown error"
          }</div>
        </div>
      </div>
    `;
    }
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

  // <CHANGE> Add new method to load external HTML files
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

    // Calculate width of fixed elements
    const windowControlsWidth = 120; // Window controls on left
    const actionsWidth = 120; // Action buttons on right
    const padding = 20; // Extra padding/margins

    const availableWidth =
      tabBar.clientWidth - windowControlsWidth - actionsWidth - padding;
    const tabCount = this.tabs.length;

    // Define max and min widths
    const MAX_TAB_WIDTH = 240;
    const MIN_TAB_WIDTH = 5; // Reduced from 100 to allow more tabs

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
      iconSpan.innerHTML = this.getSpecialTabIcon(tab.id);
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

  private createTabElement_delete(tab: Tab): HTMLElement {
    const tabDiv = document.createElement("div");
    tabDiv.className = `flex items-center gap-2 px-4 py-2.5 transition cursor-pointer group relative ${
      tab.isActive
        ? "bg-zinc-800 text-white"
        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-700/80"
    }`;
    tabDiv.style.cssText =
      "width: 240px; height: 52px; border-radius: 8px 8px 0 0;";
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
      iconSpan.innerHTML = this.getSpecialTabIcon(tab.id);
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

  private getSpecialTabIcon(tabId: string): string {
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

  private getDefaultFavicon_del(url: string): string {
    if (url === "about:blank") {
      return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23444"/><text x="8" y="12" font-size="10" text-anchor="middle" fill="%23fff">📄</text></svg>';
    }
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>';
  }
  private getDefaultFavicon(url: string): string {
    const svgData =
      'data:image/svg+xml,<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.16319 1.62685C8.19423 1.56414 8.24218 1.51135 8.30163 1.47444C8.36109 1.43753 8.42967 1.41797 8.49965 1.41797C8.56962 1.41797 8.63821 1.43753 8.69766 1.47444C8.75711 1.51135 8.80506 1.56414 8.83611 1.62685L10.4724 4.94114C10.5801 5.15929 10.7393 5.34802 10.936 5.49113C11.1328 5.63425 11.3614 5.72747 11.6021 5.76281L15.2614 6.29831C15.3307 6.30836 15.3959 6.3376 15.4495 6.38274C15.503 6.42788 15.5429 6.48712 15.5646 6.55374C15.5862 6.62036 15.5888 6.69172 15.5721 6.75974C15.5553 6.82777 15.5198 6.88973 15.4696 6.93864L12.8233 9.51556C12.6488 9.68563 12.5182 9.89557 12.4428 10.1273C12.3674 10.359 12.3495 10.6056 12.3905 10.8458L13.0153 14.4866C13.0275 14.5559 13.02 14.6273 12.9937 14.6925C12.9673 14.7578 12.9231 14.8143 12.8662 14.8557C12.8093 14.897 12.7418 14.9216 12.6716 14.9264C12.6014 14.9313 12.5313 14.9164 12.4691 14.8833L9.19806 13.1635C8.98253 13.0503 8.74273 12.9912 8.49929 12.9912C8.25585 12.9912 8.01606 13.0503 7.80052 13.1635L4.53015 14.8833C4.46805 14.9162 4.39797 14.931 4.32788 14.926C4.2578 14.921 4.19051 14.8965 4.13369 14.8551C4.07686 14.8138 4.03278 14.7574 4.00645 14.6922C3.98011 14.6271 3.97259 14.5559 3.98473 14.4866L4.60877 10.8465C4.64999 10.6062 4.63214 10.3595 4.55674 10.1276C4.48134 9.89572 4.35066 9.68567 4.17598 9.51556L1.52965 6.93935C1.47907 6.8905 1.44323 6.82842 1.4262 6.7602C1.40918 6.69197 1.41167 6.62033 1.43337 6.55345C1.45507 6.48656 1.49513 6.42711 1.54897 6.38188C1.60281 6.33665 1.66827 6.30745 1.7379 6.2976L5.39644 5.76281C5.63745 5.72775 5.86634 5.63464 6.06339 5.49151C6.26045 5.34838 6.41977 5.1595 6.52765 4.94114L8.16319 1.62685Z" stroke="%23212529" stroke-width="1.20417" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    if (url === "about:blank") {
      return svgData;
    }

    return svgData;
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
