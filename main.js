// main.js
import { showLoading } from "./Game/loading.js";
import { showLobby } from "./Game/lobby.js";
import { clearScreen } from "./Game/screen.js";
import { LevelManager } from "./Game/levelHandler.js";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap";
document.head.appendChild(fontLink);

/* ===== GLOBAL FONT STYLE ===== */
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  * {
    font-family: 'Patrick Hand',
                 system-ui,
                 -apple-system,
                 BlinkMacSystemFont,
                 'Segoe UI',
                 Arial,
                 sans-serif !important;
  }
`;
document.head.appendChild(globalStyle);

/* ===== PREVENT SCROLL ===== */
document.documentElement.style.overflow = "hidden";
document.body.style.overflow = "hidden";

/* ===== APP ROOT ===== */
const app = document.createElement("div");
app.id = "app";
document.body.appendChild(app);

/* ===== LEVEL MANAGER ===== */
const levelManager = new LevelManager(app);

/* ===== SUBSCRIBE TO LEVEL EVENTS ===== */
levelManager.on("level:start", ({ level, difficulty }) => {
  console.log(
    `🎮 Game running | Level ${level} | Difficulty: ${difficulty}`
  );

  // Later you can call:
  // showGameScreen(app, level)
});
const debug = true;


/* ===== START APP ===== */
function startApp(container = app) {
  clearScreen(container);
  if(debug) {
        clearScreen(container);
  showLobby(container, levelManager);
  }

  else  showLoading(container, () => {
    clearScreen(container);
    showLobby(container, levelManager);
  });
}

startApp();
