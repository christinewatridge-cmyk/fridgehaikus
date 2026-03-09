function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const line1Options = [
  "cursor hums softly",
  "pop up windows glow",
  "dial up stars crackle",
  "instant message ping",
  "crt dream flickers",
  "midnight gifs shimmer",
  "vhs sky rewinds",
  "laptop keys whisper",
  "blinking cursor waits",
  "wireless dreams connect",
  "emoji moon rises",
  "clipboard holds a sigh",
  "battery burns low",
  "notifications blink"
];

const line2Options = [
  "pixelated moon buffers slowly",
  "status lights blink like secrets",
  "glitter code drifts through the fan",
  "fridge door hums in major chords",
  "soft static braids with night air",
  "screensaver orbits the room",
  "hidden songs sleep on burned cds",
  "disk drive spins a memory",
  "bluetooth hums through walls",
  "wifi waves dance in the dark",
  "usb ports dream of plugs",
  "modem sings its dial tone",
  "pixels bloom like flowers",
  "cache remembers everything"
];

const line3Options = [
  "memory tastes like neon",
  "press save on this small moment",
  "we stay logged on here",
  "time freezes to loading bars",
  "ghosts of pings say hi",
  "the fridge keeps our bright glitches",
  "restart and begin again",
  "sleep mode holds the dream",
  "close tab on the past",
  "backup the soft tomorrow",
  "undo the last goodbye",
  "sync to the quiet now"
];

let audioContext;

function playTrashSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContext;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch (e) { /* ignore */ }
}

function playMagnetClick() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContext;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (e) {
    // ignore audio errors
  }
}

