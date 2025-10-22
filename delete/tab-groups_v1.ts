interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface TabGroup {
  id: string;
  name: string;
  tabs: Tab[];
  createdAt: number;
}

class TabGroupsManager {
  private tabs: Tab[] = [];
  private tabGroups: TabGroup[] = [];
  private activeTabId: string | null = null;
  private currentView: "tabs" | "groups" = "tabs";

  constructor() {
    this.loadTabGroups();
    this.initializeEventListeners();
    this.renderTabs();
  }

  private initializeEventListeners(): void {
    // Bottom navigation
    document.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const viewId = target.getAttribute("data-view");
        if (viewId) this.switchView(viewId);
      });
    });

    // Search
    const searchInput = document.getElementById(
      "search-input"
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase();
        this.filterTabs(query);
      });
    }

    // Add group button
    const addGroupBtn = document.getElementById("add-group-btn");
    if (addGroupBtn) {
      addGroupBtn.addEventListener("click", () => this.createNewGroup());
    }

    // Modal close
    const modalCloseBtn = document.querySelector(".modal-close-btn");
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", () => this.closeModal());
    }

    const modalOverlay = document.querySelector(".modal-overlay");
    if (modalOverlay) {
      modalOverlay.addEventListener("click", () => this.closeModal());
    }
  }

  private switchView(viewId: string): void {
    // Hide all views
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.remove("active");
    });

    // Show selected view
    const selectedView = document.getElementById(viewId);
    if (selectedView) {
      selectedView.classList.add("active");
    }

    // Update nav tabs
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    document.querySelector(`[data-view="${viewId}"]`)?.classList.add("active");

    this.currentView = viewId === "tabs-view" ? "tabs" : "groups";
    console.log("[TabGroups] Switched to view:", this.currentView);
  }

  private renderTabs(): void {
    const stack = document.getElementById("tabs-stack");
    if (!stack) return;

    stack.innerHTML = "";

    this.tabs.forEach((tab, index) => {
      const tabEl = document.createElement("div");
      tabEl.className = "stacked-tab";
      if (tab.id === this.activeTabId) tabEl.classList.add("active");

      const offsetX = index * 12;
      const offsetY = index * 8;
      const scale = 1 - index * 0.02;
      const zIndex = 100 + index;

      tabEl.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      tabEl.style.zIndex = String(zIndex);

      tabEl.innerHTML = `
        <div class="tab-favicon">${tab.favicon || "📄"}</div>
        <div class="tab-title">${this.escapeHtml(tab.title)}</div>
        <div class="tab-close">×</div>
      `;

      tabEl.addEventListener("click", () => this.selectTab(tab.id));
      tabEl.querySelector(".tab-close")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeTab(tab.id);
      });

      stack.appendChild(tabEl);
    });

    // Set first tab as active if none selected
    if (!this.activeTabId && this.tabs.length > 0) {
      this.activeTabId = this.tabs[this.tabs.length - 1].id;
      this.renderTabs();
    }
  }

  private selectTab(tabId: string): void {
    this.activeTabId = tabId;
    this.showClickModal();
    this.updatePreview();
    this.renderTabs();
    console.log("[TabGroups] Selected tab:", tabId);
  }

  private updatePreview(): void {
    const activeTab = this.tabs.find((t) => t.id === this.activeTabId);
    if (!activeTab) return;

    const urlEl = document.getElementById("preview-url");
    const contentEl = document.getElementById("preview-content");

    if (urlEl) urlEl.textContent = activeTab.url;
    if (contentEl) {
      contentEl.innerHTML = `<div class="preview-placeholder">${this.escapeHtml(
        activeTab.title
      )}</div>`;
    }
  }

  private removeTab(tabId: string): void {
    this.tabs = this.tabs.filter((t) => t.id !== tabId);
    if (this.activeTabId === tabId) {
      this.activeTabId =
        this.tabs.length > 0 ? this.tabs[this.tabs.length - 1].id : null;
    }
    this.renderTabs();
    console.log("[TabGroups] Removed tab:", tabId);
  }

  private renderTabGroups(): void {
    const container = document.getElementById("groups-container");
    if (!container) return;

    container.innerHTML = "";

    this.tabGroups.forEach((group) => {
      const card = document.createElement("div");
      card.className = "group-card";

      const previewTabs = group.tabs.slice(0, 3);
      const previewHtml = previewTabs
        .map(
          (tab) => `
        <div class="stacked-preview-tab">
          <span>${tab.favicon || "📄"}</span>
          <span>${this.escapeHtml(tab.title.substring(0, 20))}</span>
        </div>
      `
        )
        .join("");

      card.innerHTML = `
        <div class="group-preview">
          ${previewHtml}
        </div>
        <div class="group-info">
          <div class="group-name">${this.escapeHtml(group.name)}</div>
          <div class="group-count">${group.tabs.length} tabs</div>
        </div>
      `;

      card.addEventListener("click", () => this.openTabGroup(group.id));
      container.appendChild(card);
    });
  }

  private openTabGroup(groupId: string): void {
    const group = this.tabGroups.find((g) => g.id === groupId);
    if (!group) return;

    this.tabs = [...group.tabs];
    this.activeTabId =
      this.tabs.length > 0 ? this.tabs[this.tabs.length - 1].id : null;
    this.switchView("tabs-view");
    this.renderTabs();
    console.log("[TabGroups] Opened group:", groupId);
  }

  private createNewGroup(): void {
    if (this.tabs.length === 0) {
      alert("No tabs to save. Open some tabs first.");
      return;
    }

    const groupName = prompt("Enter group name:");
    if (!groupName) return;

    const newGroup: TabGroup = {
      id: Date.now().toString(),
      name: groupName,
      tabs: [...this.tabs],
      createdAt: Date.now(),
    };

    this.tabGroups.push(newGroup);
    this.saveTabGroups();
    this.renderTabGroups();
    console.log("[TabGroups] Created new group:", groupName);
  }

  private filterTabs(query: string): void {
    const filtered = this.tabs.filter(
      (tab) =>
        tab.title.toLowerCase().includes(query) ||
        tab.url.toLowerCase().includes(query)
    );

    const stack = document.getElementById("tabs-stack");
    if (!stack) return;

    stack.innerHTML = "";

    filtered.forEach((tab, index) => {
      const tabEl = document.createElement("div");
      tabEl.className = "stacked-tab";
      if (tab.id === this.activeTabId) tabEl.classList.add("active");

      const offsetX = index * 12;
      const offsetY = index * 8;
      const scale = 1 - index * 0.02;
      const zIndex = 100 + index;

      tabEl.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      tabEl.style.zIndex = String(zIndex);

      tabEl.innerHTML = `
        <div class="tab-favicon">${tab.favicon || "📄"}</div>
        <div class="tab-title">${this.escapeHtml(tab.title)}</div>
        <div class="tab-close">×</div>
      `;

      tabEl.addEventListener("click", () => this.selectTab(tab.id));
      tabEl.querySelector(".tab-close")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeTab(tab.id);
      });

      stack.appendChild(tabEl);
    });
  }

  private showClickModal(): void {
    const modal = document.getElementById("click-modal");
    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  private closeModal(): void {
    const modal = document.getElementById("click-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  private loadTabGroups(): void {
    const stored = localStorage.getItem("tabGroups");
    if (stored) {
      try {
        this.tabGroups = JSON.parse(stored);
      } catch (e) {
        console.error("[TabGroups] Error loading groups:", e);
      }
    }

    // Load sample tabs
    this.tabs = [
      {
        id: "1",
        title: "The Blair Witch Project - Wikipedia",
        url: "https://wikipedia.org",
        favicon: "📄",
      },
      { id: "2", title: "Google", url: "https://google.com", favicon: "🔍" },
      {
        id: "3",
        title: "Dribbble - Discover the World's Top Designers",
        url: "https://dribbble.com",
        favicon: "🎨",
      },
      {
        id: "4",
        title: "Jarrick II Laced Leather Platform Boots",
        url: "https://pinterest.com",
        favicon: "📌",
      },
      {
        id: "5",
        title: "Netflix Nigeria - Watch TV Shows",
        url: "https://netflix.com",
        favicon: "🎬",
      },
      { id: "6", title: "ChatGPT", url: "https://chatgpt.com", favicon: "🤖" },
      {
        id: "7",
        title: "(3) Feed - LinkedIn",
        url: "https://linkedin.com",
        favicon: "💼",
      },
      {
        id: "8",
        title: "(148) RKG's Halloween Sleepover III",
        url: "https://youtube.com",
        favicon: "▶️",
      },
    ];

    this.renderTabGroups();
  }

  private saveTabGroups(): void {
    localStorage.setItem("tabGroups", JSON.stringify(this.tabGroups));
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  new TabGroupsManager();
  console.log("[TabGroups] Manager initialized");
});
