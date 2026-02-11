import { ASSETS } from "../assets/asset-keys";

export default class HUDManager {
  constructor(scene) {
    this.scene = scene;
    this.hudStar = null;
    this.starText = null;
    this.lifeHearts = [];

    // Boss health bar
    this.bossHealthBarBg = null;
    this.bossHealthBar = null;
    this.bossNameText = null;
  }

  create() {
    this.createStarHUD();
    this.createLivesHUD();
  }

  createStarHUD() {
    // Rotating star icon
    this.hudStar = this.scene.add
      .sprite(40, 40, ASSETS.ITEMS.STARS, 0)
      .setScrollFactor(0)
      .setDepth(999);

    this.hudStar.setScale(3);
    this.hudStar.play("star-spin");

    // Star count text
    this.starText = this.scene.add
      .text(75, 25, `${this.scene.starsCollected}`, {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setScrollFactor(0)
      .setDepth(999);
  }

  createLivesHUD() {
    const { width } = this.scene.cameras.main;

    const startX = width - 60;
    const y = 40;
    const spacing = 50;

    // Create 5 heart icons
    for (let i = 0; i < 5; i++) {
      const heart = this.scene.add
        .image(startX - i * spacing, y, ASSETS.ITEMS.HEART)
        .setScrollFactor(0)
        .setDepth(999)
        .setScale(0.15);

      this.lifeHearts.push(heart);
    }
  }

  updateStars(count) {
    if (this.starText) {
      this.starText.setText(`${count}`);
    }
  }

  updateLives(lives, restore = false) {
    if (restore) {
      // Show the heart that was previously hidden
      if (this.lifeHearts[lives - 1]) {
        this.lifeHearts[lives - 1].setVisible(true);

        // Add pop-in animation
        this.lifeHearts[lives - 1].setScale(0);
        this.scene.tweens.add({
          targets: this.lifeHearts[lives - 1],
          scale: 0.15,
          duration: 300,
          ease: "Back.easeOut",
        });
      }
    } else {
      // Hide the heart (taking damage)
      if (this.lifeHearts[lives]) {
        this.lifeHearts[lives].setVisible(false);
      }
    }
  }

  showBossHealth(currentHealth, maxHealth) {
    const { width } = this.scene.cameras.main;

    // Boss name
    this.bossNameText = this.scene.add
      .text(width / 2, 80, "BOSS", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(999)
      .setAlpha(0); // Start invisible

    // Health bar background (dark red)
    this.bossHealthBarBg = this.scene.add
      .rectangle(width / 2, 110, 400, 30, 0x330000)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(999)
      .setAlpha(0); // Start invisible

    // Health bar foreground (bright red)
    this.bossHealthBar = this.scene.add
      .rectangle(width / 2, 110, 396, 26, 0xff0000)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setAlpha(0); // Start invisible

    // Add border
    this.bossHealthBarBorder = this.scene.add
      .rectangle(width / 2, 110, 404, 34)
      .setStrokeStyle(4, 0xffffff)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(998)
      .setAlpha(0); // Start invisible

    // Animate in - smooth fade and slide
    this.scene.tweens.add({
      targets: [
        this.bossNameText,
        this.bossHealthBarBg,
        this.bossHealthBar,
        this.bossHealthBarBorder,
      ],
      alpha: 1,
      y: "+=20", // Slide down 20 pixels
      duration: 800,
      ease: "Power2",
    });
  }

  updateBossHealth(currentHealth, maxHealth) {
    if (!this.bossHealthBar) return;

    const healthPercent = Math.max(0, currentHealth / maxHealth);
    const maxWidth = 396;
    const newWidth = maxWidth * healthPercent;

    // Smooth width animation
    this.scene.tweens.add({
      targets: this.bossHealthBar,
      width: newWidth,
      duration: 300,
      ease: "Power2",
    });

    // Keep it red - the color represents boss rage!
    // Could darken as health decreases
    const redValue = Math.floor(200 + healthPercent * 55); // 200-255 range
    this.bossHealthBar.setFillStyle(
      (redValue << 16) | 0x0000, // Red channel only
    );
  }

  hideBossHealth() {
    const elementsToHide = [
      this.bossHealthBarBg,
      this.bossHealthBar,
      this.bossHealthBarBorder,
      this.bossNameText,
    ].filter((el) => el !== null);

    if (elementsToHide.length === 0) return;

    // Fade out animation
    this.scene.tweens.add({
      targets: elementsToHide,
      alpha: 0,
      y: "-=20", // Slide up
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        // Destroy after fade
        if (this.bossHealthBarBg) this.bossHealthBarBg.destroy();
        if (this.bossHealthBar) this.bossHealthBar.destroy();
        if (this.bossHealthBarBorder) this.bossHealthBarBorder.destroy();
        if (this.bossNameText) this.bossNameText.destroy();

        this.bossHealthBarBg = null;
        this.bossHealthBar = null;
        this.bossHealthBarBorder = null;
        this.bossNameText = null;
      },
    });
  }
}
