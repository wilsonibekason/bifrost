// // Tab Management Logic
// interface Tab {
//   id: string;
//   title: string;
//   url: string;
//   favicon: string;
//   isActive: boolean;
// }

// class TabManager {
//   private tabs: Tab[] = [];
//   private activeTabId: string | null = null;
//   private tabBar: HTMLElement | null = null;

//   constructor() {
//     this.init();
//   }

//   private init() {
//     this.tabBar = document.getElementById("tab-bar");
//     this.setupEventListeners();
//     // Create initial tab
//     this.createTab("New Tab", "about:blank");
//   }

//   private setupEventListeners() {
//     // New tab button
//     const newTabBtn = document.querySelector('[title="New Tab"]');
//     newTabBtn?.addEventListener("click", () => {
//       this.createTab("New Tab", "about:blank");
//     });
//   }

//   createTab(title: string, url: string): string {
//     const tabId = `tab-${Date.now()}`;
//     const tab: Tab = {
//       id: tabId,
//       title,
//       url,
//       favicon: this.getFaviconUrl(url),
//       isActive: false,
//     };

//     this.tabs.push(tab);
//     this.renderTab(tab);
//     this.switchToTab(tabId);

//     return tabId;
//   }

//   private renderTab(tab: Tab) {
//     const tabsContainer = this.tabBar?.querySelector(
//       ".flex.items-center.space-x-1"
//     );
//     if (!tabsContainer) return;

//     const tabElement = document.createElement("div");
//     tabElement.className = `tab-item ${
//       tab.isActive ? "bg-zinc-700" : "bg-zinc-800"
//     } rounded-t-lg px-4 py-2 flex items-center space-x-2 min-w-[180px] max-w-[240px] group hover:bg-zinc-700 transition`;
//     tabElement.dataset.tabId = tab.id;

//     tabElement.innerHTML = `
//       ${
//         tab.favicon
//           ? `<img src="${tab.favicon}" class="w-4 h-4" alt="favicon" />`
//           : `<svg class="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
//               <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
//             </svg>`
//       }
//       <span class="text-sm ${
//         tab.isActive ? "text-zinc-100" : "text-zinc-300"
//       } truncate flex-1">${tab.title}</span>
//       <button class="tab-close w-4 h-4 rounded opacity-0 group-hover:opacity-100 transition">
//         <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
//         </svg>
//       </button>
//     `;

//     // Tab click to switch
//     tabElement.addEventListener("click", (e) => {
//       if (!(e.target as HTMLElement).closest(".tab-close")) {
//         this.switchToTab(tab.id);
//       }
//     });

//     // Close button
//     const closeBtn = tabElement.querySelector(".tab-close");
//     closeBtn?.addEventListener("click", (e) => {
//       e.stopPropagation();
//       this.closeTab(tab.id);
//     });

//     tabsContainer.appendChild(tabElement);
//   }

//   switchToTab(tabId: string) {
//     // Deactivate all tabs
//     this.tabs.forEach((t) => (t.isActive = false));

//     // Activate selected tab
//     const tab = this.tabs.find((t) => t.id === tabId);
//     if (tab) {
//       tab.isActive = true;
//       this.activeTabId = tabId;
//       this.updateTabUI();
//       this.loadTabContent(tab);
//     }
//   }

//   closeTab(tabId: string) {
//     const tabIndex = this.tabs.findIndex((t) => t.id === tabId);
//     if (tabIndex === -1) return;

//     const wasActive = this.tabs[tabIndex].isActive;
//     this.tabs.splice(tabIndex, 1);

//     // Remove tab element
//     const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
//     tabElement?.remove();

//     // If closed tab was active, switch to another tab
//     if (wasActive && this.tabs.length > 0) {
//       const newActiveIndex = Math.min(tabIndex, this.tabs.length - 1);
//       this.switchToTab(this.tabs[newActiveIndex].id);
//     } else if (this.tabs.length === 0) {
//       // Create new tab if all tabs are closed
//       this.createTab("New Tab", "about:blank");
//     }
//   }

//   private updateTabUI() {
//     this.tabs.forEach((tab) => {
//       const tabElement = document.querySelector(`[data-tab-id="${tab.id}"]`);
//       if (tabElement) {
//         if (tab.isActive) {
//           tabElement.classList.remove("bg-zinc-800");
//           tabElement.classList.add("bg-zinc-700");
//           tabElement.querySelector("span")?.classList.remove("text-zinc-300");
//           tabElement.querySelector("span")?.classList.add("text-zinc-100");
//         } else {
//           tabElement.classList.remove("bg-zinc-700");
//           tabElement.classList.add("bg-zinc-800");
//           tabElement.querySelector("span")?.classList.remove("text-zinc-100");
//           tabElement.querySelector("span")?.classList.add("text-zinc-300");
//         }
//       }
//     });
//   }