function clearChildren(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function createMagnet(word, index) {
  const span = document.createElement("span");
  span.classList.add("magnet", "magnet-animate-in");

  const pastelClass = "pastel-" + ((index % 5) + 1);
  span.classList.add(pastelClass);

  const angle = (Math.random() - 0.5) * 6;
  span.style.transform = `rotate(${angle}deg)`;

  span.textContent = word;

  span.addEventListener("animationend", () => {
    span.classList.remove("magnet-animate-in");
  });

  return span;
}

function setMagnetDragMode(magnet, mode, containerId) {
  magnet.dataset.dragMode = mode;
  if (containerId) {
    magnet.dataset.dragContainerId = containerId;
  } else {
    delete magnet.dataset.dragContainerId;
  }
}

function getMagnetContainerFromDataset(magnet) {
  const id = magnet.dataset.dragContainerId;
  if (!id) return null;
  return document.getElementById(id);
}

function makeMagnetDraggable(magnet, mode, container) {
  setMagnetDragMode(magnet, mode, container ? container.id : null);
  if (magnet.dataset.dragAttached === "1") return;
  magnet.dataset.dragAttached = "1";

  let pointerId = null;

  function onPointerDown(ev) {
    if (ev.button !== undefined && ev.button !== 0) return;

    const rect = magnet.getBoundingClientRect();
    const inFridgeArea = magnet.closest("#fridge-overlay, #haiku-container, #freezer-strip");
    const inPool = magnet.classList.contains("pool-magnet") && magnet.parentElement?.id === "magnet-pool";
    const currentMode = magnet.dataset.dragMode || "viewport";
    const currentContainer = currentMode === "container" ? getMagnetContainerFromDataset(magnet) : null;

    if (inFridgeArea || (currentContainer && (currentContainer.id === "fridge-overlay" || currentContainer.id === "freezer-strip" || currentContainer.id === "fridge"))) {
      document.body.appendChild(magnet);
      magnet.style.position = "fixed";
      magnet.style.left = `${rect.left}px`;
      magnet.style.top = `${rect.top}px`;
      magnet.style.right = "auto";
      magnet.style.transform = "";
    } else if (currentMode !== "container") {
      if (inPool) {
        const ph = document.createElement("span");
        ph.className = "magnet-pool-placeholder";
        magnet.parentElement.insertBefore(ph, magnet);
      }
      if (magnet.parentElement !== document.body) {
        document.body.appendChild(magnet);
        magnet.style.position = "fixed";
        magnet.style.left = `${rect.left}px`;
        magnet.style.top = `${rect.top}px`;
        magnet.style.right = "auto";
      } else if (magnet.style.right && magnet.style.right !== "auto") {
        magnet.style.left = `${rect.left}px`;
        magnet.style.right = "auto";
      }
    } else if (currentContainer) {
      const containerRect = currentContainer.getBoundingClientRect();
      magnet.style.position = "absolute";
      magnet.style.left = `${rect.left - containerRect.left}px`;
      magnet.style.top = `${rect.top - containerRect.top}px`;
      magnet.style.right = "auto";
      magnet.style.margin = "0";
      currentContainer.appendChild(magnet);
    }

    pointerId = ev.pointerId;
    magnet.setPointerCapture(pointerId);
    magnet.classList.add("magnet-dragging");
    magnet.style.zIndex = "10";

    const r0 = magnet.getBoundingClientRect();
    const shiftX = ev.clientX - r0.left;
    const shiftY = ev.clientY - r0.top;

    function move(ev2) {
      const inBody = magnet.parentElement === document.body;
      const activeMode = magnet.dataset.dragMode || "viewport";
      const activeContainer = activeMode === "container" ? getMagnetContainerFromDataset(magnet) : null;
      const cid = activeContainer ? activeContainer.id : "";
      const isFridgeOrFreezer = cid === "fridge-overlay" || cid === "freezer-strip" || cid === "fridge";
      const useViewport = inBody || !activeContainer || isFridgeOrFreezer;
      const bounds = useViewport
        ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, right: window.innerWidth, bottom: window.innerHeight }
        : activeContainer.getBoundingClientRect();

      const r = magnet.getBoundingClientRect();
      const rectWidth = r.width;
      const rectHeight = r.height;

      let newLeft = ev2.clientX - bounds.left - shiftX;
      let newTop = ev2.clientY - bounds.top - shiftY;

      newLeft = Math.max(0, Math.min(newLeft, bounds.width - rectWidth));
      newTop = Math.max(0, Math.min(newTop, bounds.height - rectHeight));

      magnet.style.left = `${newLeft}px`;
      magnet.style.top = `${newTop}px`;
    }

    function up(ev2) {
      document.querySelector(".magnet-pool-placeholder")?.remove();

      if (pointerId !== null) {
        magnet.releasePointerCapture(pointerId);
      }
      magnet.classList.remove("magnet-dragging");
      magnet.style.zIndex = "5";

      if (isMagnetOverTrashcan(magnet)) {
        playTrashSound();
        magnet.remove();
        magnet.removeEventListener("pointermove", move);
        magnet.removeEventListener("pointerup", up);
        magnet.removeEventListener("pointercancel", up);
        pointerId = null;
        return;
      }

      playMagnetClick();

      const activeMode = magnet.dataset.dragMode || "viewport";
      const fridgeOverlay = getFridgeOverlay();
      const freezer = document.getElementById("freezer-strip");
      const containerId = magnet.dataset.dragContainerId;
      const px = ev2.clientX;
      const py = ev2.clientY;
      const r = magnet.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      let placed = false;
      if (activeMode === "container" && containerId === "fridge-overlay" && fridgeOverlay) {
        const overlayRect = fridgeOverlay.getBoundingClientRect();
        const isOverFridge = cx >= overlayRect.left && cx <= overlayRect.right && cy >= overlayRect.top && cy <= overlayRect.bottom;
        if (isOverFridge) {
          let leftPct = ((cx - overlayRect.left) / overlayRect.width) * 100;
          let topPct = ((cy - overlayRect.top) / overlayRect.height) * 100;
          const minLeft = (r.width / overlayRect.width) * 50;
          const maxLeft = 100 - minLeft;
          const minTop = (r.height / overlayRect.height) * 50;
          const maxTop = 100 - minTop;
          leftPct = Math.max(minLeft, Math.min(maxLeft, leftPct));
          topPct = Math.max(minTop, Math.min(maxTop, topPct));
          fridgeOverlay.appendChild(magnet);
          magnet.style.position = "absolute";
          magnet.style.left = `${leftPct}%`;
          magnet.style.top = `${topPct}%`;
          magnet.style.right = "auto";
          magnet.style.transform = "translate(-50%, -50%)";
          magnet.style.margin = "0";
          placed = true;
        }
      } else if (activeMode === "container" && containerId === "freezer-strip" && freezer) {
        const stripRect = freezer.getBoundingClientRect();
        const isOverFreezer = cx >= stripRect.left && cx <= stripRect.right && cy >= stripRect.top && cy <= stripRect.bottom;
        if (isOverFreezer) {
          let leftPx = cx - stripRect.left - r.width / 2;
          let topPx = cy - stripRect.top - r.height / 2;
          const maxLeft = Math.max(0, stripRect.width - r.width);
          const maxTop = Math.max(0, stripRect.height - r.height);
          leftPx = Math.max(0, Math.min(maxLeft, leftPx));
          topPx = Math.max(0, Math.min(maxTop, topPx));
          freezer.appendChild(magnet);
          magnet.style.position = "absolute";
          magnet.style.left = `${leftPx}px`;
          magnet.style.top = `${topPx}px`;
          magnet.style.right = "auto";
          magnet.style.transform = "";
          magnet.style.margin = "0";
          placed = true;
        }
      }
      if (!placed && (containerId === "fridge-overlay" || containerId === "freezer-strip")) {
        setMagnetDragMode(magnet, "viewport", null);
        magnet.style.left = `${r.left}px`;
        magnet.style.top = `${r.top}px`;
      }
      if (activeMode === "viewport" && magnet.classList.contains("pool-magnet")) {
        const fridgeEl = document.getElementById("fridge");
        const overlay = fridgeOverlay;
        if (fridgeEl && overlay) {
          const overlayRect = overlay.getBoundingClientRect();
          if (px >= overlayRect.left && px <= overlayRect.right &&
              py >= overlayRect.top && py <= overlayRect.bottom) {
            let leftPct = ((px - overlayRect.left) / overlayRect.width) * 100;
            let topPct = ((py - overlayRect.top) / overlayRect.height) * 100;
            const minLeft = (r.width / overlayRect.width) * 50;
            const maxLeft = 100 - minLeft;
            const minTop = (r.height / overlayRect.height) * 50;
            const maxTop = 100 - minTop;
            const clampedLeft = Math.max(minLeft, Math.min(maxLeft, leftPct));
            const clampedTop = Math.max(minTop, Math.min(maxTop, topPct));
            magnet.classList.remove("pool-magnet");
            overlay.appendChild(magnet);
            magnet.style.position = "absolute";
            magnet.style.left = `${clampedLeft}%`;
            magnet.style.top = `${clampedTop}%`;
            magnet.style.transform = "translate(-50%, -50%)";
            magnet.style.margin = "0";
            setMagnetDragMode(magnet, "container", "fridge-overlay");
          }
        }
      }

      magnet.removeEventListener("pointermove", move);
      magnet.removeEventListener("pointerup", up);
      magnet.removeEventListener("pointercancel", up);
      pointerId = null;
    }

    magnet.addEventListener("pointermove", move);
    magnet.addEventListener("pointerup", up);
    magnet.addEventListener("pointercancel", up);
  }

  magnet.addEventListener("pointerdown", onPointerDown);
}

