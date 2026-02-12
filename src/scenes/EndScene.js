import Phaser from "phaser";
import { ASSETS } from "../assets/asset-keys";

export default class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndScene" });
  }

  create() {
    const { width, height } = this.cameras.main;
    if (this.cache?.audio?.exists(ASSETS.SOUNDS.MUSIC.VICTORY)) {
      this.sound.play(ASSETS.SOUNDS.MUSIC.VICTORY, { volume: 0.35, loop: true });
    }
    if (this.cache?.audio?.exists(ASSETS.SOUNDS.EFFECTS.WIN)) {
      this.sound.play(ASSETS.SOUNDS.EFFECTS.WIN, { volume: 0.6 });
    }

    // Ending message
    this.add
      .text(width / 2, height / 2 - 80, "Distance tried.", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 30, "Loneliness tried.", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 20, "But love stayed.", {
        fontSize: "36px",
        fontFamily: "Arial",
        color: "#ff69b4",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 80, "Happy Valentine's Day ❤️", {
        fontSize: "28px",
        fontFamily: "Arial",
        color: "#ffd700",
        align: "center",
      })
      .setOrigin(0.5);

    // Replay button
    const replayText = this.add
      .text(width / 2, height - 80, "Press R to Replay", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Blinking effect
    this.tweens.add({
      targets: replayText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Restart on R
    this.input.keyboard.once("keydown-R", () => {
      this.scene.start("TitleScene");
    });
  }
}
