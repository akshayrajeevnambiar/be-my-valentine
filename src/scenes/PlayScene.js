import Phaser from "phaser";
import { ASSETS } from "../assets/asset-keys";

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayScene" });

    // --- STATE ---
    this.lastAnimKey = null;
    this.isAttacking = false;

    // --- CONSTANTS ---
    this.TILE_SIZE = 128;
    this.SPEED = 350;
    this.JUMP_VELOCITY = 1000;

    this.CLOUD_PARALLAX = 0.25;
    this.HILLS_PARALLAX = 0.5;
    this.TREES_PARALLAX = 0.75;

    this.ATTACK_COOLDOWN = 450;

    // ✅ IMPORTANT: initialize counters
    this.starsCollected = 0;
  }

  preload() {
    this.preloadBackgrounds();
    this.preloadCharacters();
    this.preloadTiles();
    this.preloadItems();
  }

  create() {
    const { width, height } = this.cameras.main;
    this.viewWidth = width;
    this.viewHeight = height;

    this.createBackground();
    this.createPlatforms();
    this.createInput();
    this.createAnimations();
    this.createPlayer();

    this.createProjectiles();
    this.createStarsGroup();
    this.setupStarCollect();

    this.createStarHUD();

    this.setupCamera();

    // Level test stars
    const groundTopY = height - this.TILE_SIZE;

    this.buildPlatformsLevel1();

    this.playAnim("idle");
    this.physics.world.createDebugGraphic();
  }

  // -----------------------
  // PRELOAD HELPERS
  // -----------------------
  preloadBackgrounds() {
    this.load.image(
      ASSETS.BACKGROUNDS.NATURE.SKY,
      "assets/enviroment/backgrounds/nature/sky.png",
    );
    this.load.image(
      ASSETS.BACKGROUNDS.NATURE.HILLS,
      "assets/enviroment/backgrounds/nature/hills.png",
    );
    this.load.image(
      ASSETS.BACKGROUNDS.NATURE.TREES,
      "assets/enviroment/backgrounds/nature/trees.png",
    );
    this.load.image(
      ASSETS.BACKGROUNDS.NATURE.CLOUDS,
      "assets/enviroment/backgrounds/nature/clouds.png",
    );
  }

  preloadCharacters() {
    this.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.IDLE,
      "assets/characters/theertha/idle.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    this.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.RUN,
      "assets/characters/theertha/run.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    this.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.JUMP,
      "assets/characters/theertha/jump.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    this.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.KISS,
      "assets/characters/theertha/kiss.png",
      { frameWidth: 256, frameHeight: 256 },
    );

    this.load.spritesheet(
      ASSETS.CHARACTERS.MINION.IDLE,
      "assets/characters/enemies/minion/Idle.png",
      { frameWidth: 16, frameHeight: 16 },
    );
    this.load.spritesheet(
      ASSETS.CHARACTERS.MINION.RUN,
      "assets/characters/enemies/minion/Run.png",
      { frameWidth: 16, frameHeight: 16 },
    );
  }

  preloadItems() {
    this.load.image(ASSETS.ITEMS.HEART, "assets/items/heart.png");

    // ✅ 112x16 sheet with 7 frames => 16x16 per frame
    this.load.spritesheet(ASSETS.ITEMS.STARS, "assets/items/stars.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  preloadTiles() {
    this.load.image(
      ASSETS.TILESETS.GRASS_GROUND.LEFT,
      "assets/enviroment/tilesets/grass-tile-left.png",
    );
    this.load.image(
      ASSETS.TILESETS.GRASS_GROUND.MIDDLE,
      "assets/enviroment/tilesets/grass-tile-middle.png",
    );
    this.load.image(
      ASSETS.TILESETS.GRASS_GROUND.RIGHT,
      "assets/enviroment/tilesets/grass-tile-right.png",
    );
    this.load.image(
      ASSETS.TILESETS.GRASS_FLOATING.LEFT,
      "assets/enviroment/tilesets/grass-floating-tile-left.png",
    );
    this.load.image(
      ASSETS.TILESETS.GRASS_FLOATING.MIDDLE,
      "assets/enviroment/tilesets/grass-floating-tile-middle.png",
    );
    this.load.image(
      ASSETS.TILESETS.GRASS_FLOATING.RIGHT,
      "assets/enviroment/tilesets/grass-floating-tile-right.png",
    );
  }

  // -----------------------
  // CREATE HELPERS
  // -----------------------
  createBackground() {
    const { width, height } = this.cameras.main;
    const y = -this.TILE_SIZE;

    this.bgSky = this.add
      .image(0, y, ASSETS.BACKGROUNDS.NATURE.SKY)
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setScrollFactor(0)
      .setDepth(-50);

    this.createLoopingLayer("Clouds", ASSETS.BACKGROUNDS.NATURE.CLOUDS, y);
    this.createLoopingLayer("Hills", ASSETS.BACKGROUNDS.NATURE.HILLS, y);
    this.createLoopingLayer("Trees", ASSETS.BACKGROUNDS.NATURE.TREES, y);

    this.bgClouds1.setDepth(-40);
    this.bgClouds2.setDepth(-40);
    this.bgHills1.setDepth(-30);
    this.bgHills2.setDepth(-30);
    this.bgTrees1.setDepth(-20);
    this.bgTrees2.setDepth(-20);
  }

  createLoopingLayer(name, textureKey, y) {
    const { width, height } = this.cameras.main;

    const src = this.textures.get(textureKey).getSourceImage();
    const scaleX = width / src.width;
    const scaleY = height / src.height;

    const img1 = this.add.image(0, y, textureKey).setOrigin(0, 0);
    img1.setScale(scaleX, scaleY).setScrollFactor(0);

    // ✅ IMPORTANT: place second image using displayWidth (scaled)
    const img2 = this.add
      .image(img1.displayWidth, y, textureKey)
      .setOrigin(0, 0);
    img2.setScale(scaleX, scaleY).setScrollFactor(0);

    this[`bg${name}1`] = img1;
    this[`bg${name}2`] = img2;
  }

  createPlatforms() {
    const { width, height } = this.cameras.main;

    this.platforms = this.physics.add.staticGroup();
    this.worldWidth = Math.max(width * 3, 2400);

    this.platforms.setDepth(10);
    this.physics.world.setBounds(0, 0, this.worldWidth, height);

    for (let x = 0; x < this.worldWidth; x += this.TILE_SIZE) {
      this.platforms
        .create(x, height - this.TILE_SIZE, ASSETS.TILESETS.GRASS_GROUND.MIDDLE)
        .setOrigin(0, 0)
        .setDisplaySize(this.TILE_SIZE, this.TILE_SIZE)
        .refreshBody();
    }
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,SPACE");
  }

  createAnimations() {
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers(ASSETS.CHARACTERS.THEERTHA.IDLE, {
        start: 0,
        end: 24,
      }),
      frameRate: 24,
      repeat: -1,
    });

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers(ASSETS.CHARACTERS.THEERTHA.RUN, {
        start: 0,
        end: 24,
      }),
      frameRate: 24,
      repeat: -1,
    });

    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNumbers(ASSETS.CHARACTERS.THEERTHA.JUMP, {
        start: 0,
        end: 24,
      }),
      frameRate: 24,
      repeat: -1,
    });

    this.anims.create({
      key: "kiss",
      frames: this.anims.generateFrameNumbers(ASSETS.CHARACTERS.THEERTHA.KISS, {
        start: 0,
        end: 24,
      }),
      frameRate: 24,
      repeat: 0,
    });

    // ✅ 7 frames => 0..6
    if (!this.anims.exists("star-spin")) {
      this.anims.create({
        key: "star-spin",
        frames: this.anims.generateFrameNumbers(ASSETS.ITEMS.STARS, {
          start: 0,
          end: 6,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  createPlayer() {
    const { height } = this.cameras.main;

    this.player = this.physics.add
      .sprite(
        100,
        height - this.TILE_SIZE - 200,
        ASSETS.CHARACTERS.THEERTHA.IDLE,
      )
      .setScale(0.6);

    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.body.setGravityY(1200);
    this.player.setMaxVelocity(500, 2000);
    this.player.setDepth(20);

    this.player.body.setSize(70, 225, true);
    this.player.body.setOffset(95, 15);

    this.physics.add.collider(this.player, this.platforms);
  }

  createProjectiles() {
    this.hearts = this.physics.add.group({ allowGravity: false });
  }

  createStarsGroup() {
    this.stars = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
  }

  createStarHUD() {
    // rotating star icon
    this.hudStar = this.add
      .sprite(40, 40, ASSETS.ITEMS.STARS, 0)
      .setScrollFactor(0)
      .setDepth(999);

    this.hudStar.setScale(3);
    this.hudStar.play("star-spin");

    // number
    this.starText = this.add
      .text(75, 25, `${this.starsCollected}`, {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setScrollFactor(0)
      .setDepth(999);
  }

  setupStarCollect() {
    this.physics.add.overlap(this.player, this.stars, (player, star) => {
      if (!star || !star.active) return;

      star.destroy();
      this.starsCollected += 1;

      if (this.starText) this.starText.setText(`${this.starsCollected}`);
      // console.log("Stars:", this.starsCollected);
    });
  }

  spawnStar(x, y) {
    const star = this.stars.create(x, y, ASSETS.ITEMS.STARS, 0);
    star.setScale(2.5);
    star.setDepth(25);
    star.play("star-spin");
    return star;
  }

  setupCamera() {
    const { width, height } = this.cameras.main;

    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(width * 0.05, height * 0.25);
  }

  // -----------------------
  // UPDATE
  // -----------------------
  playAnim(key) {
    if (this.lastAnimKey === key) return;
    this.lastAnimKey = key;
    this.player.play(key, true);
  }

  update() {
    this.updateMovement();
    this.updateAnimationState();
    this.updateParallax();
  }

  updateMovement() {
    const onGround = this.player.body.blocked.down;

    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      this.performKissAttack();
    }

    if (this.isAttacking) {
      this.player.setVelocityX(0);
      return;
    }

    const leftDown = this.cursors.left.isDown || this.keys.A.isDown;
    const rightDown = this.cursors.right.isDown || this.keys.D.isDown;

    if (leftDown) {
      this.player.setVelocityX(-this.SPEED);
      this.player.setFlipX(true);
    } else if (rightDown) {
      this.player.setVelocityX(this.SPEED);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W);

    if (jumpPressed && onGround) {
      this.player.setVelocityY(-this.JUMP_VELOCITY);
    }
  }

  updateAnimationState() {
    const onGround = this.player.body.blocked.down;
    const moving = Math.abs(this.player.body.velocity.x) > 1;

    if (this.isAttacking) return;

    if (!onGround) return this.playAnim("jump");
    if (moving) return this.playAnim("run");
    return this.playAnim("idle");
  }

  performKissAttack() {
    if (this.isAttacking) return;
    if (!this.player.body.blocked.down) return;

    this.isAttacking = true;

    this.lastAnimKey = null;
    this.player.play("kiss", true);

    const direction = this.player.flipX ? -1 : 1;

    const heart = this.hearts.create(
      this.player.x + direction * 40,
      this.player.y - 25,
      ASSETS.ITEMS.HEART,
    );

    heart.setDepth(25);
    heart.setScale(0.15);
    heart.setVelocityX(550 * direction);

    this.time.delayedCall(1200, () => {
      if (heart && heart.active) heart.destroy();
    });

    this.time.delayedCall(this.ATTACK_COOLDOWN, () => {
      this.isAttacking = false;
    });
  }

  updateParallax() {
    const camX = this.cameras.main.scrollX;

    this.loopLayer(this.bgClouds1, this.bgClouds2, camX, this.CLOUD_PARALLAX);
    this.loopLayer(this.bgHills1, this.bgHills2, camX, this.HILLS_PARALLAX);
    this.loopLayer(this.bgTrees1, this.bgTrees2, camX, this.TREES_PARALLAX);
  }

  loopLayer(img1, img2, camX, factor) {
    const w = img1.displayWidth;
    const offset = -((camX * factor) % w);

    img1.x = Math.floor(offset);
    img2.x = Math.floor(offset + w);
  }

  buildFloatingPlatform(x, y, numTiles = 3) {
    const tiles = [];

    for (let i = 0; i < numTiles; i++) {
      let textureKey;

      if (i === 0) {
        textureKey = ASSETS.TILESETS.GRASS_FLOATING.LEFT;
      } else if (i === numTiles - 1) {
        textureKey = ASSETS.TILESETS.GRASS_FLOATING.RIGHT;
      } else {
        textureKey = ASSETS.TILESETS.GRASS_FLOATING.MIDDLE;
      }

      const tile = this.platforms
        .create(x + i * this.TILE_SIZE, y, textureKey)
        .setOrigin(0, 0)
        .setDisplaySize(this.TILE_SIZE, 50);

      tile.body.setSize(100, 200);
      tile.body.setOffset(0, 200);

      tile.refreshBody();

      tiles.push(tile);
    }

    return tiles;
  }

  buildPlatformsLevel1() {
    const groundTopY = this.cameras.main.height - this.TILE_SIZE;

    // Floating platforms at various heights
    this.buildFloatingPlatform(600, groundTopY - 200, 3);
    this.buildFloatingPlatform(1100, groundTopY - 350, 4);
    this.buildFloatingPlatform(1700, groundTopY - 250, 3);

    this.buildFloatingPlatform(2700, groundTopY - 200, 3);
    this.buildFloatingPlatform(3300, groundTopY - 200, 3);

    // Stars above platforms
    this.spawnStar(600 + this.TILE_SIZE, groundTopY - 280);
    this.spawnStar(700 + this.TILE_SIZE, groundTopY - 280);
    this.spawnStar(1000 + this.TILE_SIZE * 2, groundTopY - 440);
    this.spawnStar(1100 + this.TILE_SIZE * 2, groundTopY - 440);
    this.spawnStar(1200 + this.TILE_SIZE * 2, groundTopY - 440);
    this.spawnStar(1700 + this.TILE_SIZE, groundTopY - 330);
    this.spawnStar(1800 + this.TILE_SIZE, groundTopY - 330);

    // Ground stars
    this.spawnStar(800 + this.TILE_SIZE, groundTopY - 75);
    this.spawnStar(1000 + this.TILE_SIZE, groundTopY - 75);
    this.spawnStar(1200 + this.TILE_SIZE, groundTopY - 75);
    this.spawnStar(1400 + this.TILE_SIZE, groundTopY - 75);
    this.spawnStar(1600 + this.TILE_SIZE, groundTopY - 75);
  }
}