function getFridgeOverlay() {
  return document.getElementById("fridge-overlay");
}

function isMagnetOverTrashcan(magnet) {
  const trash = document.getElementById("magnet-trashcan");
  if (!trash) return false;
  const mr = magnet.getBoundingClientRect();
  const tr = trash.getBoundingClientRect();
  const cx = mr.left + mr.width / 2;
  const cy = mr.top + mr.height / 2;
  return cx >= tr.left && cx <= tr.right && cy >= tr.top && cy <= tr.bottom;
}

function freezeMagnetsLayout() {
  const container = document.getElementById("haiku-container");
  const overlay = getFridgeOverlay();
  if (!container || !overlay) return;

  const magnets = Array.from(container.querySelectorAll(".magnet"));
  if (!magnets.length) return;

  const overlayRect = overlay.getBoundingClientRect();
  const positions = magnets.map((m) => m.getBoundingClientRect());

  magnets.forEach((magnet, index) => {
    const rect = positions[index];
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let leftPct = ((cx - overlayRect.left) / overlayRect.width) * 100;
    let topPct = ((cy - overlayRect.top) / overlayRect.height) * 100;
    const minLeft = (rect.width / overlayRect.width) * 50;
    const maxLeft = 100 - minLeft;
    const minTop = (rect.height / overlayRect.height) * 50;
    const maxTop = 100 - minTop;
    leftPct = Math.max(minLeft, Math.min(maxLeft, leftPct));
    topPct = Math.max(minTop, Math.min(maxTop, topPct));
    overlay.appendChild(magnet);
    magnet.style.position = "absolute";
    magnet.style.left = `${leftPct}%`;
    magnet.style.top = `${topPct}%`;
    magnet.style.right = "auto";
    magnet.style.margin = "0";
    magnet.style.transform = "translate(-50%, -50%)";
    setMagnetDragMode(magnet, "container", "fridge-overlay");
  });

  container.querySelectorAll(".haiku-line").forEach((line) => line.remove());
  container.style.position = "relative";
  container.style.height = "100%";
}

