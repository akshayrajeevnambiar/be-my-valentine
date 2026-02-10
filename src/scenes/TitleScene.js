import Phaser from "phaser";

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: "TitleScene" });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Title
    this.add
      .text(width / 2, height / 2 - 100, "Wheres my Shuttumani !?", {
        fontSize: "64px",
        fontFamily: "Arial",
        color: "#ff69b4",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, height / 2, "A Valentine's Journey", {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Start instruction
    const startText = this.add
      .text(width / 2, height / 2 + 100, "Press SPACE to Start", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#ffd700",
      })
      .setOrigin(0.5);

    // Blinking effect
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Start game on SPACE
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("PlayScene");
    });
  }
}
