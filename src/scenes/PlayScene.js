import Phaser from "phaser";
import { ASSETS } from "../assets/asset-keys";

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayScene" });

    this.lastAnimKey = null;
    this.TILE_SIZE = 128;

    this.SPEED = 350;
    this.JUMP_VELOCITY = 800;

    this.CLOUD_PARALLAX = 0.25;
    this.HILLS_PARALLAX = 0.5;
    this.TREES_PARALLAX = 0.75;

    // --- ATTACK STATE ---
    this.isAttacking = false;
    this.ATTACK_COOLDOWN = 450; // ms (tweak)
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
    this.createProjectiles(); // ✅ NEW
    this.setupCamera();

    this.playAnim("idle");
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
  }

  preloadItems() {
    this.load.image(ASSETS.ITEMS.HEART, "assets/items/heart.png");
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
      .setScrollFactor(0);

    this.createLoopingLayer("Clouds", ASSETS.BACKGROUNDS.NATURE.CLOUDS, y);
    this.createLoopingLayer("Hills", ASSETS.BACKGROUNDS.NATURE.HILLS, y);
    this.createLoopingLayer("Trees", ASSETS.BACKGROUNDS.NATURE.TREES, y);

    this.bgSky.setDepth(-50);

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
    const w = src.width;
    const h = src.height;

    const scaleX = width / w;
    const scaleY = height / h;

    const img1 = this.add.image(0, y, textureKey).setOrigin(0, 0);
    const img2 = this.add.image(w, y, textureKey).setOrigin(0, 0);

    img1.setScale(scaleX, scaleY);
    img2.setScale(scaleX, scaleY);

    img1.setScrollFactor(0);
    img2.setScrollFactor(0);

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
    this.player.setMaxVelocity(500, 900);
    this.player.setDepth(20);

    this.player.body.setSize(70, 120, true);
    this.player.body.setOffset(95, 110);

    this.physics.add.collider(this.player, this.platforms);
  }

  // ✅ NEW
  createProjectiles() {
    this.hearts = this.physics.add.group({
      allowGravity: false,
    });
  }

  setupCamera() {
    const { width, height } = this.cameras.main;

    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(width * 0.35, height * 0.25);
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

    // ✅ Attack on SPACE (separate from jump)
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      this.performKissAttack();
    }

    // If attacking, optionally stop horizontal control for the duration
    // (comment this out if you want to allow movement while kissing)
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

    // ✅ Don't let run/idle/jump override the kiss animation
    if (this.isAttacking) return;

    if (!onGround) {
      this.playAnim("jump");
      return;
    }

    if (moving) this.playAnim("run");
    else this.playAnim("idle");
  }

  performKissAttack() {
    if (this.isAttacking) return;

    // Optional: only allow on ground (cute pose reads better)
    if (!this.player.body.blocked.down) return;

    this.isAttacking = true;

    this.lastAnimKey = null; // force animation switch
    this.player.play("kiss", true);

    const direction = this.player.flipX ? -1 : 1;

    const heart = this.hearts.create(
      this.player.x + direction * 40,
      this.player.y - 25,
      ASSETS.ITEMS.HEART,
    );

    heart.setDepth(25);
    heart.setScale(0.1);
    heart.setVelocityX(550 * direction);

    // Kill projectile after time
    this.time.delayedCall(1200, () => {
      if (heart && heart.active) heart.destroy();
    });

    // End attack slightly after anim starts (tweak for your sprite timing)
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
}