//   private loadTabContent(tab: Tab) {
//     // Update address bar
//     const addressBar = document.getElementById(
//       "address-bar"
//     ) as HTMLInputElement;
//     if (addressBar) {
//       addressBar.value = tab.url === "about:blank" ? "" : tab.url;
//     }

//     // TODO: Load WebView content via Tauri
//     console.log("[v0] Loading tab content:", tab.url);
//   }

//   private getFaviconUrl(url: string): string {
//     if (url === "about:blank") return "";
//     try {
//       const urlObj = new URL(url);
//       return `${urlObj.origin}/favicon.ico`;
//     } catch {
//       return "";
//     }
//   }

//   updateTabTitle(tabId: string, title: string) {
//     const tab = this.tabs.find((t) => t.id === tabId);
//     if (tab) {
//       tab.title = title;
//       const tabElement = document.querySelector(
//         `[data-tab-id="${tabId}"] span`
//       );
//       if (tabElement) {
//         tabElement.textContent = title;
//       }
//     }
//   }

//   updateTabUrl(tabId: string, url: string) {
//     const tab = this.tabs.find((t) => t.id === tabId);
//     if (tab) {
//       tab.url = url;
//       tab.favicon = this.getFaviconUrl(url);
//       if (tab.isActive) {
//         const addressBar = document.getElementById(
//           "address-bar"
//         ) as HTMLInputElement;
//         if (addressBar) {
//           addressBar.value = url;
//         }
//       }
//     }
//   }
// }

// // Initialize tab manager when DOM is ready
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", () => {
//     const tabManager = new TabManager();
//     (window as any).tabManager = tabManager;
//   });
// } else {
//   const tabManager = new TabManager();
//   (window as any).tabManager = tabManager;
// }

// interface Tab {
//   id: string;
//   title: string;
//   url: string;
//   favicon: string;
//   isActive: boolean;
// }

// class TabManager {
//   private tabs: Tab[] = [];
//   private activeTabId: string | null = null;
//   private tabBar: HTMLElement | null = null;
//   private webViewContainer: HTMLElement | null = null;

//   constructor() {
//     this.init();
//   }

//   private init() {
//     console.log("[v0] Initializing TabManager");
//     this.tabBar = document.getElementById("tab-bar");
//     this.webViewContainer = document.getElementById("browser-content");
//     this.setupEventListeners();
//     // Create initial tab
//     this.createTab("New Tab", "about:blank");
//   }

//   private setupEventListeners() {
//     // New tab button
//     const newTabBtn = document.querySelector('[title="New Tab"]');
//     if (newTabBtn) {
//       newTabBtn.addEventListener("click", () => {
//         this.createTab("New Tab", "about:blank");
//       });
//     }

//     // Address bar navigation
//     const addressBar = document.getElementById(
//       "address-bar"
//     ) as HTMLInputElement;
//     if (addressBar) {
//       addressBar.addEventListener("keypress", (e) => {
//         if (e.key === "Enter") {
//           const url = addressBar.value;
//           this.navigateActiveTab(url);
//         }
//       });
//     }
//   }

//   createTab(title: string, url: string): string {
//     const tabId = `tab-${Date.now()}`;
//     const tab: Tab = {
//       id: tabId,
//       title,
//       url,
//       favicon: this.getFaviconUrl(url),
//       isActive: false,
//     };

//     this.tabs.push(tab);
//     this.renderTab(tab);
//     this.switchToTab(tabId);

//     console.log("[v0] Created tab:", tabId, title);
//     return tabId;
//   }

//   private renderTab(tab: Tab) {
//     const tabsContainer = this.tabBar?.querySelector(
//       ".flex.items-center.space-x-1"
//     );
//     if (!tabsContainer) return;

//     const tabElement = document.createElement("div");
//     tabElement.className = `tab-item ${
//       tab.isActive
//         ? "bg-zinc-700 dark:bg-zinc-600"
//         : "bg-zinc-800 dark:bg-zinc-800"
//     } rounded-t-lg px-4 py-2 flex items-center space-x-2 min-w-[180px] max-w-[240px] group hover:bg-zinc-700 dark:hover:bg-zinc-600 transition`;
//     tabElement.dataset.tabId = tab.id;

//     tabElement.innerHTML = `
//       ${
//         tab.favicon && tab.url !== "about:blank"
//           ? `<img src="${tab.favicon}" class="w-4 h-4" alt="favicon" onerror="this.style.display='none'" />`
//           : `<svg class="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
//               <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
//             </svg>`
//       }
//       <span class="text-sm ${
//         tab.isActive ? "text-zinc-100" : "text-zinc-300 dark:text-zinc-400"
//       } truncate flex-1">${tab.title}</span>
//       <button class="tab-close w-4 h-4 rounded opacity-0 group-hover:opacity-100 transition text-zinc-400 hover:text-zinc-100">
//         <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
//         </svg>
//       </button>
//     `;

