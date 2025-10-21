interface SettingsState {
  privacy: {
    cookies: string;
    tracking: string;
    ads: string;
  };
  appearance: {
    brandColor: string;
    fontSize: string;
    language: string;
  };
  permissions: {
    location: string;
    microphone: string;
    camera: string;
    autoplay: string;
  };
  downloads: {
    askWhereSave: boolean;
    other: boolean;
    autoDelete: string;
  };
  searchEngine: string;
  reset: {
    allDownloads: boolean;
    browsingHistory: boolean;
    cookiesData: boolean;
    cachedFiles: boolean;
    browserSettings: boolean;
  };
}

class SettingsManager {
  private settings: SettingsState;
  private readonly STORAGE_KEY = "browserSettings";

  constructor() {
    this.settings = this.getDefaultSettings();
    this.loadSettings();
    this.initializeEventListeners();
  }

  private getDefaultSettings(): SettingsState {
    return {
      privacy: {
        cookies: "allow",
        tracking: "allow",
        ads: "allow",
      },
      appearance: {
        brandColor: "#3498DB",
        fontSize: "large",
        language: "english",
      },
      permissions: {
        location: "allow",
        microphone: "allow",
        camera: "allow",
        autoplay: "limit",
      },
      downloads: {
        askWhereSave: true,
        other: true,
        autoDelete: "one-week",
      },
      searchEngine: "google",
      reset: {
        allDownloads: false,
        browsingHistory: false,
        cookiesData: true,
        cachedFiles: true,
        browserSettings: true,
      },
    };
  }

