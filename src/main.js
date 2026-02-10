import Phaser from "phaser";
import TitleScene from "./scenes/TitleScene.js";
import EndScene from "./scenes/EndScene.js";
import PlayScene from "./scenes/PlayScene.js";

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 800, // Better ratio for windowed mode
  },
  parent: "game-container",
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 800 },
      debug: false,
    },
  },
  scene: [TitleScene, PlayScene, EndScene],
};

const game = new Phaser.Game(config);
