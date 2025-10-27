// Grain effect - runs on all pages
function initGrainEffect() {
  const grain = document.getElementById("grain");
  if (grain) {
    setInterval(() => {
      const x = (Math.random() - 0.5) * 100; // Range: -5 to +5
      const y = (Math.random() - 0.5) * 100;
      grain.style.transform = `translate(${x}px, ${y}px)`;
    }, 50);
  }
}

// Video autoplay handler for Safari
function initVideoAutoplay() {
  const v = document.querySelector('.video');
  if(v == null) return;
  v.muted = true;
  setTimeout(() => {
    v.play().catch(() => {
      console.log('Autoplay failed, waiting for user interaction to play video.');
      document.body.addEventListener('click', () => v.play(), { once: true });
    });
  }, 100);
}

// Globe animation - only on index.html
async function initGlobe() {
  const canvas = document.getElementById("cobe");
  if (canvas) {
    try {
      const { default: createGlobe } = await import('https://cdn.skypack.dev/cobe');
      let phi = 0;
      const globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: 1000,
        height: 1000,
        phi: 0,
        theta: 0.3,
        dark: 1,
        scale: 1,
        diffuse: 2,
        mapSamples: 20000,
        mapBrightness: 12,
        baseColor: [0.2, 0.2, 0.2],
        markerColor: [1, 0.5, 1],
        glowColor: [1, 1, 1],
        offset: [0, 0],
        markers: [],
        onRender: (state) => {
          state.phi = phi;
          phi += 0.0025;
        },
      });
    } catch (error) {
      console.error('Failed to load globe:', error);
    }
  }
}

// Cases rendering - only on cases.html
function initCases() {
  const dataScript = document.getElementById('cases-data');
  const grid = document.getElementById('cases-grid');
  if (!dataScript || !grid) return;

  let cases = [];
  try {
    cases = JSON.parse(dataScript.textContent);
  } catch (e) {
    cases = [];
  }

  cases.sort((a, b) => b.date.localeCompare(a.date));

  cases.forEach((item, i) => {
    const caseNum = i + 1;
    const link = document.createElement('a');
    link.className = 'case-link';
    link.href = item.link;

    const card = document.createElement('div');
    card.className = 'case case-animated';

    // First 4 items load immediately (above the fold), rest are lazy loaded
    const isAboveFold = i < 4;
    const imgAttributes = isAboveFold
      ? `src="${item.image}" loading="eager"`
      : `src="${item.image}" loading="lazy" class="lazy-load"`;

    card.innerHTML = `
      <img class="case-bg" ${imgAttributes} alt="${item.title} case background" />
      <div class="case-blur"></div>
      <div class="title">
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true">
          <line x1="1" y1="12" x2="23" y2="12"></line>
          <polyline points="16 5 23 12 16 19"></polyline>
        </svg>
        <div>
          <h3>${item.title}</h3>
          <span>${item.date}</span>
        </div>
      </div>
    `;

    link.appendChild(card);
    grid.appendChild(link);

    setTimeout(() => {
      card.style.transition = 'opacity 0.5s cubic-bezier(.4,0,.2,1), transform 0.5s cubic-bezier(.4,0,.2,1)';
      card.style.opacity = '1';
      card.style.transform = 'none';
    }, 250 * i);
  });
}

