// TOOLBAR MANAGER FOR BROWSER SEARCH AND AUTOCOMPLETE
interface SearchSuggestion {
  type: "bookmark" | "history" | "suggestion";
  title: string;
  url: string;
  icon?: string;
  iconBg?: string;
}

interface SearchHistory {
  query: string;
  timestamp: number;
}

export class ToolbarManager {
  private readonly STORAGE_KEY = "searchHistory";
  private readonly MAX_HISTORY = 10;
  private readonly MAX_SUGGESTIONS = 7;
  private searchHistory: SearchHistory[] = [];
  private mockBookmarks: SearchSuggestion[] = [];
  private mockHistory: SearchSuggestion[] = [];
  private debounceTimer: number | null = null;

  constructor() {
    this.loadSearchHistory();
    this.initializeMockData();
    this.initializeEventListeners();
  }

  private initializeMockData(): void {
    // Mock bookmarks data
    this.mockBookmarks = [
      {
        type: "bookmark",
        title: "(148) RKG's Halloween Sleepover - Outla...",
        url: "youtube.com",
        icon: "Y",
        iconBg: "#FF0000",
      },
      {
        type: "bookmark",
        title: "Dribbble - Discover the World's Top Desig...",
        url: "dribbble.com",
        icon: "D",
        iconBg: "#EA4C89",
      },
      {
        type: "bookmark",
        title: "Spotify - Web Player: Music for Everyone...",
        url: "spotify.com",
        icon: "S",
        iconBg: "#1DB954",
      },
    ];

    // Mock history data
    this.mockHistory = [
      {
        type: "history",
        title: "(148) RKG's Halloween Sleepover - Outla...",
        url: "youtube.com",
        icon: "Y",
        iconBg: "#FF0000",
      },
      {
        type: "history",
        title: "Dribbble - Discover the World's Top Desig...",
        url: "dribbble.com",
        icon: "D",
        iconBg: "#EA4C89",
      },
      {
        type: "history",
        title: "Spotify - Web Player: Music for Everyone...",
        url: "open.spotify.com",
        icon: "S",
        iconBg: "#1DB954",
      },
    ];
  }