//     // Tab click to switch
//     tabElement.addEventListener("click", (e) => {
//       if (!(e.target as HTMLElement).closest(".tab-close")) {
//         this.switchToTab(tab.id);
//       }
//     });

//     // Close button
//     const closeBtn = tabElement.querySelector(".tab-close");
//     closeBtn?.addEventListener("click", (e) => {
//       e.stopPropagation();
//       this.closeTab(tab.id);
//     });

//     tabsContainer.appendChild(tabElement);
//   }

//   switchToTab(tabId: string) {
//     console.log("[v0] Switching to tab:", tabId);
//     // Deactivate all tabs
//     this.tabs.forEach((t) => (t.isActive = false));

//     // Activate selected tab
//     const tab = this.tabs.find((t) => t.id === tabId);
//     if (tab) {
//       tab.isActive = true;
//       this.activeTabId = tabId;
//       this.updateTabUI();
//       this.loadTabContent(tab);
//     }
//   }

//   closeTab(tabId: string) {
//     console.log("[v0] Closing tab:", tabId);
//     const tabIndex = this.tabs.findIndex((t) => t.id === tabId);
//     if (tabIndex === -1) return;

//     const wasActive = this.tabs[tabIndex].isActive;
//     this.tabs.splice(tabIndex, 1);

//     // Remove tab element
//     const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
//     tabElement?.remove();

//     // Remove WebView
//     const webView = document.getElementById(`webview-${tabId}`);
//     webView?.remove();

//     // If closed tab was active, switch to another tab
//     if (wasActive && this.tabs.length > 0) {
//       const newActiveIndex = Math.min(tabIndex, this.tabs.length - 1);
//       this.switchToTab(this.tabs[newActiveIndex].id);
//     } else if (this.tabs.length === 0) {
//       // Create new tab if all tabs are closed
//       this.createTab("New Tab", "about:blank");
//     }
//   }

//   private updateTabUI() {
//     this.tabs.forEach((tab) => {
//       const tabElement = document.querySelector(`[data-tab-id="${tab.id}"]`);
//       if (tabElement) {
//         if (tab.isActive) {
//           tabElement.classList.remove("bg-zinc-800");
//           tabElement.classList.add("bg-zinc-700");
//           tabElement.querySelector("span")?.classList.remove("text-zinc-300");
//           tabElement.querySelector("span")?.classList.add("text-zinc-100");
//         } else {
//           tabElement.classList.remove("bg-zinc-700");
//           tabElement.classList.add("bg-zinc-800");
//           tabElement.querySelector("span")?.classList.remove("text-zinc-100");
//           tabElement.querySelector("span")?.classList.add("text-zinc-300");
//         }
//       }
//     });
//   }

//   private loadTabContent(tab: Tab) {
//     // Update address bar
//     const addressBar = document.getElementById(
//       "address-bar"
//     ) as HTMLInputElement;
//     if (addressBar) {
//       addressBar.value = tab.url === "about:blank" ? "" : tab.url;
//     }

//     // Hide all webviews
//     const allWebViews = document.querySelectorAll("[id^='webview-']");
//     allWebViews.forEach((wv) => {
//       (wv as HTMLElement).style.display = "none";
//     });

//     // Show or create webview for this tab
//     let webView = document.getElementById(`webview-${tab.id}`);
//     if (!webView && this.webViewContainer) {
//       webView = document.createElement("iframe");
//       webView.id = `webview-${tab.id}`;
//       webView.className = "w-full h-full border-0";
//       webView.setAttribute(
//         "sandbox",
//         "allow-same-origin allow-scripts allow-forms allow-popups"
//       );
//       this.webViewContainer.appendChild(webView);
//     }

//     if (webView) {
//       webView.style.display = "block";
//       if (tab.url !== "about:blank") {
//         (webView as HTMLIFrameElement).src = tab.url;
//       }
//     }

//     console.log("[v0] Loaded tab content:", tab.url);
//   }

//   navigateActiveTab(url: string) {
//     const activeTab = this.tabs.find((t) => t.id === this.activeTabId);
//     if (!activeTab) return;

//     // Add protocol if missing
//     let fullUrl = url;
//     if (
//       !url.startsWith("http://") &&
//       !url.startsWith("https://") &&
//       !url.startsWith("bifrost://")
//     ) {
//       fullUrl = `https://${url}`;
//     }

//     activeTab.url = fullUrl;
//     activeTab.title = fullUrl;
//     activeTab.favicon = this.getFaviconUrl(fullUrl);

