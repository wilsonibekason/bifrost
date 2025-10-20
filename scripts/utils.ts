// Utility Functions

// Theme Management
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains("dark");

  if (isDark) {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }

  updateThemeIcon();
  console.log("[BiFrost] Theme toggled to:", isDark ? "light" : "dark");
}

function updateThemeIcon() {
  const html = document.documentElement;
  const isDark = html.classList.contains("dark");
  const lightIcon = document.getElementById("theme-icon-light");
  const darkIcon = document.getElementById("theme-icon-dark");

  if (lightIcon && darkIcon) {
    if (isDark) {
      lightIcon.classList.remove("hidden");
      darkIcon.classList.add("hidden");
    } else {
      lightIcon.classList.add("hidden");
      darkIcon.classList.remove("hidden");
    }
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme");

  // Default to dark mode if no preference is saved
  if (savedTheme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    document.documentElement.classList.add("dark");
  }

  updateThemeIcon();
  console.log(
    "[BiFrost] Theme initialized to:",
    savedTheme || "dark (default)"
  );
}

// Panel management
function showPanel(panelName: string) {
  console.log("[BiFrost] showPanel called with:", panelName);

  // Close main menu first
  const menu = document.getElementById("main-menu-dropdown");
  menu?.classList.add("hidden");

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
      console.log("[BiFrost] Panel loaded:", panelName);
    })
    .catch((error) => {
      console.error(`[BiFrost] Error loading panel ${panelName}:`, error);
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
  const historyDropdown = document.getElementById("history-dropdown");
  const bookmarksDropdown = document.getElementById("bookmarks-dropdown");
  const notesDropdown = document.getElementById("notes-dropdown");
  const tasksDropdown = document.getElementById("tasks-dropdown");
  const downloadsDropdown = document.getElementById("downloads-dropdown");
  const settingsDropdown = document.getElementById("settings-dropdown");

  // Close other dropdowns
  historyDropdown?.classList.add("hidden");
  bookmarksDropdown?.classList.add("hidden");
  notesDropdown?.classList.add("hidden");
  tasksDropdown?.classList.add("hidden");
  downloadsDropdown?.classList.add("hidden");
  settingsDropdown?.classList.add("hidden");

  // Toggle main menu
  menu?.classList.toggle("hidden");
  console.log("[BiFrost] Main menu toggled");
}

function toggleHistoryDropdown() {
  const dropdown = document.getElementById("history-dropdown");
  const menu = document.getElementById("main-menu-dropdown");
  const bookmarksDropdown = document.getElementById("bookmarks-dropdown");
  const notesDropdown = document.getElementById("notes-dropdown");
  const tasksDropdown = document.getElementById("tasks-dropdown");
  const downloadsDropdown = document.getElementById("downloads-dropdown");
  const settingsDropdown = document.getElementById("settings-dropdown");

  if (!dropdown) {
    console.error("[BiFrost] History dropdown not found");
    return;
  }

  // Close other dropdowns
  menu?.classList.add("hidden");
  bookmarksDropdown?.classList.add("hidden");
  notesDropdown?.classList.add("hidden");
  tasksDropdown?.classList.add("hidden");
  downloadsDropdown?.classList.add("hidden");
  settingsDropdown?.classList.add("hidden");

  // Toggle history dropdown
  dropdown.classList.toggle("hidden");
  console.log("[BiFrost] History dropdown toggled");
}

function toggleBookmarksDropdown() {
  const dropdown = document.getElementById("bookmarks-dropdown");
  const menu = document.getElementById("main-menu-dropdown");
  const historyDropdown = document.getElementById("history-dropdown");
  const notesDropdown = document.getElementById("notes-dropdown");
  const tasksDropdown = document.getElementById("tasks-dropdown");
  const downloadsDropdown = document.getElementById("downloads-dropdown");
  const settingsDropdown = document.getElementById("settings-dropdown");

  if (!dropdown) {
    console.error("[BiFrost] Bookmarks dropdown not found");
    return;
  }

  // Close other dropdowns (including main menu)
  menu?.classList.add("hidden");
  historyDropdown?.classList.add("hidden");
  notesDropdown?.classList.add("hidden");
  tasksDropdown?.classList.add("hidden");
  downloadsDropdown?.classList.add("hidden");
  settingsDropdown?.classList.add("hidden");

  // Toggle bookmarks dropdown
  dropdown.classList.toggle("hidden");
  console.log("[BiFrost] Bookmarks dropdown toggled");
}

function toggleNotesDropdown() {
  const dropdown = document.getElementById("notes-dropdown");
  const menu = document.getElementById("main-menu-dropdown");
  const historyDropdown = document.getElementById("history-dropdown");
  const bookmarksDropdown = document.getElementById("bookmarks-dropdown");
  const tasksDropdown = document.getElementById("tasks-dropdown");
  const downloadsDropdown = document.getElementById("downloads-dropdown");
  const settingsDropdown = document.getElementById("settings-dropdown");

  if (!dropdown) {
    console.error("[BiFrost] Notes dropdown not found");
    return;
  }

  // Close other dropdowns (including main menu)
  menu?.classList.add("hidden");
  historyDropdown?.classList.add("hidden");
  bookmarksDropdown?.classList.add("hidden");
  tasksDropdown?.classList.add("hidden");
  downloadsDropdown?.classList.add("hidden");
  settingsDropdown?.classList.add("hidden");

  // Toggle notes dropdown
  dropdown.classList.toggle("hidden");
  console.log("[BiFrost] Notes dropdown toggled");
}

function toggleTasksDropdown() {
  const dropdown = document.getElementById("tasks-dropdown");
  const menu = document.getElementById("main-menu-dropdown");
  const historyDropdown = document.getElementById("history-dropdown");
  const bookmarksDropdown = document.getElementById("bookmarks-dropdown");
  const notesDropdown = document.getElementById("notes-dropdown");
  const downloadsDropdown = document.getElementById("downloads-dropdown");
  const settingsDropdown = document.getElementById("settings-dropdown");

  if (!dropdown) {
    console.error("[BiFrost] Tasks dropdown not found");
    return;
  }

  // Close other dropdowns (including main menu)
  menu?.classList.add("hidden");
  historyDropdown?.classList.add("hidden");
  bookmarksDropdown?.classList.add("hidden");
  notesDropdown?.classList.add("hidden");
  downloadsDropdown?.classList.add("hidden");
  settingsDropdown?.classList.add("hidden");

  // Toggle tasks dropdown
  dropdown.classList.toggle("hidden");
  console.log("[BiFrost] Tasks dropdown toggled");
}

function toggleDownloadsDropdown() {
  const dropdown = document.getElementById("downloads-dropdown");
  const menu = document.getElementById("main-menu-dropdown");
  const historyDropdown = document.getElementById("history-dropdown");
  const bookmarksDropdown = document.getElementById("bookmarks-dropdown");
  const notesDropdown = document.getElementById("notes-dropdown");
  const tasksDropdown = document.getElementById("tasks-dropdown");
  const settingsDropdown = document.getElementById("settings-dropdown");

  if (!dropdown) {
    console.error("[BiFrost] Downloads dropdown not found");
    return;
  }

  // Close other dropdowns (including main menu)
  menu?.classList.add("hidden");
  historyDropdown?.classList.add("hidden");
  bookmarksDropdown?.classList.add("hidden");
  notesDropdown?.classList.add("hidden");
  tasksDropdown?.classList.add("hidden");
  settingsDropdown?.classList.add("hidden");

  // Toggle downloads dropdown
  dropdown.classList.toggle("hidden");
  console.log("[BiFrost] Downloads dropdown toggled");
}

function toggleSettingsDropdown() {
  const dropdown = document.getElementById("settings-dropdown");
  const menu = document.getElementById("main-menu-dropdown");
  const historyDropdown = document.getElementById("history-dropdown");
  const bookmarksDropdown = document.getElementById("bookmarks-dropdown");
  const notesDropdown = document.getElementById("notes-dropdown");
  const tasksDropdown = document.getElementById("tasks-dropdown");
  const downloadsDropdown = document.getElementById("downloads-dropdown");

  if (!dropdown) {
    console.error("[BiFrost] Settings dropdown not found");
    return;
  }

  // Close other dropdowns (including main menu)
  menu?.classList.add("hidden");
  historyDropdown?.classList.add("hidden");
  bookmarksDropdown?.classList.add("hidden");
  notesDropdown?.classList.add("hidden");
  tasksDropdown?.classList.add("hidden");
  downloadsDropdown?.classList.add("hidden");

  // Toggle settings dropdown
  dropdown.classList.toggle("hidden");
  console.log("[BiFrost] Settings dropdown toggled");
}

function closeAllDropdowns() {
  document.querySelectorAll('[id$="-dropdown"]').forEach((dropdown) => {
    dropdown.classList.add("hidden");
  });
  console.log("[BiFrost] All dropdowns closed");
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
(window as any).toggleTheme = toggleTheme;
(window as any).showPanel = showPanel;
(window as any).hidePanel = hidePanel;
(window as any).toggleMainMenu = toggleMainMenu;
(window as any).toggleHistoryDropdown = toggleHistoryDropdown;
(window as any).toggleBookmarksDropdown = toggleBookmarksDropdown;
(window as any).toggleNotesDropdown = toggleNotesDropdown;
(window as any).toggleTasksDropdown = toggleTasksDropdown;
(window as any).toggleDownloadsDropdown = toggleDownloadsDropdown;
(window as any).toggleSettingsDropdown = toggleSettingsDropdown;
(window as any).closeAllDropdowns = closeAllDropdowns;
(window as any).addToHistory = addToHistory;
(window as any).addBookmark = addBookmark;

// Close dropdowns and panels when clicking outside
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  const menu = document.getElementById("main-menu-dropdown");
  const historyDropdown = document.getElementById("history-dropdown");
  const bookmarksDropdown = document.getElementById("bookmarks-dropdown");
  const notesDropdown = document.getElementById("notes-dropdown");
  const tasksDropdown = document.getElementById("tasks-dropdown");
  const downloadsDropdown = document.getElementById("downloads-dropdown");
  const settingsDropdown = document.getElementById("settings-dropdown");
  const panelsContainer = document.getElementById("overlay-panels");

  // Check if click is on a toggle button
  const menuButton = target.closest('[onclick*="toggleMainMenu"]');
  const historyButton = target.closest('[onclick*="toggleHistoryDropdown"]');
  const bookmarksButton = target.closest(
    '[onclick*="toggleBookmarksDropdown"]'
  );
  const notesButton = target.closest('[onclick*="toggleNotesDropdown"]');
  const tasksButton = target.closest('[onclick*="toggleTasksDropdown"]');
  const downloadsButton = target.closest(
    '[onclick*="toggleDownloadsDropdown"]'
  );
  const settingsButton = target.closest('[onclick*="toggleSettingsDropdown"]');
  const panelButton = target.closest('[onclick*="showPanel"]');

  // Close main menu if clicked outside
  if (!menuButton && menu && !menu.contains(target)) {
    menu.classList.add("hidden");
  }

  // Close history dropdown if clicked outside
  if (!historyButton && historyDropdown && !historyDropdown.contains(target)) {
    historyDropdown.classList.add("hidden");
  }

  // Close bookmarks dropdown if clicked outside
  if (
    !bookmarksButton &&
    bookmarksDropdown &&
    !bookmarksDropdown.contains(target)
  ) {
    bookmarksDropdown.classList.add("hidden");
  }

  // Close notes dropdown if clicked outside
  if (!notesButton && notesDropdown && !notesDropdown.contains(target)) {
    notesDropdown.classList.add("hidden");
  }

  // Close tasks dropdown if clicked outside
  if (!tasksButton && tasksDropdown && !tasksDropdown.contains(target)) {
    tasksDropdown.classList.add("hidden");
  }

  // Close downloads dropdown if clicked outside
  if (
    !downloadsButton &&
    downloadsDropdown &&
    !downloadsDropdown.contains(target)
  ) {
    downloadsDropdown.classList.add("hidden");
  }

  // Close settings dropdown if clicked outside
  if (
    !settingsButton &&
    settingsDropdown &&
    !settingsDropdown.contains(target)
  ) {
    settingsDropdown.classList.add("hidden");
  }

  // Close panels if clicked outside
  if (!panelButton && panelsContainer && !panelsContainer.contains(target)) {
    hidePanel();
  }
});

// Close dropdowns and panels when pressing Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" || event.key === "Esc") {
    console.log(
      "[BiFrost] Escape key pressed - closing all dropdowns and panels"
    );

    const menu = document.getElementById("main-menu-dropdown");
    const historyDropdown = document.getElementById("history-dropdown");
    const bookmarksDropdown = document.getElementById("bookmarks-dropdown");
    const notesDropdown = document.getElementById("notes-dropdown");
    const tasksDropdown = document.getElementById("tasks-dropdown");
    const downloadsDropdown = document.getElementById("downloads-dropdown");
    const settingsDropdown = document.getElementById("settings-dropdown");

    // Close all dropdowns
    menu?.classList.add("hidden");
    historyDropdown?.classList.add("hidden");
    bookmarksDropdown?.classList.add("hidden");
    notesDropdown?.classList.add("hidden");
    tasksDropdown?.classList.add("hidden");
    downloadsDropdown?.classList.add("hidden");
    settingsDropdown?.classList.add("hidden");

    // Close panels
    hidePanel();
  }
});

// Initialize theme when the page loads
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", initializeTheme);
}
