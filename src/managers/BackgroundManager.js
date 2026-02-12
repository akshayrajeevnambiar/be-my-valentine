import { ASSETS } from "../assets/asset-keys";

export default class BackgroundManager {
  constructor(scene) {
    this.scene = scene;

    // Parallax factors
    this.CLOUD_PARALLAX = 0.25;
    this.HILLS_PARALLAX = 0.5;
    this.TREES_PARALLAX = 0.75;

    // Background layers
    this.bgSky = null;
    this.bgClouds1 = null;
    this.bgClouds2 = null;
    this.bgHills1 = null;
    this.bgHills2 = null;
    this.bgTrees1 = null;
    this.bgTrees2 = null;

    // Optional cinematic drift used by end cutscene/slideshow
    this.cinematicScrollSpeed = 0;
    this.cinematicScrollX = 0;
  }

  create() {
    const { width, height } = this.scene.cameras.main;
    const y = -this.scene.TILE_SIZE;

    // Static sky background
    this.bgSky = this.scene.add
      .image(0, y, ASSETS.BACKGROUNDS.NATURE.SKY)
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setScrollFactor(0)
      .setDepth(-50);

    // Create looping parallax layers
    this.createLoopingLayer("Clouds", ASSETS.BACKGROUNDS.NATURE.CLOUDS, y);
    this.createLoopingLayer("Hills", ASSETS.BACKGROUNDS.NATURE.HILLS, y);
    this.createLoopingLayer("Trees", ASSETS.BACKGROUNDS.NATURE.TREES, y);

    // Set depths
    this.bgClouds1.setDepth(-40);
    this.bgClouds2.setDepth(-40);
    this.bgHills1.setDepth(-30);
    this.bgHills2.setDepth(-30);
    this.bgTrees1.setDepth(-20);
    this.bgTrees2.setDepth(-20);
  }

  createLoopingLayer(name, textureKey, y) {
    const { width, height } = this.scene.cameras.main;

    const src = this.scene.textures.get(textureKey).getSourceImage();
    const scaleX = width / src.width;
    const scaleY = height / src.height;

    const img1 = this.scene.add.image(0, y, textureKey).setOrigin(0, 0);
    img1.setScale(scaleX, scaleY).setScrollFactor(0);

    const img2 = this.scene.add
      .image(img1.displayWidth, y, textureKey)
      .setOrigin(0, 0);
    img2.setScale(scaleX, scaleY).setScrollFactor(0);

    this[`bg${name}1`] = img1;
    this[`bg${name}2`] = img2;
  }

  update() {
    const camX = this.scene.cameras.main.scrollX;
    this.cinematicScrollX += this.cinematicScrollSpeed;
    const effectiveX = camX + this.cinematicScrollX;

    this.loopLayer(
      this.bgClouds1,
      this.bgClouds2,
      effectiveX,
      this.CLOUD_PARALLAX,
    );
    this.loopLayer(this.bgHills1, this.bgHills2, effectiveX, this.HILLS_PARALLAX);
    this.loopLayer(this.bgTrees1, this.bgTrees2, effectiveX, this.TREES_PARALLAX);
  }

  setCinematicScrollSpeed(speed = 0) {
    this.cinematicScrollSpeed = speed;
  }

  loopLayer(img1, img2, camX, factor) {
    const w = img1.displayWidth;
    const offset = -((camX * factor) % w);

    img1.x = Math.floor(offset);
    img2.x = Math.floor(offset + w);
  }
}