  private loadSearchHistory(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.searchHistory = JSON.parse(stored);
      } catch (error) {
        console.error("[Toolbar] Error loading search history:", error);
        this.searchHistory = [];
      }
    }
  }

  private saveSearchHistory(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.searchHistory));
  }

  private addToSearchHistory(query: string): void {
    // Remove duplicate if exists
    this.searchHistory = this.searchHistory.filter(
      (item) => item.query !== query
    );

    // Add new query at the beginning
    this.searchHistory.unshift({
      query,
      timestamp: Date.now(),
    });

    // Keep only MAX_HISTORY items
    if (this.searchHistory.length > this.MAX_HISTORY) {
      this.searchHistory = this.searchHistory.slice(0, this.MAX_HISTORY);
    }

    this.saveSearchHistory();
  }

  private initializeEventListeners(): void {
    const searchInput = document.getElementById(
      "address-bar"
    ) as HTMLInputElement;

    if (!searchInput) {
      console.error("[Toolbar] Search input not found");
      return;
    }

    // Input event for autocomplete
    searchInput.addEventListener("input", (e) => {
      const value = (e.target as HTMLInputElement).value;
      this.handleSearchInput(value);
    });

    // Focus event to show dropdown
    searchInput.addEventListener("focus", (e) => {
      const value = (e.target as HTMLInputElement).value;
      if (value) {
        this.handleSearchInput(value);
      }
    });

    // Keydown for navigation and selection
    searchInput.addEventListener("keydown", (e) => {
      this.handleKeyDown(e);
    });

    // Click outside to close dropdown
    document.addEventListener("click", (e) => {
      const dropdown = document.getElementById("search-dropdown");
      if (
        dropdown &&
        !dropdown.contains(e.target as Node) &&
        e.target !== searchInput
      ) {
        this.hideDropdown();
      }
    });

    console.log("[Toolbar] Event listeners initialized");
  }

  private handleSearchInput(query: string): void {
    // Debounce the search
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      if (query.trim().length === 0) {
        this.hideDropdown();
        return;
      }

      const suggestions = this.getSuggestions(query);
      this.showDropdown(suggestions);
    }, 150);
  }

  private getSuggestions(query: string): SearchSuggestion[] {
    const lowerQuery = query.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Filter bookmarks
    const bookmarkMatches = this.mockBookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(lowerQuery) ||
        bookmark.url.toLowerCase().includes(lowerQuery)
    );
    suggestions.push(...bookmarkMatches);

    // Filter history
    const historyMatches = this.mockHistory.filter(
      (history) =>
        history.title.toLowerCase().includes(lowerQuery) ||
        history.url.toLowerCase().includes(lowerQuery)
    );
    suggestions.push(...historyMatches);

    // Add search suggestions based on history
    const searchSuggestions = this.searchHistory
      .filter((item) => item.query.toLowerCase().includes(lowerQuery))
      .slice(0, 4)
      .map((item) => ({
        type: "suggestion" as const,
        title: item.query,
        url: "",
      }));
    suggestions.push(...searchSuggestions);

    // Limit total suggestions
    return suggestions.slice(0, this.MAX_SUGGESTIONS);
  }

  private showDropdown(suggestions: SearchSuggestion[]): void {
    let dropdown = document.getElementById("search-dropdown");

    if (!dropdown) {
      dropdown = this.createDropdown();
    }

    const html = this.generateDropdownHTML(suggestions);
    dropdown.innerHTML = html;
    dropdown.classList.remove("hidden");

    // Add click handlers to suggestion items
    this.attachSuggestionHandlers();
  }

  private createDropdown(): HTMLElement {
    const dropdown = document.createElement("div");
    dropdown.id = "search-dropdown";
    dropdown.className =
      "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white dark:bg-zinc-800 rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-700 w-[520px] max-h-96 overflow-hidden z-50";

    const searchInput = document.getElementById("address-bar");
    if (searchInput) {
      searchInput.parentElement?.parentElement?.appendChild(dropdown);
    }

    return dropdown;
  }

  private generateDropdownHTML(suggestions: SearchSuggestion[]): string {
    if (suggestions.length === 0) {
      return `
        <div class="py-8 text-center text-zinc-400 dark:text-zinc-500 text-sm">
          No suggestions found
        </div>
      `;
    }

    const items = suggestions
      .map((suggestion, index) => {
        if (suggestion.type === "suggestion") {
          return `
          <div class="suggestion-item flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer" data-index="${index}">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-zinc-400 flex-shrink-0">
              <path d="M17.5 17.5L13.9167 13.9167M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-zinc-900 dark:text-zinc-100 font-medium truncate">${this.escapeHtml(
                suggestion.title
              )}</p>
            </div>
          </div>
        `;
        }

        return `
        <div class="suggestion-item flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer" data-index="${index}">
          <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-white text-xs font-semibold" style="background-color: ${
            suggestion.iconBg
          }">
            ${suggestion.icon}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-zinc-900 dark:text-zinc-100 font-medium truncate">${this.escapeHtml(
              suggestion.title
            )}</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">${this.escapeHtml(
              suggestion.url
            )}</p>
          </div>
        </div>
      `;
      })
      .join("");

    return `
      <div class="py-2 max-h-80 overflow-y-auto">
        ${items}
      </div>
    `;
  }

  private attachSuggestionHandlers(): void {
    const items = document.querySelectorAll(".suggestion-item");
    items.forEach((item, index) => {
      item.addEventListener("click", () => {
        this.handleSuggestionClick(index);
      });
    });
  }

  private handleSuggestionClick(index: number): void {
    const searchInput = document.getElementById(
      "address-bar"
    ) as HTMLInputElement;
    const dropdown = document.getElementById("search-dropdown");

    if (!searchInput || !dropdown) return;

    const query = searchInput.value;
    const suggestions = this.getSuggestions(query);
    const selectedSuggestion = suggestions[index];

    if (selectedSuggestion) {
      if (selectedSuggestion.type === "suggestion") {
        searchInput.value = selectedSuggestion.title;
        this.handleSearchInput(selectedSuggestion.title);
      } else {
        // Navigate to URL
        this.addToSearchHistory(selectedSuggestion.title);
        console.log("[Toolbar] Navigating to:", selectedSuggestion.url);
        // Here you would trigger actual navigation
        this.hideDropdown();
      }
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const dropdown = document.getElementById("search-dropdown");

    if (!dropdown || dropdown.classList.contains("hidden")) {
      if (e.key === "Enter") {
        const searchInput = e.target as HTMLInputElement;
        this.handleSearch(searchInput.value);
      }
      return;
    }

    const items = dropdown.querySelectorAll(".suggestion-item");
    const activeItem = dropdown.querySelector(
      ".suggestion-item.bg-zinc-100, .suggestion-item.dark\\:bg-zinc-600"
    );
    let currentIndex = Array.from(items).indexOf(activeItem as Element);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        currentIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        this.highlightSuggestion(items, currentIndex);
        break;
      case "ArrowUp":
        e.preventDefault();
        currentIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        this.highlightSuggestion(items, currentIndex);
        break;
      case "Enter":
        e.preventDefault();
        if (currentIndex >= 0) {
          this.handleSuggestionClick(currentIndex);
        } else {
          const searchInput = e.target as HTMLInputElement;
          this.handleSearch(searchInput.value);
        }
        break;
      case "Escape":
        this.hideDropdown();
        break;
    }
  }

  private highlightSuggestion(items: NodeListOf<Element>, index: number): void {
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add("bg-zinc-100", "dark:bg-zinc-600");
      } else {
        item.classList.remove("bg-zinc-100", "dark:bg-zinc-600");
      }
    });
  }

  private handleSearch(query: string): void {
    if (query.trim().length === 0) return;

    this.addToSearchHistory(query);
    console.log("[Toolbar] Searching for:", query);

    // Here you would trigger actual search/navigation
    this.hideDropdown();
  }

  private hideDropdown(): void {
    const dropdown = document.getElementById("search-dropdown");
    if (dropdown) {
      dropdown.classList.add("hidden");
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Public method to add bookmarks/history from external sources
  public addBookmark(bookmark: SearchSuggestion): void {
    this.mockBookmarks.push(bookmark);
  }

  public addHistoryItem(historyItem: SearchSuggestion): void {
    this.mockHistory.push(historyItem);
  }
}

// Export for manual initialization
export function initializeToolbarManager(): ToolbarManager {
  console.log("[Toolbar] Initializing ToolbarManager");
  const toolbarManager = new ToolbarManager();

  // Expose to window for debugging
  (window as any).toolbarManager = toolbarManager;

  return toolbarManager;
}
