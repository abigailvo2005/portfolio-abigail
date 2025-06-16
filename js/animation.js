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

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initRotatingText);

// Backup: Initialize if DOM already loaded
if (document.readyState !== "loading") {
  initRotatingText();
}

// FOR VIDEO MODAL
class PortfolioVideoModal {
  constructor() {
    this.modal = document.getElementById("projectModal");
    this.videoWrapper = document.getElementById("videoWrapper");
    this.projectVideo = document.getElementById("projectVideo");
    this.currentProjectSpan = document.getElementById("currentProject");
    this.videoInfoPanel = document.getElementById("videoInfoPanel");

    this.currentProject = null;
    this.isFullscreen = false;

    this.init();
  }

  init() {
    // Add click listeners to gallery items
    document.querySelectorAll(".gallery__item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
          e.preventDefault();
        }
        this.openModal(item);
      });
    });

    // Modal events
    this.modal.addEventListener("show.bs.modal", () => {
      this.setupVideo();
    });

    this.modal.addEventListener("hidden.bs.modal", () => {
      this.cleanup();
    });

    // Control buttons
    document
      .getElementById("shareBtn")
      .addEventListener("click", () => this.shareProject());
    document
      .getElementById("fullscreenBtn")
      .addEventListener("click", () => this.toggleFullscreen());

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

  openModal(galleryItem) {
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

    this.setupContent();

    // Show modal
    const modalInstance = new bootstrap.Modal(this.modal);
    modalInstance.show();
  }

  setupContent() {
    if (!this.currentProject) return;

    const { title, description, tags, links } = this.currentProject;

    // Set content
    document.getElementById("modalProjectTitle").textContent = title;
    document.getElementById("modalProjectDescription").textContent =
      description;

    // Update counter
    this.currentProjectSpan.textContent = title;

    // Set tags
    document.getElementById("modalProjectTags").innerHTML = tags
      .map((tag) => `<span class="project-tag-video">${tag}</span>`)
      .join("");

    // FLEXIBLE LINKS RENDERING
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

  setupVideo() {
    if (!this.currentProject) return;

    const { videoUrl } = this.currentProject;

    // Set video source
    this.projectVideo.src = videoUrl;

    // Add autoplay parameter if it's a YouTube URL
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const separator = videoUrl.includes("?") ? "&" : "?";
      this.projectVideo.src = videoUrl + separator + "autoplay=1";
    }
  }

  shareProject() {
    if (navigator.share && this.currentProject) {
      // Find the first available link for sharing
      const shareUrl =
        this.currentProject.links[0]?.url || window.location.href;

      navigator.share({
        title: this.currentProject.title,
        text: this.currentProject.description,
        url: shareUrl,
      });
    } else {
      // Fallback: copy project title and first link to clipboard
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
        document.getElementById("fullscreenBtn").innerHTML =
          '<i class="ph-bold ph-arrows-in"></i>';
      });
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen = false;
        document.getElementById("fullscreenBtn").innerHTML =
          '<i class="ph-bold ph-arrows-out"></i>';
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

  cleanup() {
    this.currentProject = null;
    this.isFullscreen = false;

    // Stop video
    this.projectVideo.src = "";

    // Reset UI
    document.getElementById("fullscreenBtn").innerHTML =
      '<i class="ph-bold ph-arrows-out"></i>';
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PortfolioVideoModal();
});
