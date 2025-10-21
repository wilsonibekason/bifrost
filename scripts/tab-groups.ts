// TabGroups Manager - Matches Figma Design Exactly

interface Tab {
  id: number;
  title: string;
  url: string;
  favicon: string;
}

interface TabGroup {
  id: number;
  name: string;
  tabs: Tab[];
  count: number;
}

type ViewType = "tabs-view" | "tab-groups-view";

export class TabGroupsManager {
  private tabs: Tab[];
  private tabGroups: TabGroup[];
  private currentView: ViewType;
  private selectedTabId: number | null;
  private filteredTabs: Tab[];
  private isInitialized: boolean = false;

  constructor() {
    console.log("[TabGroups] Constructor called");

    this.tabs = [
      {
        id: 1,
        title: "The Blair Witch Project - Wikipedia",
        url: "https://wikipedia.org/wiki/The_Blair_Witch_Project",
        favicon: "📄",
      },
      {
        id: 2,
        title: "Google",
        url: "https://google.com",
        favicon: "🔍",
      },
      {
        id: 3,
        title:
          "Dribbble - Discover the World's Top Designers & Creative Professionals",
        url: "https://dribbble.com",
        favicon: "🎨",
      },
      {
        id: 4,
        title: "Jarrick II Laced Leather Platform Boots in...",
        url: "https://pinterest.com",
        favicon: "📌",
      },
      {
        id: 5,
        title: "Netflix Nigeria - Watch Tv Shows Online,Watch Movies Online",
        url: "https://netflix.com",
        favicon: "🎬",
      },
      {
        id: 6,
        title: "ChatGPT",
        url: "https://chatgpt.com",
        favicon: "🤖",
      },
      {
        id: 7,
        title: "(3) Feed - Linkedin",
        url: "https://linkedin.com",
        favicon: "💼",
      },
      {
        id: 8,
        title: "(148) RKG's Halloween Sleepover III - Outlast Whistleblower",
        url: "https://youtube.com/watch?v=example",
        favicon: "▶️",
      },
    ];

    this.tabGroups = [
      {
        id: 1,
        name: "Research Tabs",
        tabs: this.tabs.slice(0, 3),
        count: 12,
      },
      {
        id: 2,
        name: "Shopping Tabs",
        tabs: this.tabs.slice(3, 6),
        count: 8,
      },
      {
        id: 3,
        name: "Stream Tabs",
        tabs: this.tabs.slice(6, 8),
        count: 5,
      },
      {
        id: 4,
        name: "Research Tabs",
        tabs: this.tabs.slice(0, 3),
        count: 6,
      },
    ];

    this.currentView = "tabs-view";
    this.selectedTabId = null;
    this.filteredTabs = [...this.tabs];

    this.init();
  }

  private init(): void {
    console.log("[TabGroups] Initializing...");

    // Verify DOM elements exist
    const requiredElements = [
      "tabs-stack",
      "tabs-view",
      "tab-groups-view",
      "groups-container",
      "search-input",
      "add-group-btn",
      "modal-close-btn",
      "modal-overlay",
    ];

    const missingElements = requiredElements.filter(
      (id) => !document.getElementById(id)
    );

    if (missingElements.length > 0) {
      console.error("[TabGroups] Missing elements:", missingElements);
      return;
    }

    this.setupEventListeners();
    this.renderTabs();
    this.renderTabGroups();
    this.isInitialized = true;

    console.log("[TabGroups] Initialization complete");
  }

