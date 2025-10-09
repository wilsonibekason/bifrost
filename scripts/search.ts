// Search Autocomplete Logic
interface SearchSuggestion {
  type: "history" | "suggestion"
  title: string
  url?: string
  favicon?: string
}

class SearchAutocomplete {
  private addressBar: HTMLInputElement | null = null
  private dropdown: HTMLElement | null = null
  private suggestions: SearchSuggestion[] = []

  constructor() {
    this.init()
  }

  private init() {
    this.addressBar = document.getElementById("address-bar") as HTMLInputElement
    if (!this.addressBar) {
      console.log("[v0] Address bar not found, retrying...")
      setTimeout(() => this.init(), 100)
      return
    }
    this.createDropdown()
    this.setupEventListeners()
  }

  private createDropdown() {
    this.dropdown = document.createElement("div")
    this.dropdown.id = "search-autocomplete"
    this.dropdown.className =
      "hidden absolute top-full left-0 right-0 mt-2 bg-zinc-800 rounded-lg shadow-2xl border border-zinc-700 max-h-96 overflow-y-auto z-50"

    const addressBarParent = this.addressBar?.parentElement?.parentElement
    if (addressBarParent) {
      addressBarParent.style.position = "relative"
      addressBarParent.appendChild(this.dropdown)
    }
  }

  private setupEventListeners() {
    this.addressBar?.addEventListener("input", (e) => {
      const query = (e.target as HTMLInputElement).value
      if (query.length > 0) {
        this.showSuggestions(query)
      } else {
        this.hideSuggestions()
      }
    })

    this.addressBar?.addEventListener("focus", (e) => {
      const query = (e.target as HTMLInputElement).value
      if (query.length > 0) {
        this.showSuggestions(query)
      }
    })

    this.addressBar?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.handleSearch((e.target as HTMLInputElement).value)
      } else if (e.key === "Escape") {
        this.hideSuggestions()
      }
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      const addressBarContainer = this.addressBar?.parentElement?.parentElement
      if (!addressBarContainer?.contains(e.target as Node)) {
        this.hideSuggestions()
      }
    })
  }

  private async showSuggestions(query: string) {
    this.suggestions = await this.fetchSuggestions(query)
    this.renderSuggestions()
    this.dropdown?.classList.remove("hidden")
  }

  private hideSuggestions() {
    this.dropdown?.classList.add("hidden")
  }

  private async fetchSuggestions(query: string): Promise<SearchSuggestion[]> {
    // Get history from state
    const history = (window as any).atlasState?.history || []
    const historySuggestions: SearchSuggestion[] = history
      .filter(
        (item: any) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.url.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 3)
      .map((item: any) => ({
        type: "history" as const,
        title: item.title,
        url: item.url,
        favicon: item.favicon,
      }))

    const searchSuggestions: SearchSuggestion[] = [
      { type: "suggestion", title: `${query} daily post` },
      { type: "suggestion", title: `${query} daily trust` },
      { type: "suggestion", title: `${query} news` },
      { type: "suggestion", title: `${query} weather` },
    ]

    return [...historySuggestions, ...searchSuggestions]
  }

  private renderSuggestions() {
    if (!this.dropdown) return

    this.dropdown.innerHTML = `
      <div class="py-2">
        ${this.suggestions
          .map((suggestion) => {
            if (suggestion.type === "history") {
              return `
                <button class="flex items-center space-x-3 w-full px-4 py-2.5 hover:bg-zinc-700 transition text-left" data-url="${suggestion.url}">
                  <div class="flex-shrink-0 w-8 h-8 bg-zinc-700 rounded flex items-center justify-center">
                    ${
                      suggestion.favicon
                        ? `<img src="${suggestion.favicon}" class="w-4 h-4" alt="favicon" onerror="this.style.display='none'" />`
                        : `<svg class="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          </svg>`
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-zinc-100 truncate">${suggestion.title}</p>
                    <p class="text-xs text-zinc-500 truncate">${suggestion.url}</p>
                  </div>
                </button>
              `
            } else {
              return `
                <button class="flex items-center space-x-3 w-full px-4 py-2.5 hover:bg-zinc-700 transition text-left" data-query="${suggestion.title}">
                  <svg class="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <span class="text-sm text-zinc-300">${suggestion.title}</span>
                </button>
              `
            }
          })
          .join("")}
      </div>
    `

    // Add click handlers
    this.dropdown.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-url")
        const query = btn.getAttribute("data-query")
        if (url) {
          this.handleSearch(url)
        } else if (query) {
          this.handleSearch(query)
        }
      })
    })
  }

  private handleSearch(query: string) {
    console.log("[v0] Searching for:", query)

    // Check if it's a URL
    const isUrl = query.includes(".") || query.startsWith("http")
    const url = isUrl
      ? query.startsWith("http")
        ? query
        : `https://${query}`
      : `https://www.google.com/search?q=${encodeURIComponent(query)}`

    // Update active tab
    const activeTab = (window as any).tabManager?.tabs.find((t: any) => t.isActive)
    if (activeTab) {
      ;(window as any).tabManager?.updateTabUrl(activeTab.id, url)
      ;(window as any).tabManager?.updateTabTitle(activeTab.id, isUrl ? query : `Search: ${query}`)
    }

    this.hideSuggestions()

    // Add to history
    if ((window as any).addToHistory) {
      ;(window as any).addToHistory(url, isUrl ? query : `Search: ${query}`)
    }
  }
}

// Initialize search autocomplete when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const searchAutocomplete = new SearchAutocomplete()
    ;(window as any).searchAutocomplete = searchAutocomplete
  })
} else {
  const searchAutocomplete = new SearchAutocomplete()
  ;(window as any).searchAutocomplete = searchAutocomplete
}
