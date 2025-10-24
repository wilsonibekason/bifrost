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

  // Load note content when opening
  if (!dropdown.classList.contains("hidden")) {
    loadNote();
  } else {
    // Save note content when closing
    saveNote();
  }

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

  // Render tasks when opening
  if (!dropdown.classList.contains("hidden")) {
    renderTasks();
  }

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

// Tasks Management
let tasks: Array<{ id: number; text: string; completed: boolean }> = [];

function addTask() {
  const input = document.getElementById("task-input") as HTMLInputElement;
  if (!input) {
    console.error("[BiFrost] Task input not found");
    return;
  }

  const text = input.value.trim();

  if (text) {
    tasks.push({
      id: Date.now(),
      text: text,
      completed: false,
    });
    input.value = "";
    renderTasks();
    console.log("[BiFrost] Task added:", text);
  }
}

function toggleTask(id: number) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    renderTasks();
    console.log("[BiFrost] Task toggled:", id);
  }
}

function deleteTask(id: number) {
  tasks = tasks.filter((t) => t.id !== id);
  renderTasks();
  console.log("[BiFrost] Task deleted:", id);
}

function renderTasks() {
  const list = document.getElementById("tasks-list");
  const empty = document.getElementById("tasks-empty");

  if (!list || !empty) {
    console.error("[BiFrost] Tasks list or empty state not found");
    return;
  }

  if (tasks.length === 0) {
    list.classList.add("hidden");
    empty.classList.remove("hidden");
  } else {
    list.classList.remove("hidden");
    empty.classList.add("hidden");

    list.innerHTML = tasks
      .map(
        (task) => `
      <div class="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition group">
        <button
          onclick="toggleTask(${task.id})"
          class="flex-shrink-0 w-4 h-4 border-2 ${
            task.completed
              ? "bg-zinc-900 border-zinc-900"
              : "border-zinc-300 dark:border-zinc-600"
          } rounded flex items-center justify-center"
        >
          ${
            task.completed
              ? '<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>'
              : ""
          }
        </button>
        <div class="flex-1 min-w-0">
          <p class="text-sm ${
            task.completed
              ? "line-through text-zinc-400"
              : "text-zinc-900 dark:text-white"
          } font-medium truncate">
            ${task.text}
          </p>
        </div>
        <button
          onclick="deleteTask(${task.id})"
          class="flex-shrink-0 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    `
      )
      .join("");
  }
}

// Notes Management
let noteContent = "";

function saveNote() {
  const textarea = document.getElementById(
    "note-textarea"
  ) as HTMLTextAreaElement;
  if (textarea) {
    noteContent = textarea.value;
    console.log("[BiFrost] Note saved");
  }
}

function loadNote() {
  const textarea = document.getElementById(
    "note-textarea"
  ) as HTMLTextAreaElement;
  if (textarea) {
    textarea.value = noteContent;
    updateCharCount();
    console.log("[BiFrost] Note loaded");
  }
}

function clearNote() {
  if (confirm("Are you sure you want to clear this note?")) {
    const textarea = document.getElementById(
      "note-textarea"
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = "";
      noteContent = "";
      updateCharCount();
      console.log("[BiFrost] Note cleared");
    }
  }
}

function updateCharCount() {
  const textarea = document.getElementById(
    "note-textarea"
  ) as HTMLTextAreaElement;
  const count = document.getElementById("char-count");

  if (textarea && count) {
    count.textContent = `${textarea.value.length} characters`;
  }
}

function initializeNotesTextarea() {
  const textarea = document.getElementById(
    "note-textarea"
  ) as HTMLTextAreaElement;
  if (textarea) {
    textarea.addEventListener("input", updateCharCount);
    console.log("[BiFrost] Notes textarea initialized");
  }
}

// Account Management
let userEmail = "";

function toggleCreateAccountDropdown() {
  const dropdown = document.getElementById("create-account-dropdown");
  const menu = document.getElementById("main-menu-dropdown");

  if (!dropdown) {
    console.error("[BiFrost] Create account dropdown not found");
    return;
  }

  // Close main menu
  menu?.classList.add("hidden");

  // Toggle create account dropdown
  dropdown.classList.toggle("hidden");

  // Clear email input and error when opening
  if (!dropdown.classList.contains("hidden")) {
    const emailInput = document.getElementById(
      "create-account-email"
    ) as HTMLInputElement;
    const emailError = document.getElementById("email-error");
    if (emailInput) emailInput.value = "";
    if (emailError) emailError.classList.add("hidden");
  }

  console.log("[BiFrost] Create account dropdown toggled");
}

