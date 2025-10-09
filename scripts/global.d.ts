// Global type declarations for window extensions

interface Window {
  tabManager: import("./tabs").TabManager;
  createNewTab: () => void;
}
