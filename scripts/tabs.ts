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
        // Load special tab content
        if (tab.url === "history") {
          element.innerHTML = this.getHistoryContent();
          this.executeScripts(element);
        } else if (tab.url === "settings") {
          element.innerHTML = this.getSettingsContent();
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

  private getHistoryContent(): string {
    return `
      <div class="h-full bg-zinc-900 text-white overflow-auto">
        <div class="max-w-6xl mx-auto p-8">
          <h1 class="text-3xl font-bold mb-2 flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            History
          </h1>
          <p class="text-zinc-400 mb-8">Your browsing history across all sessions</p>
          
          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
              <div class="text-zinc-400 text-sm mb-2">Total Visits</div>
              <div class="text-3xl font-bold" id="totalVisits">0</div>
            </div>
            <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
              <div class="text-zinc-400 text-sm mb-2">Today</div>
              <div class="text-3xl font-bold" id="todayVisits">0</div>
            </div>
            <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
              <div class="text-zinc-400 text-sm mb-2">This Week</div>
              <div class="text-3xl font-bold" id="weekVisits">0</div>
            </div>
          </div>
          
          <div class="flex gap-4 mb-6">
            <input 
              type="text" 
              class="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500"
              placeholder="Search history by title or URL..." 
              id="searchInput"
            >
            <button class="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 px-6 py-3 rounded-lg font-medium transition" onclick="clearAllHistory()">
              Clear All History
            </button>
          </div>
          
          <div id="historyContainer"></div>
        </div>
      </div>
      
      <script>
        function getHistory() {
          return window.atlasState?.history || [];
        }
        
        function timeAgo(timestamp) {
          const date = new Date(timestamp);
          const now = new Date();
          const seconds = Math.floor((now - date) / 1000);
          
          if (seconds < 60) return 'Just now';
          if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
          if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
          if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
          
          return date.toLocaleDateString();
        }
        
        function groupHistory(history) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const yesterday = new Date(today - 86400000);
          const lastWeek = new Date(today - 604800000);
          
          const groups = { today: [], yesterday: [], lastWeek: [], older: [] };
          
          history.forEach(item => {
            const itemDate = new Date(item.timestamp);
            if (itemDate >= today) groups.today.push(item);
            else if (itemDate >= yesterday) groups.yesterday.push(item);
            else if (itemDate >= lastWeek) groups.lastWeek.push(item);
            else groups.older.push(item);
          });
          
          return groups;
        }
        
        function updateStats(history) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const lastWeek = new Date(today - 604800000);
          
          const todayCount = history.filter(item => new Date(item.timestamp) >= today).length;
          const weekCount = history.filter(item => new Date(item.timestamp) >= lastWeek).length;
          
          document.getElementById('totalVisits').textContent = history.length;
          document.getElementById('todayVisits').textContent = todayCount;
          document.getElementById('weekVisits').textContent = weekCount;
        }
        
        function renderHistory(searchTerm = '') {
          const container = document.getElementById('historyContainer');
          let history = getHistory();
          
          updateStats(history);
          
          if (searchTerm) {
            history = history.filter(item => 
              item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.url.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          
          if (history.length === 0) {
            container.innerHTML = '<div class="text-center py-16 text-zinc-500"><div class="text-6xl mb-4">📭</div><div>No history found</div></div>';
            return;
          }
          
          const groups = groupHistory(history);
          const groupLabels = { today: 'Today', yesterday: 'Yesterday', lastWeek: 'Last 7 Days', older: 'Older' };
          
          let html = '';
          Object.entries(groups).forEach(([key, items]) => {
            if (items.length > 0) {
              html += '<div class="mb-8"><div class="text-zinc-400 text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2"><span>' + groupLabels[key] + '</span><div class="flex-1 h-px bg-zinc-800"></div></div>';
              items.forEach(item => {
                html += '<div class="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-2 hover:bg-zinc-750 transition cursor-pointer flex items-center gap-4" onclick="openUrl(\'' + item.url + '\')"><div class="w-8 h-8 bg-zinc-700 rounded flex items-center justify-center text-lg flex-shrink-0">' + (item.favicon ? '<img src="' + item.favicon + '" class="w-5 h-5" onerror="this.parentElement.innerHTML=\'🌐\'">' : '🌐') + '</div><div class="flex-1 min-w-0"><div class="font-medium truncate">' + item.title + '</div><div class="text-sm text-zinc-500 truncate">' + item.url + '</div></div><div class="text-sm text-zinc-400 flex-shrink-0">' + timeAgo(item.timestamp) + '</div><button class="p-2 hover:bg-zinc-600 rounded transition flex-shrink-0" onclick="event.stopPropagation(); deleteHistoryItem(\'' + item.url + '\')" title="Remove"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></div>';
              });
              html += '</div>';
            }
          });
          
          container.innerHTML = html;
        }
        
        function openUrl(url) {
          if (window.tabManager) {
            window.tabManager.createTab(url);
          }
        }
        
        function deleteHistoryItem(url) {
          if (window.atlasState) {
            window.atlasState.history = window.atlasState.history.filter(item => item.url !== url);
            renderHistory(document.getElementById('searchInput').value);
          }
        }
        
        function clearAllHistory() {
          if (confirm('Clear all browsing history?')) {
            if (window.atlasState) {
              window.atlasState.history = [];
              renderHistory();
            }
          }
        }
        
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
          renderHistory(e.target.value);
        });
        
        renderHistory();
        setInterval(() => renderHistory(document.getElementById('searchInput')?.value || ''), 30000);
      </script>
    `;
  }

  private getSettingsContent(): string {
    return `
      <div class="h-full bg-zinc-900 text-white overflow-auto">
        <div class="max-w-4xl mx-auto p-8">
          <h1 class="text-3xl font-bold mb-2 flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m-8-8h6m6 0h6"/>
            </svg>
            Settings
          </h1>
          <p class="text-zinc-400 mb-8">Customize your browsing experience</p>
          
          <!-- Appearance -->
          <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
              Appearance
            </h2>
            <p class="text-zinc-400 text-sm mb-6">Customize the look and feel</p>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-zinc-700">
                <div><div class="font-medium">Theme</div><div class="text-sm text-zinc-400">Light, dark, or system</div></div>
                <select class="bg-zinc-700 border border-zinc-600 rounded px-3 py-2" id="themeSelect" onchange="changeTheme(this.value)">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-zinc-700">
                <div><div class="font-medium">Compact Mode</div><div class="text-sm text-zinc-400">Reduce spacing</div></div>
                <div class="toggle-switch" onclick="toggleSetting(this)" data-setting="compactMode">
                  <div class="toggle-slider"></div>
                </div>
              </div>
              
              <div class="flex justify-between items-center py-3">
                <div><div class="font-medium">Show Favicons</div><div class="text-sm text-zinc-400">Display website icons</div></div>
                <div class="toggle-switch active" onclick="toggleSetting(this)" data-setting="showFavicons">
                  <div class="toggle-slider"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Privacy -->
          <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Privacy & Security
            </h2>
            <p class="text-zinc-400 text-sm mb-6">Control your privacy settings</p>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-zinc-700">
                <div><div class="font-medium">Save History</div><div class="text-sm text-zinc-400">Store visited websites</div></div>
                <div class="toggle-switch active" onclick="toggleSetting(this)" data-setting="saveHistory">
                  <div class="toggle-slider"></div>
                </div>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-zinc-700">
                <div><div class="font-medium">Block Cookies</div><div class="text-sm text-zinc-400">Prevent tracking</div></div>
                <div class="toggle-switch active" onclick="toggleSetting(this)" data-setting="blockCookies">
                  <div class="toggle-slider"></div>
                </div>
              </div>
              
              <div class="flex justify-between items-center py-3">
                <div><div class="font-medium">Do Not Track</div><div class="text-sm text-zinc-400">Send DNT requests</div></div>
                <div class="toggle-switch" onclick="toggleSetting(this)" data-setting="doNotTrack">
                  <div class="toggle-slider"></div>
                </div>
              </div>
            </div>
            
            <button class="mt-6 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition" onclick="clearBrowsingData()">
              Clear Browsing Data
            </button>
          </div>
          
          <!-- General -->
          <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">General</h2>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-zinc-700">
                <div><div class="font-medium">Home Page</div><div class="text-sm text-zinc-400">New tab page</div></div>
                <input type="text" class="bg-zinc-700 border border-zinc-600 rounded px-3 py-2 w-64" value="about:blank" placeholder="https://example.com">
              </div>
              
              <div class="flex justify-between items-center py-3">
                <div><div class="font-medium">Search Engine</div><div class="text-sm text-zinc-400">Default search</div></div>
                <select class="bg-zinc-700 border border-zinc-600 rounded px-3 py-2">
                  <option>Google</option>
                  <option>Bing</option>
                  <option>DuckDuckGo</option>
                  <option>Brave</option>
                </select>
              </div>
            </div>
            
            <div class="flex gap-3 mt-6">
              <button class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition" onclick="saveSettings()">
                Save Changes
              </button>
              <button class="bg-zinc-700 hover:bg-zinc-600 px-6 py-2 rounded-lg font-medium transition" onclick="resetSettings()">
                Reset to Defaults
              </button>
            </div>
          </div>
          
          <!-- About -->
          <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <h2 class="text-xl font-semibold mb-4">About</h2>
            <div class="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <div class="font-semibold mb-1">BiFrost Browser</div>
              <div class="text-sm text-zinc-400">Version 1.0.0</div>
              <div class="text-sm text-zinc-400 mt-2">A modern, privacy-focused browser</div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        .toggle-switch {
          position: relative;
          width: 48px;
          height: 24px;
          background: #3f3f46;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .toggle-switch.active {
          background: #3b82f6;
        }
        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }
        .toggle-switch.active .toggle-slider {
          transform: translateX(24px);
        }
      </style>
      
      <script>
        function toggleSetting(element) {
          element.classList.toggle('active');
          const setting = element.getAttribute('data-setting');
          const isActive = element.classList.contains('active');
          console.log('[Settings]', setting, ':', isActive);
          
          if (window.atlasState) {
            if (!window.atlasState.settings) window.atlasState.settings = {};
            window.atlasState.settings[setting] = isActive;
          }
        }
        
        function changeTheme(theme) {
          const html = document.documentElement;
          if (theme === 'dark') html.classList.add('dark');
          else if (theme === 'light') html.classList.remove('dark');
          else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            html.classList.toggle('dark', prefersDark);
          }
        }
        
        function saveSettings() {
          alert('Settings saved successfully!');
        }
        
        function resetSettings() {
          if (confirm('Reset all settings to defaults?')) {
            document.querySelectorAll('.toggle-switch').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.toggle-switch[data-setting="showFavicons"]').forEach(t => t.classList.add('active'));
            document.querySelectorAll('.toggle-switch[data-setting="saveHistory"]').forEach(t => t.classList.add('active'));
            document.querySelectorAll('.toggle-switch[data-setting="blockCookies"]').forEach(t => t.classList.add('active'));
            alert('Settings reset to defaults');
          }
        }
        
        function clearBrowsingData() {
          if (confirm('Clear browsing history, cookies, and cache?')) {
            if (window.atlasState) {
              window.atlasState.history = [];
              window.atlasState.downloads = [];
            }
            alert('Browsing data cleared!');
          }
        }
      </script>
    `;
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

    this.tabs.forEach((tab) => {
      const tabElement = this.createTabElement(tab);
      fragment.appendChild(tabElement);
    });

    this.tabBarElement.innerHTML = "";
    this.tabBarElement.appendChild(fragment);
  }

  private createTabElement(tab: Tab): HTMLElement {
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

(window as any).TabManager = TabManager;
