// Compiled JavaScript version of settings.ts
class SettingsManager {
  constructor() {
    this.settings = {};
    this.storageKey = "browserSettings";
    this.loadSettings();
    this.initializeEventListeners();
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.settings = JSON.parse(stored);
        console.log("[Settings] Loaded settings from storage:", this.settings);
      } else {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
      }
    } catch (error) {
      console.error("[Settings] Error loading settings:", error);
      this.settings = this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
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
        autoDelete: "one-week",
        askLocation: true,
      },
      searchEngine: "google",
    };
  }

  saveSettings() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      console.log("[Settings] Settings saved:", this.settings);
    } catch (error) {
      console.error("[Settings] Error saving settings:", error);
    }
  }

  initializeEventListeners() {
    // Tab switching
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.switchTab(e.currentTarget));
    });

    // Radio buttons
    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", (e) => this.handleRadioChange(e.target));
    });

    // Checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener("change", (e) =>
        this.handleCheckboxChange(e.target)
      );
    });

    // Color buttons
    document.querySelectorAll(".color-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.handleColorChange(e.currentTarget)
      );
    });

    // Reset button
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.handleReset());
    }

    // Cancel button
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.handleCancel());
    }

    // Search input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => this.handleSearch(e.target));
    }

    // Apply saved settings to UI
    this.applySettingsToUI();
  }

  switchTab(target) {
    const tabBtn = target.closest(".tab-btn");
    if (!tabBtn) return;

    const tabName = tabBtn.getAttribute("data-tab");
    if (!tabName) return;

    // Update active tab button
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
      btn.classList.add("border-transparent", "text-gray-600");
    });
    tabBtn.classList.add("active");
    tabBtn.classList.remove("border-transparent", "text-gray-600");

    // Update active tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.add("hidden");
    });
    const activeContent = document.getElementById(tabName);
    if (activeContent) {
      activeContent.classList.remove("hidden");
    }

    console.log("[Settings] Switched to tab:", tabName);
  }

  handleRadioChange(radio) {
    const name = radio.name;
    const value = radio.value;

    const settingsMap = {
      cookies: "privacy.cookies",
      tracking: "privacy.tracking",
      ads: "privacy.ads",
      location: "permissions.location",
      microphone: "permissions.microphone",
      camera: "permissions.camera",
      autoplay: "permissions.autoplay",
      "font-size": "appearance.fontSize",
      language: "appearance.language",
      "auto-delete": "downloads.autoDelete",
      "search-engine": "searchEngine",
    };

    const path = settingsMap[name];
    if (path) {
      this.setNestedValue(this.settings, path, value);
      this.saveSettings();
      console.log(`[Settings] ${name} changed to:`, value);
    }
  }

  handleCheckboxChange(checkbox) {
    const name = checkbox.name;
    const checked = checkbox.checked;

    console.log(`[Settings] ${name} checkbox:`, checked);
    this.saveSettings();
  }

  handleColorChange(btn) {
    const color = btn.getAttribute("data-color");
    if (!color) return;

    // Remove previous selection
    document.querySelectorAll(".color-btn").forEach((b) => {
      b.classList.remove("selected");
    });

    // Add selection to clicked button
    btn.classList.add("selected");

    // Update settings
    this.settings.appearance.brandColor = color;
    this.saveSettings();

    // Apply color to UI
    document.documentElement.style.setProperty("--primary-color", color);

    console.log("[Settings] Brand color changed to:", color);
  }

  handleReset() {
    if (
      confirm(
        "Are you sure you want to reset your browsing data? This action cannot be undone."
      )
    ) {
      const checkboxes = document.querySelectorAll(
        '#reset input[type="checkbox"]:checked'
      );
      const itemsToReset = [];

      checkboxes.forEach((checkbox) => {
        const label = checkbox.parentElement?.textContent?.trim();
        if (label) itemsToReset.push(label);
      });

      console.log("[Settings] Resetting:", itemsToReset);
      alert(`Reset complete! Cleared: ${itemsToReset.join(", ")}`);
    }
  }

  handleCancel() {
    console.log("[Settings] Reset cancelled");
  }

  handleSearch(input) {
    const query = input.value.toLowerCase();
    console.log("[Settings] Search query:", query);

    document.querySelectorAll(".tab-content").forEach((content) => {
      const text = content.textContent?.toLowerCase() || "";
      if (query === "" || text.includes(query)) {
        content.classList.remove("opacity-50");
      } else {
        content.classList.add("opacity-50");
      }
    });
  }

  applySettingsToUI() {
    // Apply radio buttons
    Object.entries(this.settings).forEach(([key, value]) => {
      if (typeof value === "object") {
        Object.entries(value).forEach(([subKey, subValue]) => {
          const radio = document.querySelector(
            `input[type="radio"][name="${subKey}"][value="${subValue}"]`
          );
          if (radio) radio.checked = true;
        });
      } else {
        const radio = document.querySelector(
          `input[type="radio"][name="${key}"][value="${value}"]`
        );
        if (radio) radio.checked = true;
      }
    });

    // Apply brand color
    const brandColor = this.settings.appearance?.brandColor;
    if (brandColor) {
      const colorBtn = document.querySelector(
        `.color-btn[data-color="${brandColor}"]`
      );
      if (colorBtn) {
        colorBtn.classList.add("selected");
        document.documentElement.style.setProperty(
          "--primary-color",
          brandColor
        );
      }
    }

    console.log("[Settings] Applied settings to UI");
  }

  setNestedValue(obj, path, value) {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new SettingsManager();
  console.log("[Settings] Settings manager initialized");
});