//     this.updateTabTitle(activeTab.id, fullUrl);
//     this.loadTabContent(activeTab);

//     console.log("[v0] Navigated to:", fullUrl);
//   }

//   private getFaviconUrl(url: string): string {
//     if (url === "about:blank" || url.startsWith("bifrost://")) return "";
//     try {
//       const urlObj = new URL(url);
//       return `${urlObj.origin}/favicon.ico`;
//     } catch {
//       return "";
//     }
//   }

//   updateTabTitle(tabId: string, title: string) {
//     const tab = this.tabs.find((t) => t.id === tabId);
//     if (tab) {
//       tab.title = title;
//       const tabElement = document.querySelector(
//         `[data-tab-id="${tabId}"] span`
//       );
//       if (tabElement) {
//         tabElement.textContent = title;
//       }
//     }
//   }

//   updateTabUrl(tabId: string, url: string) {
//     const tab = this.tabs.find((t) => t.id === tabId);
//     if (tab) {
//       tab.url = url;
//       tab.favicon = this.getFaviconUrl(url);
//       if (tab.isActive) {
//         const addressBar = document.getElementById(
//           "address-bar"
//         ) as HTMLInputElement;
//         if (addressBar) {
//           addressBar.value = url;
//         }
//       }
//     }
//   }
// }

// // Initialize tab manager when DOM is ready
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", () => {
//     const tabManager = new TabManager();
//     (window as any).tabManager = tabManager;
//   });
// } else {
//   const tabManager = new TabManager();
//   (window as any).tabManager = tabManager;
// }

// Tab Management System

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon: string;
  isActive: boolean;
}

class TabManager {
  private tabs: Tab[] = [];
  private activeTabId: string | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    console.log("[v0] TabManager initialized");
    // Create initial tab
    this.createTab("about:blank", "New Tab");
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
      isActive: true,
    };

    // Deactivate all other tabs
    this.tabs.forEach((tab) => (tab.isActive = false));

    this.tabs.push(newTab);
    this.activeTabId = tabId;

    console.log("[v0] Created new tab:", tabId);
    this.renderTabs();

    return tabId;
  }

  closeTab(tabId: string) {
    const index = this.tabs.findIndex((tab) => tab.id === tabId);
    if (index === -1) return;

    this.tabs.splice(index, 1);

    // If we closed the active tab, activate another one
    if (this.activeTabId === tabId) {
      if (this.tabs.length > 0) {
        const newActiveIndex = Math.max(0, index - 1);
        this.activateTab(this.tabs[newActiveIndex].id);
      } else {
        this.activeTabId = null;
      }
    }

    this.renderTabs();
  }

  activateTab(tabId: string) {
    this.tabs.forEach((tab) => {
      tab.isActive = tab.id === tabId;
    });
    this.activeTabId = tabId;
    this.renderTabs();
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

  private renderTabs() {
    const tabBar = document.getElementById("tab-bar");
    if (!tabBar) return;

    const tabsContainer = tabBar.querySelector(
      ".flex.items-center.space-x-1.flex-1"
    );
    if (!tabsContainer) return;

    tabsContainer.innerHTML = this.tabs
      .map(
        (tab) => `
      <div
        class="tab-item ${
          tab.isActive ? "bg-zinc-700" : "bg-zinc-800"
        } rounded-t-lg px-4 py-2 flex items-center space-x-2 min-w-[180px] max-w-[240px] group hover:bg-zinc-700 transition cursor-pointer"
        onclick="window.tabManager?.activateTab('${tab.id}')"
      >
        ${
          tab.favicon
            ? `<img src="${tab.favicon}" class="w-4 h-4" alt="favicon" onerror="this.style.display='none'" />`
            : `
        <svg class="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
        </svg>
        `
        }
        <span class="text-sm ${
          tab.isActive ? "text-zinc-100" : "text-zinc-300"
        } truncate flex-1">${tab.title}</span>
        <button
          onclick="event.stopPropagation(); window.tabManager?.closeTab('${
            tab.id
          }')"
          class="tab-close w-4 h-4 rounded opacity-0 group-hover:opacity-100 transition hover:bg-zinc-600"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `
      )
      .join("");
  }

  getTabs(): Tab[] {
    return this.tabs;
  }

  getActiveTab(): Tab | null {
    return this.tabs.find((tab) => tab.id === this.activeTabId) || null;
  }
}

// Initialize and export tab manager
const tabManager = new TabManager();

// Export to window for global access
(window as any).tabManager = tabManager;

// Export createNewTab function for toolbar button
(window as any).createNewTab = () => {
  console.log("[v0] Creating new tab from button");
  tabManager.createTab();
};

export default tabManager;
