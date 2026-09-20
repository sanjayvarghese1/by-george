/* ==========================================================================
   FOR SAUBHUUUU - INTERACTION, MUSIC & CELEBRATION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------------------
  // 1. STATE & ELEMENTS
  // ---------------------------------------------------------------------------
  let currentStep = 1;
  const totalSteps = 4;
  let isPlayingMusic = false;
  let audioCtx = null;

  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const musicStatusText = document.getElementById('music-status-text');

  const steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4')
  };

  const flashOverlay = document.getElementById('flash-overlay');
  const runawayGiftBtn = document.getElementById('runaway-gift-btn');
  const giftTauntText = document.getElementById('gift-taunt-text');
  const giveUpContainer = document.getElementById('give-up-container');
  const runawayWrapper = document.getElementById('runaway-wrapper');
  let dodgeCount = 0;

  const candleTrigger = document.getElementById('candle-trigger');
  const candleFlame = document.getElementById('candle-flame');
  const wishInstruction = document.getElementById('wish-instruction');
  const wishGranted = document.getElementById('wish-granted');
  const confettiBtn = document.getElementById('confetti-btn');
  const replayBtn = document.getElementById('replay-btn');

  // ---------------------------------------------------------------------------
  // 2. PROCEDURAL SOUND SYNTHESIZER (Web Audio API)
  // ---------------------------------------------------------------------------
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playChime(freq = 587.33, duration = 0.6) {
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  }

  function playCheekyBoing() {
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.16);
    } catch (e) {
      // Audio fallback silent
    }
  }

  function playGrandChord() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playChime(freq, 1.8);
      }, idx * 110);
    });
  }

  // ---------------------------------------------------------------------------
  // 3. BACKGROUND MUSIC CONTROLLER
  // ---------------------------------------------------------------------------
  function playMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.55;
    bgMusic.play().then(() => {
      isPlayingMusic = true;
      musicToggle.classList.add('playing');
      musicStatusText.textContent = 'music on';
    }).catch(() => {
      isPlayingMusic = false;
      musicToggle.classList.remove('playing');
      musicStatusText.textContent = 'music off';
    });
  }

  function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    isPlayingMusic = false;
    musicToggle.classList.remove('playing');
    musicStatusText.textContent = 'music off';
  }

  function toggleMusic() {
    if (isPlayingMusic) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

    if (musicToggle) {
    musicToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }

  // Attempt instant autoplay immediately on page load
  playMusic();

  // Also bind to any early interaction if browser requires a gesture
  function startMusicOnFirstInteraction() {
    if (!isPlayingMusic) {
      playMusic();
    }
    window.removeEventListener('click', startMusicOnFirstInteraction);
    window.removeEventListener('keydown', startMusicOnFirstInteraction);
    window.removeEventListener('touchstart', startMusicOnFirstInteraction);
    window.removeEventListener('pointerdown', startMusicOnFirstInteraction);
  }

  window.addEventListener('click', startMusicOnFirstInteraction, { once: true });
  window.addEventListener('keydown', startMusicOnFirstInteraction, { once: true });
  window.addEventListener('touchstart', startMusicOnFirstInteraction, { once: true });
  window.addEventListener('pointerdown', startMusicOnFirstInteraction, { once: true });

  // ---------------------------------------------------------------------------
  // 4. STEP TRANSITION LOGIC
  // ---------------------------------------------------------------------------
  function goToStep(targetStep) {
    if (targetStep < 1 || targetStep > totalSteps || targetStep === currentStep) return;

    const currentElem = steps[currentStep];
    const targetElem = steps[targetStep];

    currentElem.classList.remove('active');

    setTimeout(() => {
      targetElem.classList.add('active');
      currentStep = targetStep;

      if (currentStep < 4) {
        playChime(440 + currentStep * 80, 0.4);
      } else if (currentStep === 4) {
        triggerCelebration();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 350);
  }

  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.getAttribute('data-target'), 10);
      goToStep(target);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowDown') {
      if (currentStep < totalSteps) {
        e.preventDefault();
        goToStep(currentStep + 1);
      }
    } else if (e.code === 'ArrowUp') {
      if (currentStep > 1 && currentStep < 4) {
        e.preventDefault();
        goToStep(currentStep - 1);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 5. RUNAWAY GIFT BOX (WITH WITTY EMOJIS & BOUNCY PHYSICS)
  // ---------------------------------------------------------------------------
  const taunts = [
    "nice try 💨",
    "too slow! are you even trying? 😂",
    "did you really think it would be that easy? 🤭",
    "i can dodge all day 😜",
    "give it one more try! 🏃‍♂️✨"
  ];

  function dodgeGift(e) {
    if (e) e.preventDefault();
    dodgeCount++;
    playCheekyBoing();

    const isMobile = window.innerWidth < 600;
    const maxRangeX = isMobile ? 85 : 170;
    const maxRangeY = 40;

    let randX = (Math.random() * 2 - 1) * maxRangeX;
    let randY = (Math.random() * 2 - 1) * maxRangeY;

    if (Math.abs(randX) < 35) randX = randX < 0 ? -65 : 65;

    runawayGiftBtn.style.transform = `translate(${randX}px, ${randY}px) scale(0.96)`;

    const msgIndex = (dodgeCount - 1) % taunts.length;
    if (giftTauntText) {
      giftTauntText.style.opacity = '0';
      giftTauntText.style.transform = 'scale(0.9)';
      setTimeout(() => {
        giftTauntText.textContent = taunts[msgIndex];
        giftTauntText.style.opacity = '1';
        giftTauntText.style.transform = 'scale(1)';
      }, 150);
    }

    if (dodgeCount >= 2 && giveUpContainer) {
      giveUpContainer.classList.remove('hidden');
    }
  }

  if (runawayGiftBtn) {
    runawayGiftBtn.addEventListener('mouseenter', dodgeGift);
    runawayGiftBtn.addEventListener('click', dodgeGift);
    runawayGiftBtn.addEventListener('touchstart', dodgeGift, { passive: false });
  }

  // ---------------------------------------------------------------------------
  // 6. STEP 4 CELEBRATION REVEAL
  // ---------------------------------------------------------------------------
  function triggerCelebration() {
    // Flash effect
    if (flashOverlay) {
      flashOverlay.classList.add('active');
      setTimeout(() => flashOverlay.classList.remove('active'), 350);
    }

    playGrandChord();
    fireConfettiShow();
  }

  function fireConfettiShow() {
    if (typeof confetti !== 'function') return;

    // Center burst
    confetti({
      particleCount: 90,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#ffd166', '#f72585', '#7b2cbf', '#4cc9f0', '#ffffff']
    });

    // Side bursts
    setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#ffd166', '#ff9e00', '#f72585']
      });
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#4cc9f0', '#7b2cbf', '#ffd166']
      });
    }, 280);

    // Golden sparkles
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 110,
        origin: { y: 0.4 },
        shapes: ['star'],
        colors: ['#ffffff', '#ffd166', '#ffeaa7']
      });
    }, 650);
  }

  if (confettiBtn) {
    confettiBtn.addEventListener('click', () => {
      playChime(659.25, 0.3);
      fireConfettiShow();
    });
  }

  // Interactive Candle
  let candleBlown = false;
  if (candleTrigger) {
    const handleCandleClick = () => {
      if (candleBlown) return;
      candleBlown = true;
      candleTrigger.classList.add('blown');

      playChime(880, 1.2);

      if (wishInstruction) wishInstruction.classList.add('hidden');
      if (wishGranted) wishGranted.classList.remove('hidden');

      if (typeof confetti === 'function') {
        const rect = candleTrigger.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 45,
          spread: 60,
          startVelocity: 22,
          origin: { x, y },
          shapes: ['star', 'circle'],
          colors: ['#ffd166', '#ffffff', '#ffeedd']
        });
      }
    };

    candleTrigger.addEventListener('click', handleCandleClick);
    candleTrigger.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        handleCandleClick();
      }
    });
  }

  // Replay
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      candleBlown = false;
      if (candleTrigger) candleTrigger.classList.remove('blown');
      if (wishInstruction) wishInstruction.classList.remove('hidden');
      if (wishGranted) wishGranted.classList.add('hidden');

      dodgeCount = 0;
      if (runawayGiftBtn) runawayGiftBtn.style.transform = 'translate(0, 0)';
      if (giftTauntText) giftTauntText.textContent = '';
      if (giveUpContainer) giveUpContainer.classList.add('hidden');

      goToStep(1);
    });
  }

  // ---------------------------------------------------------------------------
  // 7. CANVAS STARFIELD WITH SHOOTING STARS & PARALLAX
  // ---------------------------------------------------------------------------
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let stars = [];
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let shootingStar = null;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      stars = [];
      const count = Math.floor((width * height) / 4200);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.6 + 0.4,
          baseAlpha: Math.random() * 0.6 + 0.15,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          speedY: (Math.random() - 0.5) * 0.1,
          speedX: (Math.random() - 0.5) * 0.1
        });
      }
    }

    function spawnShootingStar() {
      shootingStar = {
        x: Math.random() * width * 0.7,
        y: Math.random() * height * 0.4,
        length: Math.random() * 80 + 50,
        speed: Math.random() * 8 + 10,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        opacity: 1,
        decay: 0.02
      };
    }

    window.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX - width / 2) * 0.03;
      mouse.targetY = (e.clientY - height / 2) * 0.03;
    });

    let currentParallaxX = 0;
    let currentParallaxY = 0;

    function render() {
      ctx.clearRect(0, 0, width, height);

      currentParallaxX += (mouse.targetX - currentParallaxX) * 0.05;
      currentParallaxY += (mouse.targetY - currentParallaxY) * 0.05;

      for (let s of stars) {
        s.twinklePhase += s.twinkleSpeed;
        const currentAlpha = Math.max(0.08, s.baseAlpha + Math.sin(s.twinklePhase) * 0.3);

        const renderX = (s.x + currentParallaxX * s.size + width) % width;
        const renderY = (s.y + currentParallaxY * s.size + height) % height;

        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(renderX, renderY, s.size, 0, Math.PI * 2);
        ctx.fill();

        if (s.size > 1.5) {
          ctx.fillStyle = `rgba(255, 209, 102, ${currentAlpha * 0.25})`;
          ctx.beginPath();
          ctx.arc(renderX, renderY, s.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        s.x += s.speedX;
        s.y += s.speedY;
      }

      if (shootingStar) {
        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

        const grad = ctx.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
        grad.addColorStop(0.3, `rgba(255, 209, 102, ${shootingStar.opacity * 0.7})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.opacity -= shootingStar.decay;

        if (shootingStar.opacity <= 0) shootingStar = null;
      } else if (Math.random() < 0.004) {
        spawnShootingStar();
      }

      requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(render);
  }
});
