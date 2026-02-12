import Phaser from "phaser";
import EndScene from "./scenes/EndScene.js";
import PlayScene from "./scenes/PlayScene.js";
import IntroScene from "./scenes/IntroScene.js";
import PhotoLoadingScene from "./scenes/PhotoLoadingScene.js";

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
  scene: [PhotoLoadingScene, PlayScene, EndScene],
};

const game = new Phaser.Game(config);
