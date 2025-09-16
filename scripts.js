// scripts.js - Unified JavaScript for Rawuvisuals portfolio

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
  const video = document.querySelector('.video');
  if (video) {
    // Ensure video is muted (Safari requirement)
    video.muted = true;
    video.volume = 0;

    // Try to play the video
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Autoplay started successfully
        console.log('Video autoplay started');
      }).catch(error => {
        // Autoplay failed - this is common on Safari
        // Only log if it's not the expected NotAllowedError
        if (!error.message.includes('NotAllowedError')) {
          console.log('Autoplay failed:', error);
        }
        // Video will remain paused - this is expected Safari behavior
      });
    }
  }
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
        theta: 0,
        dark: 1,
        diffuse: 1.2,
        scale: 1,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [1, 1, 1],
        markerColor: [1, 0.5, 1],
        glowColor: [1, 1, 1],
        offset: [0, 0],
        markers: [],
        onRender: (state) => {
          state.phi = phi;
          phi += 0.01;
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

  cases.forEach((item, i) => {
    const caseNum = i + 1;
    const link = document.createElement('a');
    link.className = 'case-link';
    link.href = item.link;

    const card = document.createElement('div');
    card.className = 'case case-animated';
    card.innerHTML = `
      <img class="case-bg" src="${item.image}" alt="Case background" />
      <div class="case-blur"></div>
      <div class="title">
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
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
  const thumb = document.getElementById('video-thumb');
  const playBtn = document.getElementById('play-btn');
  const closeModal = document.getElementById('close-modal');

  if (!modal || !modalVideo || !thumb || !playBtn || !closeModal) return;

  const openModal = () => {
    modal.style.display = 'flex';
    setTimeout(() => { modal.style.opacity = '1'; }, 10);
    modalVideo.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=1&modestbranding=1&showinfo=0&rel=0&fs=1';
  };

  thumb.addEventListener('click', openModal);
  playBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  closeModal.addEventListener('click', () => {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.display = 'none';
      modalVideo.src = '';
    }, 300);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal.click();
    }
  });
}

// Initialize all scripts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initGrainEffect();
  initVideoAutoplay();
  initGlobe();
  initCases();
  initVideoModal();
});