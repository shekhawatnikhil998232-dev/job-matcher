// animations.js

function initAnimations() {
  // 1. CREATE CUSTOM BRUTALIST CURSOR
  const cursor = document.createElement("div");
  cursor.id = "brutal-cursor";
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  // Track Mouse Movement
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth animation loop for the cursor (lerp)
  function animateCursor() {
    // Math.lerp logic for smooth trailing
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    
    // Position the cursor perfectly on the mouse point
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Highlight cursor on interactive elements
  const interactives = document.querySelectorAll("a, button, select, input, textarea, .job-card, .check-item");
  interactives.forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor-hover");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor-hover");
    });
  });

  // Hide cursor when leaving window
  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
  });


  // 2. ENTRANCE REVEALS (IntersectionObserver)
  const revealElements = document.querySelectorAll('.brutal-reveal');
  
  const revealOptions = {
    threshold: 0.05, // Trigger when 5% visible
    rootMargin: "0px 0px -20px 0px"
  };

  const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Run only once
      }
    });
  }, revealOptions);

  revealElements.forEach(el => {
    revealOnScroll.observe(el);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