function toggleVerifyEmailDropdown() {
  const dropdown = document.getElementById("verify-email-dropdown");

  if (!dropdown) {
    console.error("[BiFrost] Verify email dropdown not found");
    return;
  }

  // Toggle verify email dropdown
  dropdown.classList.toggle("hidden");

  // Clear OTP inputs and error when opening
  if (!dropdown.classList.contains("hidden")) {
    const otpInputs = document.querySelectorAll(
      ".otp-input"
    ) as NodeListOf<HTMLInputElement>;
    otpInputs.forEach((input) => (input.value = ""));
    const otpError = document.getElementById("otp-error");
    if (otpError) otpError.classList.add("hidden");

    // Initialize OTP inputs NOW (when dropdown is visible)
    initializeOTPInputs();

    // Focus first input
    setTimeout(() => {
      if (otpInputs[0]) otpInputs[0].focus();
    }, 50);
  }

  console.log("[BiFrost] Verify email dropdown toggled");
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function handleCreateAccount() {
  const emailInput = document.getElementById(
    "create-account-email"
  ) as HTMLInputElement;
  const emailError = document.getElementById("email-error");

  if (!emailInput || !emailError) {
    console.error("[BiFrost] Email input or error element not found");
    return;
  }

  const email = emailInput.value.trim();

  // Validate email
  if (!email || !validateEmail(email)) {
    emailError.classList.remove("hidden");
    emailInput.focus();
    console.log("[BiFrost] Invalid email entered");
    return;
  }

  // Hide error if visible
  emailError.classList.add("hidden");

  // Store email
  userEmail = email;

  console.log("[BiFrost] Email validated:", email);

  // Update verify email display
  const emailDisplay = document.getElementById("verify-email-display");
  if (emailDisplay) {
    emailDisplay.textContent = email;
    console.log("[BiFrost] Email display updated");
  }

  // Close create account dropdown
  const createAccountDropdown = document.getElementById(
    "create-account-dropdown"
  );
  if (createAccountDropdown) {
    createAccountDropdown.classList.add("hidden");
    console.log("[BiFrost] Create account dropdown closed");
  }

  // Open verify email dropdown with a small delay
  setTimeout(() => {
    const verifyDropdown = document.getElementById("verify-email-dropdown");
    console.log("[BiFrost] Verify dropdown element:", verifyDropdown);

    if (verifyDropdown) {
      verifyDropdown.classList.remove("hidden");
      console.log("[BiFrost] Verify email dropdown opened");

      // Clear OTP inputs
      const otpInputs = document.querySelectorAll(
        ".otp-input"
      ) as NodeListOf<HTMLInputElement>;
      console.log("[BiFrost] OTP inputs found:", otpInputs.length);
      otpInputs.forEach((input) => (input.value = ""));

      // Initialize OTP inputs to attach event listeners
      initializeOTPInputs();

      // Focus first input with another small delay
      setTimeout(() => {
        if (otpInputs[0]) {
          otpInputs[0].focus();
          console.log("[BiFrost] First OTP input focused");
        }
      }, 100);
    } else {
      console.error("[BiFrost] Verify email dropdown not found in DOM!");
    }
  }, 100);

  console.log("[BiFrost] Account creation initiated for:", email);
}

function handleVerifyEmail() {
  const otpInputs = document.querySelectorAll(
    ".otp-input"
  ) as NodeListOf<HTMLInputElement>;
  const otpError = document.getElementById("otp-error");

  if (!otpError) {
    console.error("[BiFrost] OTP error element not found");
    return;
  }

  // Collect OTP values
  let otp = "";
  otpInputs.forEach((input) => {
    otp += input.value.trim();
  });

  // Validate OTP (must be 6 digits)
  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    otpError.classList.remove("hidden");
    otpInputs[0]?.focus();
    console.log("[BiFrost] Invalid OTP entered");
    return;
  }

  // Hide error if visible
  otpError.classList.add("hidden");

  // Close verify email dropdown
  const verifyDropdown = document.getElementById("verify-email-dropdown");
  if (verifyDropdown) {
    verifyDropdown.classList.add("hidden");
  }

  console.log(
    "[BiFrost] Email verified successfully for:",
    userEmail,
    "with OTP:",
    otp
  );

  // Here you would typically send the OTP to your backend for verification
  // For now, just log success
  alert("Email verified successfully!");
}

