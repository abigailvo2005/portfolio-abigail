// FOR TEXT SWITCHING ANIMATION
function initRotatingText() {
  const rotatingElement = document.getElementById("rotatingText");

  if (!rotatingElement) {
    console.log("Rotating text element not found");
    return;
  }

  const textItems = rotatingElement.querySelectorAll(".text-item");
  let currentIndex = 0;

  // Function to show next text
  function showNextText() {
    // Hide current text
    textItems[currentIndex].classList.remove("active");

    // Move to next text
    currentIndex = (currentIndex + 1) % textItems.length;

    // Show next text
    textItems[currentIndex].classList.add("active");
  }

  // Start the rotation every 5 seconds
  setInterval(showNextText, 5000);

  console.log("Rotating text initialized with", textItems.length, "items");
}

// ✅ ENHANCED PROJECT MODAL WITH SCROLL PREVENTION
class EnhancedProjectModal {
  constructor() {
    this.modal = document.getElementById("enhancedProjectModal");
    this.currentProject = null;
    this.currentTab = "overview";
    this.isInitialized = false;
    this.scrollPosition = 0; // ✅ Store scroll position
    this.init();
  }

  init() {
    if (this.isInitialized) return;

    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupEventListeners()
      );
    } else {
      this.setupEventListeners();
    }

    this.isInitialized = true;
  }

  setupEventListeners() {
    // ✅ UPDATE: Add click listeners to BOTH old and new project items
    const projectItems = [
      ...document.querySelectorAll(".enhanced-project-item"),
      ...document.querySelectorAll(".modern-project-card"),
    ];

    projectItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        this.openModal(item);
      });
    });

    // Tab switching
    document.querySelectorAll(".project-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tabName = e.currentTarget.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Modal events
    if (this.modal) {
      // ✅ PREVENT BACKGROUND SCROLL WHEN MODAL SHOWS
      this.modal.addEventListener("show.bs.modal", () => {
        this.preventBackgroundScroll();
        this.setupContent();
      });

      // ✅ RESTORE BACKGROUND SCROLL WHEN MODAL HIDES
      this.modal.addEventListener("hidden.bs.modal", () => {
        this.restoreBackgroundScroll();
        this.cleanup();
      });

      // ✅ HANDLE SCROLL EVENTS WITHIN MODAL
      this.modal.addEventListener("shown.bs.modal", () => {
        this.setupModalScrollHandling();
      });

      // Keyboard navigation
      document.addEventListener("keydown", (e) => {
        if (this.modal.classList.contains("show")) {
          switch (e.key) {
            case "Escape":
              bootstrap.Modal.getInstance(this.modal)?.hide();
              break;
            case "ArrowLeft":
              this.switchToPreviousTab();
              break;
            case "ArrowRight":
              this.switchToNextTab();
              break;
          }
        }
      });
    }
  }

  // ✅ PREVENT BACKGROUND SCROLL
  preventBackgroundScroll() {
    // Store current scroll position
    this.scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;

    // Add modal-open class to body
    document.body.classList.add("modal-open");
    document.body.style.top = `-${this.scrollPosition}px`;

    // Prevent scroll on html element too
    document.documentElement.style.overflow = "hidden";
  }

  // ✅ RESTORE BACKGROUND SCROLL
  restoreBackgroundScroll() {
    // Remove modal-open class from body
    document.body.classList.remove("modal-open");
    document.body.style.top = "";

    // Restore overflow
    document.documentElement.style.overflow = "";

    // Restore scroll position
    window.scrollTo(0, this.scrollPosition);
  }

  // ✅ SETUP MODAL SCROLL HANDLING
  setupModalScrollHandling() {
    const tabContent = this.modal.querySelector(".project-tab-content");
    if (tabContent) {
      // Ensure the tab content is focusable and captures scroll events
      tabContent.setAttribute("tabindex", "-1");
      tabContent.focus();

      // ✅ PREVENT WHEEL EVENTS FROM BUBBLING TO DOCUMENT
      tabContent.addEventListener(
        "wheel",
        (e) => {
          e.stopPropagation();
        },
        { passive: true }
      );

      // ✅ PREVENT TOUCHMOVE EVENTS FROM BUBBLING (Mobile)
      tabContent.addEventListener(
        "touchmove",
        (e) => {
          e.stopPropagation();
        },
        { passive: true }
      );
    }
  }

  openModal(projectItem) {
    const title = projectItem.dataset.projectTitle;
    const description = projectItem.dataset.projectDescription;
    const tags = this.safeJsonParse(projectItem.dataset.projectTags, []);
    const contributions = this.safeJsonParse(
      projectItem.dataset.projectContributions,
      []
    );
    const links = this.safeJsonParse(projectItem.dataset.projectLinks, []);
    const videoUrl = projectItem.dataset.projectVideo;
    const gallery = this.safeJsonParse(projectItem.dataset.projectGallery, []);

    this.currentProject = {
      title,
      description,
      tags,
      contributions,
      links,
      videoUrl,
      gallery,
    };

    // Show modal
    if (window.bootstrap && this.modal) {
      const modalInstance = new bootstrap.Modal(this.modal);
      modalInstance.show();
    }
  }

  setupContent() {
    if (!this.currentProject) return;

    const {
      title,
      description,
      tags,
      contributions,
      links,
      videoUrl,
      gallery,
    } = this.currentProject;

    // Set title and tags
    this.setTextContent("modalProjectTitle", title);

    // Set tags in header
    this.setInnerHTML(
      "modalProjectMeta",
      tags
        .map(
          (tag) =>
            `<span class="project-tag-header">${this.escapeHtml(tag)}</span>`
        )
        .join("")
    );

    // Set description
    this.setTextContent("modalProjectDescription", description);

    // Set contributions
    this.setInnerHTML(
      "modalProjectContributions",
      contributions
        .map(
          (contribution) =>
            `<li class="contribution-item">${this.escapeHtml(
              contribution
            )}</li>`
        )
        .join("")
    );

    // Set links
    this.setInnerHTML(
      "modalProjectLinks",
      links
        .map((link) => {
          const iconClass = link.icon || "ph-link";
          const linkType = link.type || "demo";
          return `
          <a href="${this.escapeHtml(link.url)}" 
             class="project-link-enhanced ${this.escapeHtml(linkType)}" 
             target="_blank" 
             rel="noopener">
              <i class="ph-bold ${this.escapeHtml(iconClass)}"></i>
              <span>${this.escapeHtml(link.text)}</span>
          </a>
        `;
        })
        .join("")
    );

    // Set gallery
    if (gallery && gallery.length > 0) {
      this.setInnerHTML(
        "modalProjectGallery",
        gallery
          .map(
            (item) => `
          <div class="gallery-item-enhanced">
            <img src="${this.escapeHtml(item.url)}" 
                 alt="${this.escapeHtml(item.caption)}" 
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjZmZmZmZmIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+'" />
            <div class="gallery-item-overlay">
              <div class="gallery-item-caption">${this.escapeHtml(
                item.caption
              )}</div>
            </div>
          </div>
        `
          )
          .join("")
      );
    }

    // Set video
    if (videoUrl) {
      const autoplayUrl = videoUrl.includes("?")
        ? `${videoUrl}&autoplay=1`
        : `${videoUrl}?autoplay=1`;
      const videoElement = document.getElementById("modalProjectVideo");
      if (videoElement) {
        videoElement.src = autoplayUrl;
      }
    }

    // Reset to overview tab
    this.switchTab("overview");
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".project-tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetBtn) {
      targetBtn.classList.add("active");
    }

    // Update tab content
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.style.display = "none";
      pane.classList.remove("active");
    });

    const targetPane = document.getElementById(`tab-${tabName}`);
    if (targetPane) {
      targetPane.style.display = "block";
      targetPane.classList.add("active");
    }

    this.currentTab = tabName;

    // ✅ RESET SCROLL TO TOP WHEN SWITCHING TABS
    setTimeout(() => {
      const tabContent = this.modal.querySelector(".project-tab-content");
      if (tabContent) {
        tabContent.scrollTop = 0;
      }

      // Add entrance animation
      if (targetPane) {
        const elements = targetPane.querySelectorAll(
          ".fade-in-up, .stagger-children > *"
        );
        elements.forEach((el, index) => {
          el.style.animationDelay = `${index * 0.1}s`;
          el.classList.add("fade-in-up");
        });
      }
    }, 50);
  }

  switchToNextTab() {
    const tabs = ["overview", "gallery", "video"];
    const currentIndex = tabs.indexOf(this.currentTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    this.switchTab(tabs[nextIndex]);
  }

  switchToPreviousTab() {
    const tabs = ["overview", "gallery", "video"];
    const currentIndex = tabs.indexOf(this.currentTab);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    this.switchTab(tabs[prevIndex]);
  }

  cleanup() {
    this.currentProject = null;
    this.currentTab = "overview";

    // Stop video
    const videoElement = document.getElementById("modalProjectVideo");
    if (videoElement) {
      videoElement.src = "";
    }

    // Clear animations
    document.querySelectorAll(".fade-in-up").forEach((el) => {
      el.classList.remove("fade-in-up");
      el.style.animationDelay = "";
    });
  }

  // Utility methods
  safeJsonParse(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString || "null") || defaultValue;
    } catch (e) {
      console.warn("Failed to parse JSON:", jsonString, e);
      return defaultValue;
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  setTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text || "";
    }
  }

  setInnerHTML(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html || "";
    }
  }
}

