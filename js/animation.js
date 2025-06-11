// Simple rotating text slider
function initRotatingText() {
  const rotatingElement = document.getElementById("rotatingText");

  if (!rotatingElement) {
    console.log("Rotating text element not found");
    return;
  }

  const textItems = rotatingElement.querySelectorAll(".text-item");
  let currentIndex = 0;
  console.log(textItems);

  // Function to show next text
  function showNextText() {
    // Hide current text
    console.log(currentIndex);
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