function initializeOTPInputs() {
  const otpInputs = document.querySelectorAll(
    ".otp-input"
  ) as NodeListOf<HTMLInputElement>;

  if (otpInputs.length === 0) {
    console.log("[BiFrost] No OTP inputs found");
    return;
  }

  console.log("[BiFrost] Initializing", otpInputs.length, "OTP inputs");

  // Create a new array to hold the fresh inputs
  const freshInputs: HTMLInputElement[] = [];

  otpInputs.forEach((input, index) => {
    // Clone the input to remove all existing event listeners
    const newInput = input.cloneNode(true) as HTMLInputElement;
    input.parentNode?.replaceChild(newInput, input);
    freshInputs.push(newInput);
  });

  // Now add event listeners to the fresh inputs
  freshInputs.forEach((input, index) => {
    // Only allow numbers - input event
    input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      const value = target.value.replace(/[^0-9]/g, "");
      target.value = value;

      console.log("[BiFrost] Input in field", index, ":", value);

      // Auto-advance to next field
      if (value.length === 1 && index < freshInputs.length - 1) {
        console.log("[BiFrost] Moving to field", index + 1);
        freshInputs[index + 1].focus();
        freshInputs[index + 1].select();
      }
    });

    // Handle keydown for backspace and navigation
    input.addEventListener("keydown", (e) => {
      const target = e.target as HTMLInputElement;

      if (e.key === "Backspace") {
        if (!target.value && index > 0) {
          e.preventDefault();
          freshInputs[index - 1].focus();
          freshInputs[index - 1].select();
        }
      }

      if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        freshInputs[index - 1].focus();
        freshInputs[index - 1].select();
      }

      if (e.key === "ArrowRight" && index < freshInputs.length - 1) {
        e.preventDefault();
        freshInputs[index + 1].focus();
        freshInputs[index + 1].select();
      }
    });

    // Handle paste
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData?.getData("text") || "";
      const digits = pastedData.replace(/[^0-9]/g, "").slice(0, 6);

      digits.split("").forEach((digit, i) => {
        if (freshInputs[index + i]) {
          freshInputs[index + i].value = digit;
        }
      });

      const nextIndex = Math.min(index + digits.length, freshInputs.length - 1);
      freshInputs[nextIndex]?.focus();
      freshInputs[nextIndex]?.select();
    });

    // Handle focus
    input.addEventListener("focus", () => {
      setTimeout(() => input.select(), 0);
    });
  });

  console.log("[BiFrost] OTP inputs initialized successfully");
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

// Export Tasks functions
(window as any).addTask = addTask;
(window as any).toggleTask = toggleTask;
(window as any).deleteTask = deleteTask;
(window as any).renderTasks = renderTasks;

// Export Notes functions
(window as any).saveNote = saveNote;
(window as any).loadNote = loadNote;
(window as any).clearNote = clearNote;
(window as any).updateCharCount = updateCharCount;

// Export Account functions
(window as any).toggleCreateAccountDropdown = toggleCreateAccountDropdown;
(window as any).toggleVerifyEmailDropdown = toggleVerifyEmailDropdown;
(window as any).handleCreateAccount = handleCreateAccount;
(window as any).handleVerifyEmail = handleVerifyEmail;

// Export close button handlers (aliases for consistency)
(window as any).toggleQuickNote = toggleNotesDropdown;
(window as any).toggleTasks = toggleTasksDropdown;

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
  const createAccountDropdown = document.getElementById(
    "create-account-dropdown"
  );
  const verifyEmailDropdown = document.getElementById("verify-email-dropdown");
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
  const createAccountButton = target.closest(
    '[onclick*="toggleCreateAccountDropdown"]'
  );
  const verifyEmailButton = target.closest(
    '[onclick*="toggleVerifyEmailDropdown"]'
  );
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

  // Close notes dropdown if clicked outside (and save content)
  if (!notesButton && notesDropdown && !notesDropdown.contains(target)) {
    if (!notesDropdown.classList.contains("hidden")) {
      saveNote();
    }
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

  // Close create account dropdown if clicked outside
  if (
    !createAccountButton &&
    createAccountDropdown &&
    !createAccountDropdown.contains(target)
  ) {
    createAccountDropdown.classList.add("hidden");
  }

  // Close verify email dropdown if clicked outside
  if (
    !verifyEmailButton &&
    verifyEmailDropdown &&
    !verifyEmailDropdown.contains(target)
  ) {
    verifyEmailDropdown.classList.add("hidden");
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
    const createAccountDropdown = document.getElementById(
      "create-account-dropdown"
    );
    const verifyEmailDropdown = document.getElementById(
      "verify-email-dropdown"
    );

    // Save note before closing
    if (notesDropdown && !notesDropdown.classList.contains("hidden")) {
      saveNote();
    }

    // Close all dropdowns
    menu?.classList.add("hidden");
    historyDropdown?.classList.add("hidden");
    bookmarksDropdown?.classList.add("hidden");
    notesDropdown?.classList.add("hidden");
    tasksDropdown?.classList.add("hidden");
    downloadsDropdown?.classList.add("hidden");
    settingsDropdown?.classList.add("hidden");
    createAccountDropdown?.classList.add("hidden");
    verifyEmailDropdown?.classList.add("hidden");

    // Close panels
    hidePanel();
  }
});

// Handle Enter key in task input
document.addEventListener("keypress", (event) => {
  const target = event.target as HTMLElement;

  if (event.key === "Enter" && target.id === "task-input") {
    addTask();
  }
});

// Initialize theme, notes textarea, and OTP inputs when the page loads
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    initializeNotesTextarea();
    // initializeOTPInputs();
  });
}
