import Phaser from "phaser";

export default class PhotoLoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: "PhotoLoadingScene" });
    this.photoKeys = Array.from({ length: 32 }, (_, i) => `photo-${i + 1}`);
  }

  preload() {
    const { width, height } = this.cameras.main;

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 1)
      .setDepth(-1);

    const loadingText = this.add
      .text(width / 2, height / 2 - 26, "Loading Memories...", {
        fontSize: "36px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const progressText = this.add
      .text(width / 2, height / 2 + 26, "0%", {
        fontSize: "26px",
        fontFamily: "Arial",
        color: "#ffd27f",
      })
      .setOrigin(0.5);

    this.load.on("progress", (progress) => {
      progressText.setText(`${Math.round(progress * 100)}%`);
    });

    this.load.once("complete", () => {
      loadingText.setText("Ready!");
      progressText.setText("100%");
    });

    this.photoKeys.forEach((key, index) => {
      if (!this.textures.exists(key)) {
        this.load.image(key, `assets/photos/photo-${index + 1}.jpg`);
      }
    });
  }

  create() {
    this.scene.start("PlayScene");
  }
}