  private setupEventListeners(): void {
    // Bottom navigation
    const navTabs = document.querySelectorAll<HTMLElement>(".nav-tab");
    console.log("[TabGroups] Found nav tabs:", navTabs.length);

    navTabs.forEach((btn) => {
      btn.addEventListener("click", (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        const viewId = target.dataset.view as ViewType;
        console.log("[TabGroups] Nav clicked:", viewId);
        this.switchView(viewId);
      });
    });

    // Modal close
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const modalOverlay = document.getElementById("modal-overlay");

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", () => {
        this.hideModal();
      });
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", () => {
        this.hideModal();
      });
    }

    // Search
    const searchInput = document.getElementById(
      "search-input"
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener("input", (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.filterTabs(target.value);
      });
    }

    // Add group button
    const addGroupBtn = document.getElementById("add-group-btn");
    if (addGroupBtn) {
      addGroupBtn.addEventListener("click", () => {
        this.createNewGroup();
      });
    }
  }

  private switchView(viewId: ViewType): void {
    console.log("[TabGroups] Switching to view:", viewId);
    this.currentView = viewId;

    // Hide all views
    const tabsView = document.getElementById("tabs-view");
    const tabGroupsView = document.getElementById("tab-groups-view");

    if (tabsView) {
      tabsView.classList.remove("view-active");
      tabsView.classList.add("hidden");
    }
    if (tabGroupsView) {
      tabGroupsView.classList.remove("view-active");
      tabGroupsView.classList.add("hidden");
    }

    // Remove active from all nav tabs
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.remove("nav-tab-active");
    });

    // Show selected view
    if (viewId === "tabs-view") {
      if (tabsView) {
        tabsView.classList.add("view-active");
        tabsView.classList.remove("hidden");
      }
    } else {
      if (tabGroupsView) {
        tabGroupsView.classList.add("view-active");
        tabGroupsView.classList.remove("hidden");
      }
    }

    // Mark nav tab as active
    const activeNavTab = document.querySelector(`[data-view="${viewId}"]`);
    if (activeNavTab) {
      activeNavTab.classList.add("nav-tab-active");
    }

    console.log("[TabGroups] View switched successfully");
  }

  private renderTabs(): void {
    const stack = document.getElementById("tabs-stack");
    if (!stack) {
      console.error("[TabGroups] tabs-stack not found");
      return;
    }

    console.log("[TabGroups] Rendering", this.filteredTabs.length, "tabs");
    stack.innerHTML = "";

    this.filteredTabs.forEach((tab, index) => {
      const tabEl = document.createElement("div");
      tabEl.className = "stacked-tab";

      // CRITICAL: Stacking from BOTTOM to TOP (reverse order)
      // Bottom tabs have higher offsets, top tab has offset 0
      const totalTabs = this.filteredTabs.length;
      const reverseIndex = totalTabs - 1 - index;

      // Calculate progressive stacking effect
      const offsetY = reverseIndex * 18; // Increase spacing
      const scale = 1 - reverseIndex * 0.02; // Slight scale reduction
      const zIndex = index + 1; // Top tabs have higher z-index

      tabEl.style.transform = `translateY(${offsetY}px) scale(${scale})`;
      tabEl.style.zIndex = zIndex.toString();

      if (this.selectedTabId === tab.id) {
        tabEl.classList.add("active");
      }

      tabEl.innerHTML = `
        <div class="tab-favicon">${tab.favicon}</div>
        <div class="tab-title">${this.escapeHtml(tab.title)}</div>
        <div class="tab-close">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 5L5 15M5 5L15 15"/>
          </svg>
        </div>
      `;

      // Tab click - select and preview
      tabEl.addEventListener("click", (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target.closest(".tab-close")) {
          this.selectTab(tab);
        }
      });

      // Close button click
      const closeBtn = tabEl.querySelector(".tab-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", (e: Event) => {
          e.stopPropagation();
          this.closeTab(tab.id);
        });
      }

      stack.appendChild(tabEl);
    });

    console.log("[TabGroups] Tabs rendered successfully");
  }

  private selectTab(tab: Tab): void {
    console.log("[TabGroups] Tab selected:", tab.title);
    this.selectedTabId = tab.id;

    // Update preview
    const previewUrl = document.getElementById("preview-url");
    const previewContent = document.getElementById("preview-content");

    if (previewUrl) {
      previewUrl.textContent = tab.url;
    }

    if (previewContent) {
      previewContent.innerHTML = `
        <div class="text-center">
          <div class="text-7xl mb-6">${tab.favicon}</div>
          <div class="text-xl font-semibold text-white mb-3">${this.escapeHtml(
            tab.title
          )}</div>
          <div class="text-sm text-zinc-500">${this.escapeHtml(tab.url)}</div>
        </div>
      `;
    }

    // Update active state
    document.querySelectorAll(".stacked-tab").forEach((el, i) => {
      if (this.filteredTabs[i]?.id === tab.id) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });

    // Show modal
    this.showModal();
  }

  private closeTab(tabId: number): void {
    console.log("[TabGroups] Closing tab:", tabId);

    const index = this.tabs.findIndex((t) => t.id === tabId);
    if (index === -1) return;

    this.tabs.splice(index, 1);

    // Update filtered tabs
    const filteredIndex = this.filteredTabs.findIndex((t) => t.id === tabId);
    if (filteredIndex !== -1) {
      this.filteredTabs.splice(filteredIndex, 1);
    }

    // Clear selection if closed tab was selected
    if (this.selectedTabId === tabId) {
      this.selectedTabId = null;
      const previewContent = document.getElementById("preview-content");
      if (previewContent) {
        previewContent.innerHTML = `
          <div class="text-center text-zinc-600">
            <div class="text-6xl mb-4">🌐</div>
            <div class="text-sm">Select a tab to preview</div>
          </div>
        `;
      }
    }

    this.renderTabs();
  }

  private renderTabGroups(): void {
    const container = document.getElementById("groups-container");
    if (!container) {
      console.error("[TabGroups] groups-container not found");
      return;
    }

    console.log("[TabGroups] Rendering", this.tabGroups.length, "groups");
    container.innerHTML = "";

    this.tabGroups.forEach((group) => {
      const card = document.createElement("div");
      card.className = "group-card";

      // Preview section with stacked tabs
      const preview = document.createElement("div");
      preview.className = "group-preview";

      // Show up to 3 tabs in preview - STACKED FROM BOTTOM TO TOP
      const previewTabs = group.tabs.slice(0, 3);
      previewTabs.forEach((tab, index) => {
        const tabPreview = document.createElement("div");
        tabPreview.className = "stacked-preview-tab";

        // Reverse stacking: bottom tabs have larger offsets
        const reverseIndex = previewTabs.length - 1 - index;
        const offsetX = reverseIndex * 12;
        const offsetY = reverseIndex * 12;
        const scale = 0.88 + index * 0.06;
        const zIndex = index + 1;

        tabPreview.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        tabPreview.style.zIndex = zIndex.toString();
        tabPreview.style.left = "20px";
        tabPreview.style.top = "20px";

        tabPreview.innerHTML = `
          <span class="flex-shrink-0 text-base">${tab.favicon}</span>
          <span class="truncate flex-1 text-xs font-medium">${this.escapeHtml(
            tab.title
          )}</span>
        `;
        preview.appendChild(tabPreview);
      });

      // Group info
      const info = document.createElement("div");
      info.className = "group-info";
      info.innerHTML = `
        <div class="group-name">${this.escapeHtml(group.name)}</div>
        <div class="group-count">${group.count} Tabs</div>
      `;

      card.appendChild(preview);
      card.appendChild(info);

      // Click handler - switch to tabs view and show group tabs
      card.addEventListener("click", () => {
        this.openTabGroup(group);
      });

      container.appendChild(card);
    });

    console.log("[TabGroups] Groups rendered successfully");
  }

  private openTabGroup(group: TabGroup): void {
    console.log("[TabGroups] Opening group:", group.name);

    // Set filtered tabs to this group's tabs
    this.filteredTabs = [...group.tabs];
    this.selectedTabId = null;

    // Switch to tabs view
    this.switchView("tabs-view");

    // Re-render tabs with the filtered list
    this.renderTabs();

    // Show modal after a short delay
    setTimeout(() => {
      this.showModal();
    }, 400);
  }

  private filterTabs(query: string): void {
    console.log("[TabGroups] Filtering tabs:", query);

    if (!query.trim()) {
      this.filteredTabs = [...this.tabs];
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredTabs = this.tabs.filter(
        (tab) =>
          tab.title.toLowerCase().includes(lowerQuery) ||
          tab.url.toLowerCase().includes(lowerQuery)
      );
    }

    this.selectedTabId = null;
    this.renderTabs();

    // Reset preview
    const previewContent = document.getElementById("preview-content");
    if (previewContent) {
      previewContent.innerHTML = `
        <div class="text-center text-zinc-600">
          <div class="text-6xl mb-4">🌐</div>
          <div class="text-sm">Select a tab to preview</div>
        </div>
      `;
    }
  }

  private createNewGroup(): void {
    const name = prompt("Enter group name:");
    if (name && name.trim()) {
      const newGroup: TabGroup = {
        id: this.tabGroups.length + 1,
        name: name.trim(),
        tabs: this.tabs.slice(0, Math.min(3, this.tabs.length)),
        count: Math.min(3, this.tabs.length),
      };
      this.tabGroups.push(newGroup);
      this.renderTabGroups();
      console.log("[TabGroups] New group created:", name);
    }
  }

  private showModal(): void {
    const modal = document.getElementById("click-modal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      console.log("[TabGroups] Modal shown");
    }
  }

  private hideModal(): void {
    const modal = document.getElementById("click-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      console.log("[TabGroups] Modal hidden");
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export initialization function
export function initializeTabGroups(): void {
  console.log("[TabGroups] initializeTabGroups called");

  // Check if already initialized
  const existingManager = (window as any).__tabGroupsManager;
  if (existingManager) {
    console.log("[TabGroups] Already initialized, skipping");
    return;
  }

  // Wait for DOM elements to be available
  const checkAndInit = () => {
    const tabsStack = document.getElementById("tabs-stack");
    const tabsView = document.getElementById("tabs-view");

    if (tabsStack && tabsView) {
      console.log("[TabGroups] DOM elements found, initializing manager");
      const manager = new TabGroupsManager();
      (window as any).__tabGroupsManager = manager;
      console.log("[TabGroups] Manager initialized and attached to window");
    } else {
      console.error("[TabGroups] Required DOM elements not found");
      console.log(
        "[TabGroups] tabsStack:",
        !!tabsStack,
        "tabsView:",
        !!tabsView
      );
    }
  };

  // Try immediate initialization
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(checkAndInit, 150);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(checkAndInit, 150);
    });
  }
}

// Auto-initialize if DOM is ready and elements exist
if (document.getElementById("tabs-stack")) {
  console.log("[TabGroups] Auto-initializing...");
  initializeTabGroups();
}
