// Utility Functions

// Panel management
function showPanel(panelName: string) {
  const panelsContainer = document.getElementById("overlay-panels");
  if (!panelsContainer) return;

  panelsContainer.classList.remove("pointer-events-none");

  fetch(`./components/${panelName}-panel.html`)
    .then((response) => response.text())
    .then((html) => {
      panelsContainer.innerHTML = html;
      const panel = panelsContainer.querySelector(".panel");
      if (panel) {
        panel.classList.add("panel-slide-enter");
      }
    })
    .catch((error) => {
      console.error(`Error loading panel ${panelName}:`, error);
    });
}

function hidePanel() {
  const panelsContainer = document.getElementById("overlay-panels");
  if (!panelsContainer) return;

  panelsContainer.innerHTML = "";
  panelsContainer.classList.add("pointer-events-none");
}

// Dropdown management
function toggleMainMenu() {
  const menu = document.getElementById("main-menu-dropdown");
  if (!menu) return;
  menu.classList.toggle("hidden");
}

function toggleHistoryDropdown() {
  const dropdown = document.getElementById("history-dropdown");
  if (!dropdown) {
    console.error("[v0] History dropdown not found");
    return;
  }
  dropdown.classList.toggle("hidden");
  console.log("[v0] History dropdown toggled");
}

function toggleBookmarksDropdown() {
  const dropdown = document.getElementById("bookmarks-dropdown");
  if (!dropdown) {
    console.error("[v0] Bookmarks dropdown not found");
    return;
  }
  dropdown.classList.toggle("hidden");
  console.log("[v0] Bookmarks dropdown toggled");
}

function closeAllDropdowns() {
  document.querySelectorAll('[id$="-dropdown"]').forEach((dropdown) => {
    dropdown.classList.add("hidden");
  });
}

// History management
function addToHistory(url: string, title: string) {
  const history = (window as any).atlasState?.history || [];
  history.unshift({
    url,
    title,
    timestamp: new Date().toISOString(),
    favicon: getFaviconUrl(url),
  });

  // Keep only last 100 items
  if (history.length > 100) {
    history.pop();
  }

  if ((window as any).atlasState) {
    (window as any).atlasState.history = history;
  }
}

// Bookmark management
function addBookmark(url: string, title: string) {
  const bookmarks = (window as any).atlasState?.bookmarks || [];
  bookmarks.push({
    url,
    title,
    favicon: getFaviconUrl(url),
    folder: "Unsorted",
  });

  if ((window as any).atlasState) {
    (window as any).atlasState.bookmarks = bookmarks;
  }
}

// Helper functions
function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    return "";
  }
}
// Export to window for HTML onclick handlers
(window as any).showPanel = showPanel;
(window as any).hidePanel = hidePanel;
(window as any).toggleMainMenu = toggleMainMenu;
(window as any).toggleHistoryDropdown = toggleHistoryDropdown;
(window as any).toggleBookmarksDropdown = toggleBookmarksDropdown;
(window as any).addToHistory = addToHistory;
(window as any).addBookmark = addBookmark;

// Close menu when clicking outside
document.addEventListener("click", (event) => {
  const menu = document.getElementById("main-menu-dropdown");
  const menuButton = (event.target as HTMLElement).closest(
    '[onclick*="toggleMainMenu"]'
  );

  if (!menuButton && !menu?.contains(event.target as Node)) {
    menu?.classList.add("hidden");
  }

  const historyDropdown = document.getElementById("history-dropdown");
  const historyButton = (event.target as HTMLElement).closest(
    '[onclick*="toggleHistoryDropdown"]'
  );

  if (!historyButton && !historyDropdown?.contains(event.target as Node)) {
    historyDropdown?.classList.add("hidden");
  }

  const bookmarksDropdown = document.getElementById("bookmarks-dropdown");
  const bookmarksButton = (event.target as HTMLElement).closest(
    '[onclick*="toggleBookmarksDropdown"]'
  );

  if (!bookmarksButton && !bookmarksDropdown?.contains(event.target as Node)) {
    bookmarksDropdown?.classList.add("hidden");
  }
});
