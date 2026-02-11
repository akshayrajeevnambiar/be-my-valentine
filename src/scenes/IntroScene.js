import Phaser from "phaser";
import { ASSETS } from "../assets/asset-keys";

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });
    this.TILE_SIZE = 128;

    // Slower run (bigger = slower)
    this.RUN_DURATION = 2800;
  }

  preload() {
    this.preloadBackgrounds();
    this.preloadCharacters();
    this.preloadTiles();
  }

  create() {
    const { width, height } = this.cameras.main;

    // --- Background layers ---
    this.bgSky = this.add
      .image(0, 0, ASSETS.BACKGROUNDS.NATURE.SKY)
      .setOrigin(0)
      .setDisplaySize(width, height)
      .setDepth(-50);

    this.bgClouds = this.add
      .tileSprite(0, 0, width, height, ASSETS.BACKGROUNDS.NATURE.CLOUDS)
      .setOrigin(0)
      .setDepth(-40);

    this.bgHills = this.add
      .image(0, 0, ASSETS.BACKGROUNDS.NATURE.HILLS)
      .setOrigin(0)
      .setDisplaySize(width, height)
      .setDepth(-30);

    this.bgTrees = this.add
      .image(0, 0, ASSETS.BACKGROUNDS.NATURE.TREES)
      .setOrigin(0)
      .setDisplaySize(width, height)
      .setDepth(-20);

    // --- Physics world bounds (floor tiles use staticGroup) ---
    this.physics.world.setBounds(0, 0, width, height);

    // --- Floor / Platforms (STATIC) ---
    this.platforms = this.physics.add.staticGroup();
    this.platforms.setDepth(10);

    for (let x = 0; x <= width; x += this.TILE_SIZE) {
      const tile = this.platforms.create(
        x + this.TILE_SIZE / 2,
        height - this.TILE_SIZE / 2,
        ASSETS.TILESETS.GRASS_GROUND.MIDDLE,
      );

      tile.setDisplaySize(this.TILE_SIZE, this.TILE_SIZE);
      tile.refreshBody();
    }

    // --- Animations ---
    if (!this.anims.exists("theertha-run")) {
      this.anims.create({
        key: "theertha-run",
        frames: this.anims.generateFrameNumbers(
          ASSETS.CHARACTERS.THEERTHA.RUN,
          {
            start: 0,
            end: 24,
          },
        ),
        frameRate: 24,
        repeat: -1,
      });
    }

    if (!this.anims.exists("theertha-idle")) {
      this.anims.create({
        key: "theertha-idle",
        frames: this.anims.generateFrameNumbers(
          ASSETS.CHARACTERS.THEERTHA.IDLE,
          {
            start: 0,
            end: 24,
          },
        ),
        frameRate: 24,
        repeat: -1,
      });
    }

    if (!this.anims.exists("akshay-run")) {
      this.anims.create({
        key: "akshay-run",
        frames: this.anims.generateFrameNumbers(ASSETS.CHARACTERS.AKSHAY.RUN, {
          start: 0,
          end: 24,
        }),
        frameRate: 24,
        repeat: -1,
      });
    }

    if (!this.anims.exists("akshay-idle")) {
      this.anims.create({
        key: "akshay-idle",
        frames: this.anims.generateFrameNumbers(ASSETS.CHARACTERS.AKSHAY.IDLE, {
          start: 0,
          end: 24,
        }),
        frameRate: 24,
        repeat: -1,
      });
    }

    // --- Characters (NO physics for cutscene running; avoids "dropping") ---
    const groundY = height - this.TILE_SIZE - 60;

    // Theertha from LEFT
    this.theertha = this.add
      .sprite(-150, groundY, ASSETS.CHARACTERS.THEERTHA.RUN)
      .setScale(0.6)
      .setDepth(20);

    this.theertha.play("theertha-run");

    // Akshay from RIGHT (flip so he's facing left)
    this.akshay = this.add
      .sprite(width + 150, groundY, ASSETS.CHARACTERS.AKSHAY.RUN)
      .setScale(0.6)
      .setFlipX(true)
      .setDepth(20);

    this.akshay.play("akshay-run");

    // --- Run to near-center (leave some gap between them) ---
    const theerthaStopX = width * 0.5 - 200; // left side of center
    const akshayStopX = width * 0.5 + 200; // right side of center

    this.tweens.add({
      targets: this.theertha,
      x: theerthaStopX,
      duration: this.RUN_DURATION,
      ease: "Sine.Out",
      onComplete: () => {
        this.theertha.play("theertha-idle", true);
      },
    });

    this.tweens.add({
      targets: this.akshay,
      x: akshayStopX,
      duration: this.RUN_DURATION,
      ease: "Sine.Out",
      onComplete: () => {
        this.akshay.play("akshay-idle", true);
      },
    });

    // --- Skip to game ---
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("PlayScene");
    });

    this.cameras.main.setAlpha(1);
  }

  update() {
    if (this.bgClouds) this.bgClouds.tilePositionX += 0.2;
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
      ASSETS.CHARACTERS.THEERTHA.RUN,
      "assets/characters/theertha/run.png",
      { frameWidth: 256, frameHeight: 256 },
    );

    this.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.IDLE,
      "assets/characters/theertha/idle.png",
      { frameWidth: 256, frameHeight: 256 },
    );

    this.load.spritesheet(
      ASSETS.CHARACTERS.AKSHAY.RUN,
      "assets/characters/akshay/run.png",
      { frameWidth: 256, frameHeight: 256 },
    );

    this.load.spritesheet(
      ASSETS.CHARACTERS.AKSHAY.IDLE,
      "assets/characters/akshay/idle.png",
      { frameWidth: 256, frameHeight: 256 },
    );
  }

  preloadTiles() {
    this.load.image(
      ASSETS.TILESETS.GRASS_GROUND.MIDDLE,
      "assets/enviroment/tilesets/grass-tile-middle.png",
    );
  }
}