// Modal video logic - only on case pages
function initVideoModal() {
  const modal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video');
  const closeModal = document.getElementById('close-modal');

  if (!modal || !modalVideo || !closeModal) return;

  // Function to open modal with specific video
  const openModal = (videoElement) => {
    modal.style.display = 'flex';
    setTimeout(() => { modal.style.opacity = '1'; }, 10);

    // Get video ID from data attributes
    const youtubeId = videoElement.getAttribute('data-youtube-id');
    const vimeoId = videoElement.getAttribute('data-vimeo-id');
    const localVideoSrc = videoElement.getAttribute('data-video-src');

    // Get aspect ratio from the video element's container
    const videoContainer = videoElement.closest('.bts-item');
    const aspectRatio = videoContainer ? videoContainer.getAttribute('data-aspect') : '16/9';

    // Apply aspect ratio to modal content with smart sizing for vertical videos
    const modalContent = modal.querySelector('.modal-content');

    // Check if it's a vertical video
    const [width, height] = aspectRatio.split('/').map(Number);
    const isVertical = height > width;

    if (isVertical) {
      // For vertical videos, prioritize fitting within viewport height
      const maxHeight = window.innerHeight * 0.85; // 85vh
      const maxWidth = window.innerWidth * (window.innerWidth <= 768 ? 0.6 : 0.4);

      // Calculate dimensions that fit within constraints
      const targetHeight = Math.min(maxHeight, maxWidth * (height / width));
      const targetWidth = targetHeight * (width / height);

      modalContent.style.width = `${targetWidth}px`;
      modalContent.style.height = `${targetHeight}px`;
      modalContent.style.aspectRatio = 'unset';
      modalContent.style.margin = '0 auto';
    } else {
      modalContent.style.aspectRatio = aspectRatio || '16/9';
      modalContent.style.width = '';
      modalContent.style.height = '';
      modalContent.style.margin = '';
    }

    if (youtubeId) {
      modalVideo.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1&modestbranding=1&showinfo=0&rel=0&fs=1`;
      modalVideo.style.aspectRatio = aspectRatio || '16/9';
    } else if (vimeoId) {
      modalVideo.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
      modalVideo.style.aspectRatio = aspectRatio || '16/9';
    } else if (localVideoSrc) {
      // For local videos, we need to replace the iframe with a video element
      modal.querySelector('.modal-content').innerHTML = `
        <button id="close-modal" class="close-button">&times;</button>
        <video class="modal-video" controls autoplay style="width: 100%; height: 100%; object-fit: contain;">
          <source src="${localVideoSrc}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
      // Re-bind close functionality for the new button
      const newCloseBtn = modal.querySelector('#close-modal');
      newCloseBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => {
          modal.style.display = 'none';
          // Reset modal content back to iframe structure
          modal.querySelector('.modal-content').innerHTML = `
            <button id="close-modal" class="close-button">&times;</button>
            <iframe id="modal-video" class="modal-video" src="" allowfullscreen></iframe>
          `;
          // Reset modal content styles
          modalContent.style.aspectRatio = '16/9';
          modalContent.style.width = '';
          modalContent.style.height = '';
          modalContent.style.margin = '';
        }, 300);
      });
    }
  };

  // Handle both old ID-based approach and new class-based approach
  const videoContainers = document.querySelectorAll('.video-container');

  videoContainers.forEach(container => {
    // Try to find elements by ID first (backwards compatibility)
    let thumb = container.querySelector('#video-thumb');
    let playBtn = container.querySelector('#play-btn');

    // If not found by ID, try by class (new approach)
    if (!thumb) thumb = container.querySelector('.video-thumb');
    if (!playBtn) playBtn = container.querySelector('.play-button');

    if (thumb && playBtn) {
      thumb.addEventListener('click', () => openModal(thumb));
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(thumb);
      });
    }
  });

  // Close modal functionality
  closeModal.addEventListener('click', () => {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.display = 'none';
      // Handle both iframe and video elements
      const iframe = modal.querySelector('#modal-video');
      const video = modal.querySelector('video');
      const modalContent = modal.querySelector('.modal-content');

      if (iframe) {
        iframe.src = '';
        iframe.style.aspectRatio = '16/9'; // Reset to default
      }
      if (video) {
        video.pause();
        video.currentTime = 0;
        // Reset modal content back to iframe structure for next use
        modal.querySelector('.modal-content').innerHTML = `
          <button id="close-modal" class="close-button">&times;</button>
          <iframe id="modal-video" class="modal-video" src="" allowfullscreen></iframe>
        `;
      }
      // Reset all modal content styles to default
      modalContent.style.aspectRatio = '16/9';
      modalContent.style.width = '';
      modalContent.style.height = '';
      modalContent.style.margin = '';
    }, 300);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal.click();
    }
  });
}

