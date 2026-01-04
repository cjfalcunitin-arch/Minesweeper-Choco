// Game/lobby.js
export function showLobby(container, levelManager) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  styleCenter(wrapper);

  /* ===== TITLE ===== */
  const title = document.createElement("div");
  title.textContent = "SELECT MODE";
  title.style.marginBottom = "20px";
  title.style.fontSize = "42px";
  title.style.letterSpacing = "3px";

  /* ===== MODES ===== */
  const modes = [
    { name: "Normal Mode", img: "https://placehold.co/800x600?text=Normal" },
    { name: "Timer Mode", img: "https://placehold.co/800x600?text=Timer" },
    { name: "VS AI Mode", img: "https://placehold.co/800x600?text=VS+AI" }
  ];

  let currentIndex = 0;

  /* ===== SELECTOR (CONTAINER) ===== */
  const selector = document.createElement("div");
  selector.style.position = "relative";
  selector.style.width = "90vw";
  selector.style.height = "60vh";
  selector.style.border = "2px solid black";
  selector.style.borderRadius = "8px";
  selector.style.boxShadow = "0 6px 16px rgba(0,0,0,0.25)";
  selector.style.marginBottom = "14px";
  selector.style.background = "#111";
  selector.style.overflow = "hidden";

  /* ===== IMAGE WRAPPER (FULL SIZE) ===== */
  const imgWrapper = document.createElement("div");
  imgWrapper.style.width = "100%";
  imgWrapper.style.height = "100%";

  const modeImg = document.createElement("img");
  modeImg.src = modes[currentIndex].img;
  modeImg.alt = modes[currentIndex].name;
  modeImg.style.width = "100%";
  modeImg.style.height = "100%";
  modeImg.style.objectFit = "cover";
  modeImg.style.transition = "opacity 0.25s ease, transform 0.25s ease";

  imgWrapper.appendChild(modeImg);
  selector.appendChild(imgWrapper);

  /* ===== ARROW STYLE ===== */
  function styleArrow(btn, gradient, side) {
    btn.textContent = side === "left" ? "◀" : "▶";
    btn.style.position = "absolute";
    btn.style.top = "50%";
    btn.style.transform = "translateY(-50%)";
    btn.style[side] = "16px";

    btn.style.width = "60px";
    btn.style.height = "60px";
    btn.style.borderRadius = "50%";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "28px";
    btn.style.color = "#fff";
    btn.style.background = gradient;
    btn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5)";
    btn.style.transition = "transform 0.15s ease, box-shadow 0.15s ease";

    btn.onmouseenter = () => {
      btn.style.transform = "translateY(-50%) scale(1.1)";
      btn.style.boxShadow = "0 6px 14px rgba(0,0,0,0.7)";
    };

    btn.onmouseleave = () => {
      btn.style.transform = "translateY(-50%) scale(1)";
      btn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5)";
    };
  }

  /* ===== LEFT ARROW ===== */
  const leftBtn = document.createElement("button");
  styleArrow(leftBtn, "linear-gradient(135deg, #ff512f, #dd2476)", "left");

  /* ===== RIGHT ARROW ===== */
  const rightBtn = document.createElement("button");
  styleArrow(rightBtn, "linear-gradient(135deg, #24c6dc, #514a9d)", "right");

  selector.appendChild(leftBtn);
  selector.appendChild(rightBtn);

  /* ===== MODE LABEL ===== */
  const modeLabel = document.createElement("div");
  modeLabel.textContent = modes[currentIndex].name;
  modeLabel.style.fontSize = "28px";
  modeLabel.style.marginBottom = "18px";

  /* ===== UPDATE ===== */
  function updateMode(dir) {
    modeImg.style.opacity = "0";
    modeImg.style.transform = `translateX(${dir * 40}px)`;

    setTimeout(() => {
      modeImg.src = modes[currentIndex].img;
      modeLabel.textContent = modes[currentIndex].name;
      modeImg.style.transform = `translateX(${dir * -40}px)`;

      requestAnimationFrame(() => {
        modeImg.style.opacity = "1";
        modeImg.style.transform = "translateX(0)";
      });
    }, 150);
  }

  leftBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + modes.length) % modes.length;
    updateMode(-1);
  };

  rightBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % modes.length;
    updateMode(1);
  };

  /* ===== PLAY BUTTON ===== */
  const playBtn = document.createElement("button");
  playBtn.textContent = "PLAY";
  playBtn.style.background = "#2ecc71";
  playBtn.style.color = "#fff";
  playBtn.style.fontSize = "26px";
  playBtn.style.padding = "14px 54px";
  playBtn.style.border = "none";
  playBtn.style.borderRadius = "8px";
  playBtn.style.cursor = "pointer";

  playBtn.onclick = () => {
    levelManager.startGame(modes[currentIndex].name);
  };

  /* ===== ASSEMBLE ===== */
  wrapper.appendChild(title);
  wrapper.appendChild(selector);
  wrapper.appendChild(modeLabel);
  wrapper.appendChild(playBtn);
  container.appendChild(wrapper);
}

/* ===== CENTER STYLE ===== */
function styleCenter(el) {
  el.style.height = "100vh";
  el.style.display = "flex";
  el.style.flexDirection = "column";
  el.style.justifyContent = "center";
  el.style.alignItems = "center";
  el.style.fontWeight = "bold";
}
