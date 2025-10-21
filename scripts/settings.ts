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

export class SettingsManager {
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
    console.log("[Settings] Initializing event listeners");

    document.addEventListener("click", (e) => {
      const button = e.target as HTMLElement;
      if (button.classList.contains("tab-btn")) {
        this.handleTabSwitch(button);
      }
    });

    document.addEventListener("click", (e) => {
      const button = e.target as HTMLElement;
      if (button.classList.contains("color-btn")) {
        this.handleColorSelection(button);
      }
    });

    document.addEventListener("click", (e) => {
      const button = e.target as HTMLElement;
      if (button.id === "resetBtn") {
        this.handleReset();
      }
      if (button.id === "cancelBtn") {
        this.handleCancel();
      }
    });

    document.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.type === "radio") {
        this.handleRadioChange(target);
      }
      if (target.type === "checkbox") {
        this.handleCheckboxChange(target);
      }
    });

    document.addEventListener("input", (e) => {
      const input = e.target as HTMLInputElement;
      if (input.id === "searchInput") {
        this.handleSearch(input.value);
      }
    });

    console.log("[Settings] Event listeners initialized with delegation");
  }

  private handleTabSwitch(button: HTMLElement): void {
    const tabName = button.getAttribute("data-tab");

    if (!tabName) return;

    console.log(`[Settings] Switching to tab: ${tabName}`);

    // Update active tab button
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach((btn) => {
      btn.classList.remove("active", "border-blue-500", "text-blue-600");
      btn.classList.add("border-transparent", "text-gray-600");
    });

    button.classList.add("active", "border-blue-500", "text-blue-600");
    button.classList.remove("border-transparent", "text-gray-600");

    // Update active tab content
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((content) => {
      content.classList.add("hidden");
    });

    const activeContent = document.getElementById(tabName);
    if (activeContent) {
      activeContent.classList.remove("hidden");
      console.log(`[Settings] Tab content displayed: ${tabName}`);
    }
  }

  private handleRadioChange(radio: HTMLInputElement): void {
    const name = radio.name;
    const value = radio.value;

    console.log(`[Settings] Radio changed - ${name}: ${value}`);

    // Update settings based on radio name
    if (name === "cookies") {
      this.settings.privacy.cookies = value;
    } else if (name === "tracking") {
      this.settings.privacy.tracking = value;
    } else if (name === "ads") {
      this.settings.privacy.ads = value;
    } else if (name === "font-size") {
      this.settings.appearance.fontSize = value;
    } else if (name === "language") {
      this.settings.appearance.language = value;
    } else if (name === "location") {
      this.settings.permissions.location = value;
    } else if (name === "microphone") {
      this.settings.permissions.microphone = value;
    } else if (name === "camera") {
      this.settings.permissions.camera = value;
    } else if (name === "autoplay") {
      this.settings.permissions.autoplay = value;
    } else if (name === "auto-delete") {
      this.settings.downloads.autoDelete = value;
    } else if (name === "search-engine") {
      this.settings.searchEngine = value;
    }

    this.saveSettings();
  }

  private handleCheckboxChange(checkbox: HTMLInputElement): void {
    const id = checkbox.id;
    const checked = checkbox.checked;

    console.log(`[Settings] Checkbox changed - ${id}: ${checked}`);

    // Update settings based on checkbox id
    if (id === "ask-where-save") {
      this.settings.downloads.askWhereSave = checked;
    } else if (id === "other") {
      this.settings.downloads.other = checked;
    } else if (id === "all-downloads") {
      this.settings.reset.allDownloads = checked;
    } else if (id === "browsing-history") {
      this.settings.reset.browsingHistory = checked;
    } else if (id === "cookies-data") {
      this.settings.reset.cookiesData = checked;
    } else if (id === "cached-files") {
      this.settings.reset.cachedFiles = checked;
    } else if (id === "browser-settings") {
      this.settings.reset.browserSettings = checked;
    }

    this.saveSettings();
  }

  private handleColorSelection(button: HTMLElement): void {
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
    this.applySettingsToUI();
  }

  private handleSearch(searchTerm: string): void {
    const term = searchTerm.toLowerCase();
    console.log(`[Settings] Searching for: ${term}`);

    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((content) => {
      const text = content.textContent?.toLowerCase() || "";
      if (term === "" || text.includes(term)) {
        content.classList.remove("hidden");
      } else {
        content.classList.add("hidden");
      }
    });
  }
}