// Hover thumbnail functionality for project rows
function initHoverThumbnail() {
  const hoverThumbnail = document.getElementById('hover-thumbnail');
  const projectRows = document.querySelectorAll('.project-row');

  if (!hoverThumbnail || projectRows.length === 0) return;

  const thumbnailImg = hoverThumbnail.querySelector('img');

  projectRows.forEach(row => {
    row.addEventListener('mouseenter', (e) => {
      const thumbnailUrl = row.getAttribute('data-thumbnail');
      if (thumbnailUrl) {
        thumbnailImg.src = thumbnailUrl;
        hoverThumbnail.classList.add('visible');
      }
    });

    row.addEventListener('mouseleave', () => {
      hoverThumbnail.classList.remove('visible');
    });

    row.addEventListener('mousemove', (e) => {
      if (hoverThumbnail.classList.contains('visible')) {
        const x = e.clientX;
        const y = e.clientY;
        hoverThumbnail.style.left = x + 'px';
        hoverThumbnail.style.top = y + 'px';
      }
    });
  });
}

// Smart BTS Collage Layout
function initSmartCollage() {
  const grid = document.querySelector('.bts-grid');
  if (!grid) return;

  const seededRandom = (seed) => Math.sin(seed) * 10000 % 1;

  function calculateLayout() {
    const w = window.innerWidth;
    const cols = w >= 2400 ? 8 : w >= 1800 ? 7 : w >= 1600 ? 6 : w >= 1200 ? 5 : w >= 900 ? 4 : w >= 600 ? 3 : 2;
    const size = Math.floor(grid.offsetWidth / cols);

    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridAutoRows = `${size}px`;

    grid.querySelectorAll('.bts-item').forEach((item, i) => {
      const img = item.querySelector('.bts-image, .bts-video-thumb');
      if (!img) return;

      // Reset classes
      item.className = item.className.replace(/\b(span|row-span)-\d+/g, '').replace(/\s+/g, ' ').trim();

      // Get aspect ratio (manual override or natural)
      const aspect = item.dataset.aspect
        ? item.dataset.aspect.split('/').reduce((a, b) => a / b)
        : img.naturalWidth / img.naturalHeight;

      const isVideo = item.classList.contains('bts-video');
      const random = seededRandom(i + 12345);

      let colSpan = 1, rowSpan = 1;

      // Simple logic
      if (i === 0) {
        colSpan = 2; rowSpan = 2; // Hero
      } else if (isVideo && aspect > 1.2) {
        colSpan = 2; rowSpan = 1; // Wide videos
      } else if (aspect > 1.6) {
        colSpan = 2; rowSpan = 1; // Wide images
      } else if (aspect < 0.7) {
        colSpan = 1; rowSpan = 2; // Tall images
      } else if (aspect > 0.8 && aspect < 1.2 && random > 0.7) {
        colSpan = 2; rowSpan = random > 0.5 ? 2 : 1; // Featured squares
      }

      // Apply constraints and add classes
      colSpan = Math.min(colSpan, 2, cols);
      rowSpan = Math.min(rowSpan, 2);
      item.classList.add(`span-${colSpan}`, `row-span-${rowSpan}`);
    });
  }

  calculateLayout();
  let timeout;
  window.addEventListener('resize', () => {
    clearTimeout(timeout);
    timeout = setTimeout(calculateLayout, 10);
  });
}

// Initialize all scripts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initGrainEffect();
  initVideoAutoplay();
  initGlobe();
  initCases();
  initVideoModal();
  initHoverThumbnail();
  initSmartCollage();
});