function renderHaiku(lines) {
  const container = document.getElementById("haiku-container");
  if (!container) return;

  clearChildren(container);

  const fridge = document.getElementById("fridge");
  lines.forEach((line, lineIndex) => {
    const lineEl = document.createElement("div");
    lineEl.classList.add("haiku-line");
    const words = line.split(/\s+/).filter(Boolean);
    words.forEach((word, wordIndex) => {
      const magnet = createMagnet(word, lineIndex * 10 + wordIndex);
      magnet.dataset.haiku = "1";
      lineEl.appendChild(magnet);
      makeMagnetDraggable(magnet, "container", getFridgeOverlay() || fridge);
    });
    container.appendChild(lineEl);
  });

  requestAnimationFrame(freezeMagnetsLayout);
}

function removeOldHaikuMagnets() {
  const overlay = getFridgeOverlay();
  if (overlay) {
    overlay.querySelectorAll(".magnet[data-haiku]").forEach((m) => m.remove());
  }
  document.querySelectorAll(".magnet[data-haiku]").forEach((m) => m.remove());
}

function clearFridge() {
  removeOldHaikuMagnets();
  document.querySelectorAll(".magnet.freezer-magnet").forEach((m) => m.remove());
  const freezer = document.getElementById("freezer-strip");
  if (freezer) clearChildren(freezer);
  const overlay = getFridgeOverlay();
  if (overlay) {
    overlay.querySelectorAll(".magnet").forEach((m) => m.remove());
  }
  const container = document.getElementById("haiku-container");
  if (container) clearChildren(container);
}

function generateHaiku() {
  removeOldHaikuMagnets();

  const lines = [
    getRandomItem(line1Options),
    getRandomItem(line2Options),
    getRandomItem(line3Options)
  ];

  renderHaiku(lines);
  renderFreezerMagnets();
}

function spawnSparkle() {
  const layer = document.getElementById("sparkle-layer");
  if (!layer) return;

  const sparkle = document.createElement("div");
  sparkle.classList.add("sparkle");

  const type = Math.floor(Math.random() * 3) + 1;
  sparkle.classList.add(`type-${type}`);

  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const size = 8 + Math.random() * 16;

  sparkle.style.left = `${x}vw`;
  sparkle.style.top = `${y}vh`;
  sparkle.style.width = `${size}px`;
  sparkle.style.height = `${size}px`;

  layer.appendChild(sparkle);

  sparkle.addEventListener("animationend", () => {
    sparkle.remove();
  });
}

