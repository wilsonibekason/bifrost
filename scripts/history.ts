interface HistoryItem {
  id: string;
  title: string;
  url: string;
  favicon: string;
  timestamp: number;
  domain: string;
}

interface GroupedHistory {
  [key: string]: HistoryItem[];
}

class HistoryManager {
  private historyData: HistoryItem[] = [];
  private filteredData: HistoryItem[] = [];
  private searchInput: HTMLInputElement | null = null;
  private historyContainer: HTMLElement | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    console.log("[History] Initializing HistoryManager");
    this.searchInput = document.getElementById(
      "searchInput"
    ) as HTMLInputElement;
    this.historyContainer = document.getElementById(
      "historyContainer"
    ) as HTMLElement;

    this.loadHistory();
    this.attachEventListeners();
    this.render();
  }

  private attachEventListeners(): void {
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => this.handleSearch(e));
    }
  }

  private loadHistory(): void {
    this.historyData = [
      {
        id: "1",
        title: "(148) RKO's Halloween Sleepover III- Outlast Whistleblower",
        url: "https://youtube.com/channel/UCVUkUlNKHeFVilRkxdaOA",
        favicon: "▶",
        timestamp: Date.now() - 5 * 60 * 60 * 1000,
        domain: "youtube",
      },
      {
        id: "2",
        title:
          "Dribbble - Discover the World's Top Designers & Creative Professionals",
        url: "https://www.tiktok.com/@_hinyaa?_t=8UZmHfOvV6w8_z=1",
        favicon: "◉",
        timestamp: Date.now() - 5 * 60 * 60 * 1000,
        domain: "dribbble",
      },
      {
        id: "3",
        title: "Spotify - Web Player: Music for Everyone",
        url: "https://www.spotify.com",
        favicon: "♪",
        timestamp: Date.now() - 5 * 60 * 60 * 1000,
        domain: "spotify",
      },
      {
        id: "4",
        title: "(3) Feed - LinkedIn",
        url: "https://www.tiktok.com/@yihimmm?lang=vi-VN",
        favicon: "in",
        timestamp: Date.now() - 5 * 60 * 60 * 1000,
        domain: "linkedin",
      },
      {
        id: "5",
        title: "Netflix Nigeria - Watch Tv Shows Online,Watch Movies Online",
        url: "https://www.netflix.com",
        favicon: "N",
        timestamp: Date.now() - 5 * 60 * 60 * 1000,
        domain: "netflix",
      },
      {
        id: "6",
        title: "Janrick II Laced Leather Platform Boots in...",
        url: "https://www.youtube.com/watch?v=ueqGCUyFjg",
        favicon: "▶",
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        domain: "youtube",
      },
      {
        id: "7",
        title: "(148) RKO's Halloween Sleepover III- Outlast Whistleblower",
        url: "https://www.youtube.com/watch?v=e8eaRMTZGPU",
        favicon: "▶",
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        domain: "youtube",
      },
      {
        id: "8",
        title:
          "Dribbble - Discover the World's Top Designers & Creative Professionals",
        url: "https://www.tiktok.com/@_hinyaa?_t=8UZmHfOvV6w8_z=1",
        favicon: "◉",
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        domain: "dribbble",
      },
      {
        id: "9",
        title: "(3) Feed - LinkedIn",
        url: "https://www.tiktok.com/@yihimmm?lang=vi-VN",
        favicon: "in",
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        domain: "linkedin",
      },
      {
        id: "10",
        title: "Spotify - Web Player: Music for Everyone",
        url: "https://www.spotify.com",
        favicon: "♪",
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        domain: "spotify",
      },
      {
        id: "11",
        title: "(922) SPOOKIES: Until Dawn - Ep.1",
        url: "https://www.youtube.com/watch?v=am2K2R08GiA&t=98s",
        favicon: "▶",
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        domain: "youtube",
      },
      {
        id: "12",
        title: "Netflix Nigeria - Watch Tv Shows Online,Watch Movies Online",
        url: "https://www.netflix.com",
        favicon: "N",
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        domain: "netflix",
      },
    ];

    this.filteredData = [...this.historyData];
    console.log("[History] Loaded", this.historyData.length, "history items");
  }

  private handleSearch(e: Event): void {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    console.log("[History] Searching for:", query);

    if (!query) {
      this.filteredData = [...this.historyData];
    } else {
      this.filteredData = this.historyData.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.url.toLowerCase().includes(query)
      );
    }

    this.render();
  }

  private groupByDate(items: HistoryItem[]): GroupedHistory {
    const grouped: GroupedHistory = {};
    const now = new Date();

    items.forEach((item) => {
      const itemDate = new Date(item.timestamp);
      let groupKey = "";

      if (this.isToday(itemDate, now)) {
        groupKey = "Today";
      } else if (this.isYesterday(itemDate, now)) {
        groupKey = "Yesterday";
      } else {
        const options: Intl.DateTimeFormatOptions = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        groupKey = itemDate.toLocaleDateString("en-US", options);
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(item);
    });

    return grouped;
  }

  private isToday(date: Date, now: Date): boolean {
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  private isYesterday(date: Date, now: Date): boolean {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  }

  private formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  private render(): void {
    if (!this.historyContainer) return;

    if (this.filteredData.length === 0) {
      this.historyContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-title">No history found</div>
          <div class="empty-description">Your browsing history will appear here</div>
        </div>
      `;
      return;
    }

    const grouped = this.groupByDate(this.filteredData);
    let html = "";

    Object.entries(grouped).forEach(([groupKey, items]) => {
      html += `<div class="history-group">`;
      html += `<div class="group-title">${groupKey}</div>`;

      items.forEach((item) => {
        const timeAgo = this.formatTimeAgo(item.timestamp);
        const faviconClass = `favicon ${item.domain}`;

        html += `
          <div class="history-item" data-id="${item.id}">
            <div class="${faviconClass}">${item.favicon}</div>
            <div class="item-content">
              <div class="item-title">${this.escapeHtml(item.title)}</div>
              <div class="item-url">${this.escapeHtml(item.url)}</div>
            </div>
            <div class="item-time">${timeAgo}</div>
            <button class="delete-btn" data-id="${item.id}">×</button>
          </div>
        `;
      });

      html += `</div>`;
    });

    this.historyContainer.innerHTML = html;
    this.attachDeleteListeners();
  }

  private attachDeleteListeners(): void {
    const deleteButtons =
      this.historyContainer?.querySelectorAll(".delete-btn");
    deleteButtons?.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).getAttribute("data-id");
        if (id) this.deleteItem(id);
      });
    });
  }

  private deleteItem(id: string): void {
    console.log("[History] Deleting item:", id);
    this.historyData = this.historyData.filter((item) => item.id !== id);
    this.filteredData = this.filteredData.filter((item) => item.id !== id);
    this.render();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new HistoryManager();
});
