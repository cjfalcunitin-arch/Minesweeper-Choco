// Game/levelManager.js
import { clearScreen } from "./screen.js";

export class LevelManager {
  constructor(container) {
    this.container = container;
    this.subscribers = {};
    this.state = {
      mode: null,
      status: "idle" // idle | playing | paused | gameover
    };
  }

  /* ===== EVENT SYSTEM ===== */

  on(eventName, callback) {
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }
    this.subscribers[eventName].push(callback);
  }

  emit(eventName, payload = {}) {
    const listeners = this.subscribers[eventName];
    if (!listeners) return;

    listeners.forEach(callback => callback(payload));
  }

  /* ===== GAME FLOW API ===== */

  startGame(mode) {
    console.log("▶️ Game starting in mode:", mode);

    this.state.mode = mode;
    this.state.status = "playing";

    clearScreen(this.container);

    this.emit("game:start", {
      mode: this.state.mode
    });
  }

  pauseGame() {
    if (this.state.status !== "playing") return;

    this.state.status = "paused";
    this.emit("game:pause");
  }

  resumeGame() {
    if (this.state.status !== "paused") return;

    this.state.status = "playing";
    this.emit("game:resume");
  }

  endGame(result = {}) {
    this.state.status = "gameover";
    this.emit("game:end", result);
  }

  /* ===== STATE GETTERS ===== */

  getMode() {
    return this.state.mode;
  }

  getStatus() {
    return this.state.status;
  }
}