// LEGACY VIDEO MODAL (keeping for backward compatibility)
class PortfolioVideoModal {
  constructor() {
    this.modal = document.getElementById("projectModal");

    // Only initialize if the old modal exists
    if (this.modal) {
      this.videoWrapper = document.getElementById("videoWrapper");
      this.projectVideo = document.getElementById("projectVideo");
      this.currentProjectSpan = document.getElementById("currentProject");
      this.videoInfoPanel = document.getElementById("videoInfoPanel");
      this.currentProject = null;
      this.isFullscreen = false;
      this.initLegacy();
    }
  }

  initLegacy() {
    // Add click listeners to old gallery items
    document
      .querySelectorAll(".gallery__item:not(.enhanced-project-item)")
      .forEach((item) => {
        item.addEventListener("click", (e) => {
          if (e.target.tagName === "A") {
            e.preventDefault();
          }
          this.openLegacyModal(item);
        });
      });

    // Modal events
    this.modal.addEventListener("show.bs.modal", () => {
      this.setupVideo();
    });

    this.modal.addEventListener("hidden.bs.modal", () => {
      this.cleanupLegacy();
    });

    // Control buttons
    const shareBtn = document.getElementById("shareBtn");
    const fullscreenBtn = document.getElementById("fullscreenBtn");

    if (shareBtn) shareBtn.addEventListener("click", () => this.shareProject());
    if (fullscreenBtn)
      fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (this.modal.classList.contains("show")) {
        switch (e.key) {
          case "Escape":
            bootstrap.Modal.getInstance(this.modal)?.hide();
            break;
          case "f":
          case "F":
            this.toggleFullscreen();
            break;
        }
      }
    });
  }

  openLegacyModal(galleryItem) {
    const videoUrl = galleryItem.dataset.projectVideo;
    const thumbnail = galleryItem.dataset.projectThumbnail;
    const title = galleryItem.dataset.projectTitle;
    const description = galleryItem.dataset.projectDescription;
    const tags = JSON.parse(galleryItem.dataset.projectTags);
    const links = JSON.parse(galleryItem.dataset.projectLinks || "[]");

    this.currentProject = {
      videoUrl,
      thumbnail,
      title,
      description,
      tags,
      links,
    };

    this.setupLegacyContent();

    // Show modal
    const modalInstance = new bootstrap.Modal(this.modal);
    modalInstance.show();
  }

  setupLegacyContent() {
    if (!this.currentProject) return;

    const { title, description, tags, links } = this.currentProject;

    // Set content using the legacy structure
    if (document.getElementById("modalProjectTitle")) {
      document.getElementById("modalProjectTitle").textContent = title;
    }
    if (document.getElementById("modalProjectDescription")) {
      document.getElementById("modalProjectDescription").textContent =
        description;
    }
    if (this.currentProjectSpan) {
      this.currentProjectSpan.textContent = title;
    }

    // Set tags (legacy)
    if (document.getElementById("modalProjectTags")) {
      document.getElementById("modalProjectTags").innerHTML = tags
        .map((tag) => `<span class="project-tag-video">${tag}</span>`)
        .join("");
    }

    // Set links (legacy)
    if (document.getElementById("modalProjectLinks")) {
      document.getElementById("modalProjectLinks").innerHTML = links
        .map((link) => {
          const iconClass = link.icon || "ph-link";
          const linkType = link.type || "demo";
          return `
            <a href="${link.url}" 
               class="project-link-video ${linkType}" 
               target="_blank" 
               rel="noopener">
                <i class="ph-bold ${iconClass}"></i>
                ${link.text}
            </a>
          `;
        })
        .join("");
    }
  }

  setupVideo() {
    if (!this.currentProject) return;

    const { videoUrl } = this.currentProject;

    // Set video source
    if (this.projectVideo) {
      this.projectVideo.src = videoUrl;

      // Add autoplay parameter if it's a YouTube URL
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        const separator = videoUrl.includes("?") ? "&" : "?";
        this.projectVideo.src = videoUrl + separator + "autoplay=1";
      }
    }
  }

  shareProject() {
    if (navigator.share && this.currentProject) {
      const shareUrl =
        this.currentProject.links[0]?.url || window.location.href;
      navigator.share({
        title: this.currentProject.title,
        text: this.currentProject.description,
        url: shareUrl,
      });
    } else {
      const shareUrl =
        this.currentProject.links[0]?.url || window.location.href;
      const shareText = `${this.currentProject.title}: ${shareUrl}`;
      navigator.clipboard.writeText(shareText).then(() => {
        this.showToast("Project link copied to clipboard!");
      });
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.modal.requestFullscreen().then(() => {
        this.isFullscreen = true;
        const fullscreenBtn = document.getElementById("fullscreenBtn");
        if (fullscreenBtn) {
          fullscreenBtn.innerHTML = '<i class="ph-bold ph-arrows-in"></i>';
        }
      });
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen = false;
        const fullscreenBtn = document.getElementById("fullscreenBtn");
        if (fullscreenBtn) {
          fullscreenBtn.innerHTML = '<i class="ph-bold ph-arrows-out"></i>';
        }
      });
    }
  }

  showToast(message) {
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 9999;
      font-size: 0.9em;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  cleanupLegacy() {
    this.currentProject = null;
    this.isFullscreen = false;

    // Stop video
    if (this.projectVideo) {
      this.projectVideo.src = "";
    }

    // Reset UI
    const fullscreenBtn = document.getElementById("fullscreenBtn");
    if (fullscreenBtn) {
      fullscreenBtn.innerHTML = '<i class="ph-bold ph-arrows-out"></i>';
    }
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize rotating text
  initRotatingText();

  // Initialize enhanced project modal
  new EnhancedProjectModal();

  // Initialize legacy video modal for backward compatibility
  new PortfolioVideoModal();
});

// Backup: Initialize if DOM already loaded
if (document.readyState !== "loading") {
  initRotatingText();
  new EnhancedProjectModal();
  new PortfolioVideoModal();
}

// Add entrance animations to gallery items
window.addEventListener("load", () => {
  const galleryItems = document.querySelectorAll(".gallery__item");
  galleryItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.2}s`;
    item.classList.add("fade-in-up");
  });
});