  public loadSettings(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.settings = JSON.parse(stored);
        console.log("[Settings] Loaded settings from storage:", this.settings);
      } catch (error) {
        console.error("[Settings] Error parsing stored settings:", error);
        this.settings = this.getDefaultSettings();
      }
    }
    this.applySettingsToUI();
  }

  private saveSettings(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    console.log("[Settings] Settings saved:", this.settings);
  }

  private applySettingsToUI(): void {
    // Apply Privacy settings
    this.setRadioValue("cookies", this.settings.privacy.cookies);
    this.setRadioValue("tracking", this.settings.privacy.tracking);
    this.setRadioValue("ads", this.settings.privacy.ads);

    // Apply Appearance settings
    this.setRadioValue("font-size", this.settings.appearance.fontSize);
    this.setRadioValue("language", this.settings.appearance.language);
    this.applyBrandColor(this.settings.appearance.brandColor);

    // Apply Permissions settings
    this.setRadioValue("location", this.settings.permissions.location);
    this.setRadioValue("microphone", this.settings.permissions.microphone);
    this.setRadioValue("camera", this.settings.permissions.camera);
    this.setRadioValue("autoplay", this.settings.permissions.autoplay);

    // Apply Downloads settings
    this.setCheckboxValue(
      "ask-where-save",
      this.settings.downloads.askWhereSave
    );
    this.setCheckboxValue("other", this.settings.downloads.other);
    this.setRadioValue("auto-delete", this.settings.downloads.autoDelete);

    // Apply Search Engine settings
    this.setRadioValue("search-engine", this.settings.searchEngine);

    // Apply Reset settings
    this.setCheckboxValue("all-downloads", this.settings.reset.allDownloads);
    this.setCheckboxValue(
      "browsing-history",
      this.settings.reset.browsingHistory
    );
    this.setCheckboxValue("cookies-data", this.settings.reset.cookiesData);
    this.setCheckboxValue("cached-files", this.settings.reset.cachedFiles);
    this.setCheckboxValue(
      "browser-settings",
      this.settings.reset.browserSettings
    );
  }

  private setRadioValue(name: string, value: string): void {
    const radio = document.querySelector(
      `input[name="${name}"][value="${value}"]`
    ) as HTMLInputElement;
    if (radio) {
      radio.checked = true;
    }
  }

  private setCheckboxValue(id: string, checked: boolean): void {
    const checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = checked;
    }
  }

  private applyBrandColor(color: string): void {
    const buttons = document.querySelectorAll(".color-btn");
    buttons.forEach((btn) => {
      btn.classList.remove("selected");
      if ((btn as HTMLElement).style.backgroundColor === color) {
        btn.classList.add("selected");
      }
    });
  }

  private initializeEventListeners(): void {
    // Tab switching
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleTabSwitch(e));
    });

    // Privacy settings
    this.addRadioListener("cookies", (value) => {
      this.settings.privacy.cookies = value;
      this.saveSettings();
    });
    this.addRadioListener("tracking", (value) => {
      this.settings.privacy.tracking = value;
      this.saveSettings();
    });
    this.addRadioListener("ads", (value) => {
      this.settings.privacy.ads = value;
      this.saveSettings();
    });

    // Appearance settings
    this.addRadioListener("font-size", (value) => {
      this.settings.appearance.fontSize = value;
      this.saveSettings();
    });
    this.addRadioListener("language", (value) => {
      this.settings.appearance.language = value;
      this.saveSettings();
    });

    // Color picker
    const colorButtons = document.querySelectorAll(".color-btn");
    colorButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleColorSelection(e));
    });

    // Permissions settings
    this.addRadioListener("location", (value) => {
      this.settings.permissions.location = value;
      this.saveSettings();
    });
    this.addRadioListener("microphone", (value) => {
      this.settings.permissions.microphone = value;
      this.saveSettings();
    });
    this.addRadioListener("camera", (value) => {
      this.settings.permissions.camera = value;
      this.saveSettings();
    });
    this.addRadioListener("autoplay", (value) => {
      this.settings.permissions.autoplay = value;
      this.saveSettings();
    });

    // Downloads settings
    this.addCheckboxListener("ask-where-save", (checked) => {
      this.settings.downloads.askWhereSave = checked;
      this.saveSettings();
    });
    this.addCheckboxListener("other", (checked) => {
      this.settings.downloads.other = checked;
      this.saveSettings();
    });
    this.addRadioListener("auto-delete", (value) => {
      this.settings.downloads.autoDelete = value;
      this.saveSettings();
    });

    // Search Engine settings
    this.addRadioListener("search-engine", (value) => {
      this.settings.searchEngine = value;
      this.saveSettings();
    });

    // Reset settings
    this.addCheckboxListener("all-downloads", (checked) => {
      this.settings.reset.allDownloads = checked;
    });
    this.addCheckboxListener("browsing-history", (checked) => {
      this.settings.reset.browsingHistory = checked;
    });
    this.addCheckboxListener("cookies-data", (checked) => {
      this.settings.reset.cookiesData = checked;
    });
    this.addCheckboxListener("cached-files", (checked) => {
      this.settings.reset.cachedFiles = checked;
    });
    this.addCheckboxListener("browser-settings", (checked) => {
      this.settings.reset.browserSettings = checked;
    });

    // Reset buttons
    const resetBtn = document.getElementById("resetBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.handleReset());
    }
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.handleCancel());
    }

    // Search functionality
    const searchInput = document.getElementById(
      "searchInput"
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener("input", (e) => this.handleSearch(e));
    }
  }

  private addRadioListener(
    name: string,
    callback: (value: string) => void
  ): void {
    const radios = document.querySelectorAll(`input[name="${name}"]`);
    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        callback(target.value);
        console.log(`[Settings] ${name} changed to: ${target.value}`);
      });
    });
  }

  private addCheckboxListener(
    id: string,
    callback: (checked: boolean) => void
  ): void {
    const checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
      checkbox.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        callback(target.checked);
        console.log(`[Settings] ${id} changed to: ${target.checked}`);
      });
    }
  }

  private handleTabSwitch(event: Event): void {
    const button = event.target as HTMLElement;
    const tabName = button.getAttribute("data-tab");

    if (!tabName) return;

    // Update active tab button
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.classList.add("border-transparent", "text-gray-600");
      btn.classList.remove("border-blue-500", "text-blue-600");
    });

    button.classList.add("active");
    button.classList.remove("border-transparent", "text-gray-600");
    button.classList.add("border-blue-500", "text-blue-600");

    // Update active tab content
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((content) => {
      content.classList.add("hidden");
    });

    const activeContent = document.getElementById(tabName);
    if (activeContent) {
      activeContent.classList.remove("hidden");
    }

    console.log(`[Settings] Switched to tab: ${tabName}`);
  }

  private handleColorSelection(event: Event): void {
    const button = event.target as HTMLElement;
    const color = button.getAttribute("data-color");

    if (!color) return;

    this.settings.appearance.brandColor = color;
    this.applyBrandColor(color);
    this.saveSettings();

    console.log(`[Settings] Brand color changed to: ${color}`);
  }

  private handleReset(): void {
    const itemsToReset: string[] = [];

    if (this.settings.reset.allDownloads) itemsToReset.push("All downloads");
    if (this.settings.reset.browsingHistory)
      itemsToReset.push("Browsing history");
    if (this.settings.reset.cookiesData)
      itemsToReset.push("Cookies and other site data");
    if (this.settings.reset.cachedFiles) itemsToReset.push("Cached files");
    if (this.settings.reset.browserSettings)
      itemsToReset.push("Browser settings");

    console.log("[Settings] Reset initiated for:", itemsToReset);
    alert(`Reset initiated for:\n${itemsToReset.join("\n")}`);
  }

  private handleCancel(): void {
    console.log("[Settings] Reset cancelled");
    // Reset checkboxes to saved state
    this.applySettingsToUI();
  }

  private handleSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();

    console.log(`[Settings] Searching for: ${searchTerm}`);

    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((content) => {
      const text = content.textContent?.toLowerCase() || "";
      if (searchTerm === "" || text.includes(searchTerm)) {
        content.classList.remove("hidden");
      } else {
        content.classList.add("hidden");
      }
    });
  }
}

// Initialize settings when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Settings] Initializing Settings Manager");
  new SettingsManager();
});
