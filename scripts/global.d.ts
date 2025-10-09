// Global type declarations for window extensions

interface Window {
  //   tabManager: import("./tabs").TabManager;
  tabManager: import("./tabs").TabManager | undefined;
  createNewTab: () => void;
}
