// Default Window TypeScript Logic

interface Task {
  id: string;
  time: string;
  text: string;
  completed: boolean;
}

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

class DefaultWindowManager {
  private currentDate: Date = new Date();
  private tasks: Task[] = [];
  private calendarDaysElement: HTMLElement | null = null;
  private calendarTitleElement: HTMLElement | null = null;
  private tasksListElement: HTMLElement | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    console.log("[Default Window] Initializing DefaultWindowManager");

    // Get DOM elements
    this.calendarDaysElement = document.getElementById("calendarDays");
    this.calendarTitleElement = document.getElementById("calendarTitle");
    this.tasksListElement = document.getElementById("tasksList");

    // Initialize components
    this.initializeClock();
    this.initializeCalendar();
    this.initializeTasks();
    this.attachEventListeners();
  }

  // Clock Logic
  private initializeClock(): void {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Calculate angles
      const secondAngle = seconds * 6 - 90; // 6 degrees per second
      const minuteAngle = minutes * 6 + seconds * 0.1 - 90; // 6 degrees per minute
      const hourAngle = hours * 30 + minutes * 0.5 - 90; // 30 degrees per hour

      // Update hands
      const hourHand = document.getElementById("hour-hand");
      const minuteHand = document.getElementById("minute-hand");
      const secondHand = document.getElementById("second-hand");

      if (hourHand) {
        hourHand.setAttribute("transform", `rotate(${hourAngle} 100 100)`);
      }
      if (minuteHand) {
        minuteHand.setAttribute("transform", `rotate(${minuteAngle} 100 100)`);
      }
      if (secondHand) {
        secondHand.setAttribute("transform", `rotate(${secondAngle} 100 100)`);
      }
    };

    // Generate hour markers
    const markersGroup = document.querySelector(".hour-markers");
    if (markersGroup) {
      for (let i = 0; i < 12; i++) {
        const angle = i * 30 - 90;
        const x1 = 100 + 80 * Math.cos((angle * Math.PI) / 180);
        const y1 = 100 + 80 * Math.sin((angle * Math.PI) / 180);
        const x2 = 100 + 85 * Math.cos((angle * Math.PI) / 180);
        const y2 = 100 + 85 * Math.sin((angle * Math.PI) / 180);

        const marker = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        marker.setAttribute("x1", x1.toString());
        marker.setAttribute("y1", y1.toString());
        marker.setAttribute("x2", x2.toString());
        marker.setAttribute("y2", y2.toString());
        marker.setAttribute("stroke", "#d1d5db");
        marker.setAttribute("stroke-width", i % 3 === 0 ? "3" : "2");
        marker.setAttribute("stroke-linecap", "round");

        markersGroup.appendChild(marker);
      }
    }

    // Update clock immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Calendar Logic
  private initializeCalendar(): void {
    this.renderCalendar();
  }

  private renderCalendar(): void {
    if (!this.calendarDaysElement || !this.calendarTitleElement) return;

    // Update title
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[this.currentDate.getMonth()];
    const year = this.currentDate.getFullYear();
    this.calendarTitleElement.textContent = `${month} ${year}`;

    // Get calendar days
    const days = this.getCalendarDays();

    // Clear existing days
    this.calendarDaysElement.innerHTML = "";

    // Render days
    days.forEach((day) => {
      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";
      dayElement.textContent = day.day > 0 ? day.day.toString() : "";

      if (!day.isCurrentMonth) {
        dayElement.classList.add("other-month");
      }

      if (day.isToday) {
        dayElement.classList.add("today");
      }

      this.calendarDaysElement?.appendChild(dayElement);
    });
  }

  private getCalendarDays(): CalendarDay[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    let startDay = firstDay.getDay();
    // Convert to Monday = 0
    startDay = startDay === 0 ? 6 : startDay - 1;

    const days: CalendarDay[] = [];
    const today = new Date();

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      days.push({
        day,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }

  private previousMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.renderCalendar();
  }

  private nextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.renderCalendar();
  }

  // Tasks Logic
  private initializeTasks(): void {
    this.tasks = [
      {
        id: "1",
        time: "06:00am",
        text: "Check compliance with financial regulations and standards",
        completed: true,
      },
      {
        id: "2",
        time: "07:00am",
        text: "Generate a quarterly performance report for each client",
        completed: true,
      },
      {
        id: "3",
        time: "08:00am",
        text: "",
        completed: false,
      },
      {
        id: "4",
        time: "09:00am",
        text: "Save meeting notes in CRM. Make sure to include any concerns/questions from client and the agreed upon next steps",
        completed: false,
      },
      {
        id: "5",
        time: "10:00am",
        text: "Prepare and present financial reports to clients",
        completed: true,
      },
    ];

    this.renderTasks();
  }

  private renderTasks(): void {
    if (!this.tasksListElement) return;

    this.tasksListElement.innerHTML = "";

    this.tasks.forEach((task) => {
      // Skip tasks without text
      if (!task.text) return;

      const taskElement = document.createElement("div");
      taskElement.className = "task-item";

      const timeElement = document.createElement("div");
      timeElement.className = "task-time";
      timeElement.textContent = task.time;

      const contentElement = document.createElement("div");
      contentElement.className = "task-content";

      const textElement = document.createElement("div");
      textElement.className = "task-text";
      textElement.textContent = task.text;

      const checkboxElement = document.createElement("div");
      checkboxElement.className = "task-checkbox";
      if (task.completed) {
        checkboxElement.classList.add("checked");
      }
      checkboxElement.addEventListener("click", () => {
        this.toggleTask(task.id);
      });

      contentElement.appendChild(textElement);
      contentElement.appendChild(checkboxElement);

      taskElement.appendChild(timeElement);
      taskElement.appendChild(contentElement);

      this.tasksListElement?.appendChild(taskElement);
    });
  }

  private toggleTask(taskId: string): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.renderTasks();
      console.log("[Default Window] Task toggled:", taskId, task.completed);
    }
  }

  // Event Listeners
  private attachEventListeners(): void {
    // Calendar navigation
    const prevBtn = document.getElementById("prevMonth");
    const nextBtn = document.getElementById("nextMonth");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.previousMonth());
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextMonth());
    }

    // Voice button
    const voiceBtn = document.getElementById("voiceBtn");
    if (voiceBtn) {
      voiceBtn.addEventListener("click", () => this.handleVoiceInput());
    }

    // App icons
    const appIcons = document.querySelectorAll(".app-icon");
    appIcons.forEach((icon) => {
      icon.addEventListener("click", (e) => {
        e.preventDefault();
        const appName = (icon as HTMLElement).getAttribute("data-app");
        this.handleAppClick(appName);
      });
    });
  }

  private handleVoiceInput(): void {
    console.log("[Default Window] Voice input activated");
    // Placeholder for voice input functionality
    // In a real Tauri app, you would integrate with speech recognition API
    alert("Voice input feature coming soon!");
  }

  private handleAppClick(appName: string | null): void {
    if (!appName) return;

    console.log("[Default Window] App clicked:", appName);

    // Map app names to URLs
    const appUrls: Record<string, string> = {
      figma: "https://www.figma.com",
      slack: "https://slack.com",
      chrome: "https://www.google.com/chrome/",
      youtube: "https://www.youtube.com",
      dribbble: "https://dribbble.com",
      linkedin: "https://www.linkedin.com",
      spotify: "https://www.spotify.com",
      instagram: "https://www.instagram.com",
      pinterest: "https://www.pinterest.com",
      netflix: "https://www.netflix.com",
    };

    const url = appUrls[appName];
    if (url) {
      // In Tauri, you would create a new tab using the TabManager
      if ((window as any).tabManager) {
        (window as any).tabManager.createTab(url, this.capitalize(appName));
      } else {
        console.warn("[Default Window] TabManager not available");
      }
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Public methods for external access
  public addTask(time: string, text: string): void {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      time,
      text,
      completed: false,
    };
    this.tasks.push(newTask);
    this.renderTasks();
  }

  public getTasks(): Task[] {
    return [...this.tasks];
  }

  public getCurrentDate(): Date {
    return new Date(this.currentDate);
  }
}

// Initialize DefaultWindowManager when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const manager = new DefaultWindowManager();
  (window as any).defaultWindowManager = manager;
  console.log(
    "[Default Window] DefaultWindowManager initialized and exposed to window"
  );
});
