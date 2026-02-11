import { ASSETS } from "../assets/asset-keys";

export default class CollectibleManager {
  constructor(scene) {
    this.scene = scene;
    this.stars = null;
    this.hearts = null; // Player's attack projectiles
    this.lifePickups = null; // NEW: Hearts that restore player lives
  }

  create() {
    this.createStarsGroup();
    this.createProjectiles();
    this.createLifePickupsGroup();
  }

  createStarsGroup() {
    this.stars = this.scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
  }

  createProjectiles() {
    this.hearts = this.scene.physics.add.group({ allowGravity: false });
  }

  createLifePickupsGroup() {
    this.lifePickups = this.scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
  }

  spawnStar(x, y) {
    const star = this.stars.create(x, y, ASSETS.ITEMS.STARS, 0);
    star.setScale(2.5);
    star.setDepth(25);
    star.play("star-spin");
    return star;
  }

  collectStar(star) {
    if (!star || !star.active) return;

    star.destroy();
    this.scene.starsCollected += 1;
    this.scene.hudManager.updateStars(this.scene.starsCollected);
  }

  spawnLifePickup(x, y) {
    const lifeHeart = this.lifePickups.create(x, y, ASSETS.ITEMS.HEART);

    lifeHeart.setScale(0.2);
    lifeHeart.setDepth(25);

    // Add floating animation
    this.scene.tweens.add({
      targets: lifeHeart,
      y: y - 20,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Add pulsing glow effect
    this.scene.tweens.add({
      targets: lifeHeart,
      scale: 0.25,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return lifeHeart;
  }

  collectLifePickup(lifeHeart) {
    if (!lifeHeart || !lifeHeart.active) return;

    // Don't pick up if already at max lives
    if (this.scene.playerLives >= 5) {
      return;
    }

    lifeHeart.destroy();
    this.scene.playerLives += 1;
    this.scene.hudManager.updateLives(this.scene.playerLives, true); // true = restore life

    // Visual feedback
    this.scene.cameras.main.flash(200, 255, 100, 150);

    console.log(`Life restored! Lives: ${this.scene.playerLives}/5`);
  }
}