function initSparkles() {
  for (let i = 0; i < 20; i += 1) {
    setTimeout(spawnSparkle, i * 90);
  }

  setInterval(spawnSparkle, 260);
}

function repositionSideMagnets() {
  if (!window.matchMedia("(min-width: 1101px)").matches) return;
  const leftMagnets = Array.from(document.querySelectorAll('.side-magnet[data-side="left"]'));
  const rightMagnets = Array.from(document.querySelectorAll('.side-magnet[data-side="right"]'));
  const leftSidebar = document.getElementById("sidebar-left");
  const rightSidebar = document.getElementById("sidebar-right");
  leftMagnets.forEach((m) => {
    if (m.parentElement !== leftSidebar) leftSidebar?.appendChild(m);
  });
  rightMagnets.forEach((m) => {
    if (m.parentElement !== rightSidebar) rightSidebar?.appendChild(m);
  });
}

function fixOrphanMagnetsOnBreakpoint() {
  const isDesktop = window.matchMedia("(min-width: 1101px)").matches;
  const poolContainer = document.getElementById("magnet-pool");
  const leftSidebar = document.getElementById("sidebar-left");
  const rightSidebar = document.getElementById("sidebar-right");
  if (poolContainer) {
    document.querySelectorAll(".pool-magnet").forEach((m) => {
      if (m.parentElement === document.body) {
        poolContainer.appendChild(m);
        m.style.position = "";
        m.style.left = "";
        m.style.top = "";
        m.style.right = "";
      }
    });
  }
  if (isDesktop) {
    document.querySelectorAll('.side-magnet[data-side="left"]').forEach((m) => {
      if (m.parentElement === document.body && leftSidebar) {
        leftSidebar.appendChild(m);
        m.style.position = "";
        m.style.left = "";
        m.style.top = "";
        m.style.right = "";
      }
    });
    document.querySelectorAll('.side-magnet[data-side="right"]').forEach((m) => {
      if (m.parentElement === document.body && rightSidebar) {
        rightSidebar.appendChild(m);
        m.style.position = "";
        m.style.left = "";
        m.style.top = "";
        m.style.right = "";
      }
    });
    repositionSideMagnets();
  }
}

function initSideMagnets() {
  const leftPool = [
    "glitch", "sparkle", "nostalgia", "soft", "dream", "buffering", "neon",
    "pixel", "static", "memory", "late", "night", "save", "reload", "magic",
    "blink", "y2k", "chrome", "angel", "bubble", "cool", "shimmer", "kawaii",
    "gel", "hologram", "sticky", "scribble", "mix", "velvet", "sweet", "crush",
    "sugar", "glow", "star", "it", "he", "she", "they", "we", "you", "and",
    "or", "but", "if", "then", "softly", "slowly", "quickly", "brightly"
  ];
  const rightPool = [
    "future", "loop", "signal", "gentle", "noise", "gif", "dialup", "sky",
    "wired", "offline", "cloud", "screen", "click", "song", "echo", "orbit",
    "satellite", "laser", "synth", "rewind", "tape", "codec", "portal",
    "refresh", "desktop", "tab", "cache", "loading", "cursor", "window",
    "scroll", "silence", "signalwave", "midnight", "stream", "buffer",
    "download", "upload", "render", "encode", "decrypt", "debug"
  ];

  function randomSubset(arr, count) {
    const copy = arr.slice();
    const result = [];
    while (copy.length && result.length < count) {
      const idx = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  }

  const leftWords = randomSubset(leftPool, 18);
  const usedAtStart = new Set(leftWords);
  const rightWords = [];
  while (rightWords.length < 18) {
    const w = rightPool.find((p) => !usedAtStart.has(p));
    if (!w) break;
    usedAtStart.add(w);
    rightWords.push(w);
  }

  function decorate(magnet) {
    magnet.style.setProperty("--float-amp", `${4 + Math.random() * 6}px`);
    magnet.style.setProperty("--rot0", `${(Math.random() - 0.5) * 6}deg`);
    magnet.style.setProperty("--rot1", `${(Math.random() - 0.5) * 8}deg`);
    magnet.style.setProperty("--rot2", `${(Math.random() - 0.5) * 8}deg`);
    magnet.style.setProperty("--float-dur", `${3 + Math.random() * 3}s`);
    magnet.style.setProperty("--float-delay", `${Math.random() * 2}s`);
  }

  const leftSidebar = document.getElementById("sidebar-left");
  const rightSidebar = document.getElementById("sidebar-right");
  const fridge = document.getElementById("fridge");
  leftWords.forEach((word, i) => {
    const magnet = createMagnet(word, 200 + i);
    magnet.classList.add("side-magnet");
    magnet.dataset.side = "left";
    if (leftSidebar) leftSidebar.appendChild(magnet);
    else document.body.appendChild(magnet);
    makeMagnetDraggable(magnet, "viewport", null);
    decorate(magnet);
  });
  rightWords.forEach((word, i) => {
    const magnet = createMagnet(word, 300 + i);
    magnet.classList.add("side-magnet");
    magnet.dataset.side = "right";
    if (rightSidebar) rightSidebar.appendChild(magnet);
    else document.body.appendChild(magnet);
    makeMagnetDraggable(magnet, "viewport", null);
    decorate(magnet);
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      fixOrphanMagnetsOnBreakpoint();
    }, 150);
  });
  const mq = window.matchMedia("(min-width: 1101px)");
  mq.addEventListener("change", fixOrphanMagnetsOnBreakpoint);
}

const MAGNET_POOL_WORDS = [
  "glitch", "sparkle", "nostalgia", "soft", "dream", "buffering", "neon",
  "pixel", "static", "memory", "late", "night", "save", "reload", "magic",
  "blink", "y2k", "chrome", "angel", "bubble", "cool", "shimmer", "kawaii",
  "gel", "hologram", "sticky", "scribble", "mix", "velvet", "sweet",
  "future", "loop", "signal", "gentle", "noise", "gif", "dialup", "sky",
  "wired", "offline", "cloud", "screen", "click", "song", "echo", "orbit"
];

function initMagnetPool() {
  function randomSubset(arr, count) {
    const copy = arr.slice();
    const result = [];
    while (copy.length && result.length < count) {
      const idx = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  }

  function decoratePoolMagnet(magnet) {
    const amp = 4 + Math.random() * 6;
    const rot0 = (Math.random() - 0.5) * 6;
    magnet.style.setProperty("--float-amp", `${amp}px`);
    magnet.style.setProperty("--rot0", `${rot0}deg`);
    magnet.style.setProperty("--rot1", `${rot0 + (Math.random() - 0.5) * 8}deg`);
    magnet.style.setProperty("--rot2", `${rot0 + (Math.random() - 0.5) * 8}deg`);
    magnet.style.setProperty("--float-dur", `${3 + Math.random() * 3}s`);
    magnet.style.setProperty("--float-delay", `${Math.random() * 2}s`);
  }

  const container = document.getElementById("magnet-pool");
  if (!container) return;

  const words = randomSubset(MAGNET_POOL_WORDS, 20);
  words.forEach((word, i) => {
    const magnet = createMagnet(word, 100 + i);
    magnet.classList.add("pool-magnet");
    container.appendChild(magnet);
    makeMagnetDraggable(magnet, "viewport", null);
    decoratePoolMagnet(magnet);
  });

  function rotatePoolWords() {
    if (!window.matchMedia("(max-width: 1100px)").matches) return;
    const poolMagnets = Array.from(container.querySelectorAll(".pool-magnet"));
    if (poolMagnets.length === 0) return;
    const countToReplace = Math.min(2 + Math.floor(Math.random() * 3), poolMagnets.length);
    const indices = [];
    while (indices.length < countToReplace) {
      const i = Math.floor(Math.random() * poolMagnets.length);
      if (!indices.includes(i)) indices.push(i);
    }
    let used = new Set(poolMagnets.map((m) => m.textContent.trim()));
    indices.forEach((idx) => {
      const magnet = poolMagnets[idx];
      const oldWord = magnet.textContent.trim();
      const candidates = MAGNET_POOL_WORDS.filter((w) => !used.has(w));
      if (candidates.length === 0) return;
      const newWord = candidates[Math.floor(Math.random() * candidates.length)];
      magnet.style.opacity = "0";
      requestAnimationFrame(() => {
        magnet.textContent = newWord;
        magnet.style.opacity = "";
        magnet.classList.add("magnet-rotate-fade");
        magnet.addEventListener("animationend", function onEnd() {
          magnet.classList.remove("magnet-rotate-fade");
          magnet.removeEventListener("animationend", onEnd);
        }, { once: true });
      });
      used.delete(oldWord);
      used.add(newWord);
    });
  }

  function scheduleNext() {
    const delay = 3000 + Math.random() * 2000;
    setTimeout(() => {
      rotatePoolWords();
      scheduleNext();
    }, delay);
  }
  scheduleNext();
}

function renderFreezerMagnets() {
  document.querySelectorAll(".magnet.freezer-magnet").forEach((m) => m.remove());

  const freezer = document.getElementById("freezer-strip");
  if (!freezer) return;

  const allWords = [
    "it",
    "he",
    "she",
    "they",
    "we",
    "you",
    "do",
    "did",
    "are",
    "is",
    "was",
    "be",
    "of",
    "and",
    "or",
    "but",
    "bright",
    "soft",
    "loud",
    "slow",
    "quick",
    "always",
    "never",
    "gently",
    "suddenly",
    "float",
    "drift",
    "glow",
    "remember",
    "forget",
    "maybe",
    "almost",
    "still",
    "often",
    "once",
    "here",
    "there",
    "then",
    "cold",
    "cool",
    "icy",
    "frost",
    "chill",
    "freeze",
    "melt",
    "snow",
    "warm",
    "yes",
    "no",
    "yet",
    "so",
    "very",
    "quite",
    "well",
    "just",
    "only",
    "even",
    "ever",
    "now",
    "far",
    "near",
    "high",
    "low",
    "hot",
    "deep",
    "calm",
    "bold",
    "mild",
    "wild",
    "dear",
    "fair",
    "pure",
    "true",
    "vain",
    "keen",
    "rare",
    "vast",
    "tame"
  ];

  const fridgeEl = document.getElementById("fridge");
  if (!fridgeEl) return;

  clearChildren(freezer);

  const count = 3 + Math.floor(Math.random() * 3); // 3–5
  const used = new Set();
  const insetLeft = 12;
  const insetRight = 10;
  const insetTop = 8;
  const insetBottom = 8;
  const gap = 4;
  const stripW = freezer.offsetWidth || 200;
  const stripH = freezer.offsetHeight || 60;
  const placed = [];

  function overlaps(a, b) {
    return a.left < b.left + b.width + gap &&
      a.left + a.width + gap > b.left &&
      a.top < b.top + b.height + gap &&
      a.top + a.height + gap > b.top;
  }

  for (let i = 0; i < count; i += 1) {
    const candidates = allWords.filter((w) => !used.has(w));
    if (!candidates.length) break;
    const word = candidates[Math.floor(Math.random() * candidates.length)];
    used.add(word);
    const magnet = createMagnet(word, 9000 + i);
    magnet.classList.add("freezer-magnet");
    magnet.style.position = "absolute";
    magnet.style.right = "auto";
    magnet.style.margin = "0";
    freezer.appendChild(magnet);

    const magnetW = magnet.offsetWidth || 48;
    const magnetH = magnet.offsetHeight || 24;
    const maxLeft = Math.max(0, stripW - insetLeft - insetRight - magnetW);
    const maxTop = Math.max(0, stripH - insetTop - insetBottom - magnetH);

    let left, top;
    let attempts = 0;
    const maxAttempts = 80;

    do {
      left = insetLeft + (maxLeft > 0 ? Math.random() * maxLeft : 0);
      top = insetTop + (maxTop > 0 ? Math.random() * maxTop : 0);
      const rect = { left, top, width: magnetW, height: magnetH };
      const collides = placed.some((p) => overlaps(rect, p));
      if (!collides) break;
      attempts++;
    } while (attempts < maxAttempts);

    magnet.style.left = `${left}px`;
    magnet.style.top = `${top}px`;
    placed.push({ left, top, width: magnetW, height: magnetH });
    makeMagnetDraggable(magnet, "container", freezer);
  }
}

function initCustomMagnetButton() {
  const button = document.getElementById("add-magnet-btn");
  const poolContainer = document.getElementById("magnet-pool");
  if (!button) return;

  button.addEventListener("click", () => {
    const input = window.prompt(
      "Type your magnet words, separated by spaces:"
    );
    if (!input) return;

    const words = input.split(/\s+/).filter(Boolean);
    if (!words.length) return;

    const isMobile = window.matchMedia("(max-width: 1100px)").matches;

    if (isMobile && poolContainer) {
      words.forEach((word, idx) => {
        const magnet = createMagnet(word, 5000 + idx);
        magnet.classList.add("pool-magnet");
        magnet.style.setProperty("--float-amp", `${4 + Math.random() * 6}px`);
        magnet.style.setProperty("--rot0", `${(Math.random() - 0.5) * 6}deg`);
        magnet.style.setProperty("--float-dur", `${3 + Math.random() * 3}s`);
        magnet.style.setProperty("--float-delay", `${Math.random() * 2}s`);
        poolContainer.appendChild(magnet);
        makeMagnetDraggable(magnet, "viewport", null);
      });
    } else {
      const leftSidebar = document.getElementById("sidebar-left");
      words.forEach((word, idx) => {
        const magnet = createMagnet(word, 5000 + idx);
        magnet.classList.add("side-magnet");
        magnet.dataset.side = "left";
        magnet.style.setProperty("--float-amp", `${4 + Math.random() * 6}px`);
        magnet.style.setProperty("--rot0", `${(Math.random() - 0.5) * 6}deg`);
        magnet.style.setProperty("--float-dur", `${3 + Math.random() * 3}s`);
        magnet.style.setProperty("--float-delay", `${Math.random() * 2}s`);
        if (leftSidebar) leftSidebar.appendChild(magnet);
        else document.body.appendChild(magnet);
        makeMagnetDraggable(magnet, "viewport", null);
      });
    }
  });
}

function initDraggableWindow() {
  const windowEl = document.querySelector(".y2k-window");
  const handle = document.querySelector(".window-title-bar");
  const closeBtn = document.querySelector(".btn-close");
  if (!windowEl || !handle) return;

  let pointerId = null;

  function onPointerDown(ev) {
    if (ev.button !== undefined && ev.button !== 0) return;
    if (ev.target.closest(".btn-dot")) return;

    pointerId = ev.pointerId;
    handle.setPointerCapture(pointerId);

    const rect = windowEl.getBoundingClientRect();
    const startLeft = rect.left;
    const startTop = rect.top;
    const shiftX = ev.clientX - startLeft;
    const shiftY = ev.clientY - startTop;

    windowEl.style.position = "fixed";
    windowEl.style.left = `${startLeft}px`;
    windowEl.style.top = `${startTop}px`;
    windowEl.style.margin = "0";
    windowEl.style.zIndex = "20";

    function move(ev2) {
      const newLeft = ev2.clientX - shiftX;
      const newTop = ev2.clientY - shiftY;
      windowEl.style.left = `${newLeft}px`;
      windowEl.style.top = `${newTop}px`;
    }

    function up() {
      handle.releasePointerCapture(pointerId);
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      pointerId = null;
    }

    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  }

  handle.addEventListener("pointerdown", onPointerDown);

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      windowEl.style.display = "none";
    });
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("generate-btn");
  if (button) {
    button.addEventListener("click", generateHaiku);
  }
  const clearBtn = document.getElementById("clear-fridge-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearFridge);
  }

  generateHaiku();
  initSparkles();
  initDraggableWindow();
  initSideMagnets();
  initMagnetPool();
  initCustomMagnetButton();
});

