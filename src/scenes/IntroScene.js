import Phaser from "phaser";
import { ASSETS } from "../assets/asset-keys";

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });
    this.TILE_SIZE = 128;

    // Slower run (bigger = slower)
    this.RUN_DURATION = 2800;
    this.introArrivals = 0;
    this.titleCardShown = false;
    this.introSkipEnabled = false;
    this.skipToGameHandler = null;
    this.bossSpeechRunning = false;
  }

  preload() {
    this.preloadBackgrounds();
    this.preloadCharacters();
    this.preloadTiles();
    this.preloadItems();
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
    if (!this.anims.exists("theertha-love")) {
      this.anims.create({
        key: "theertha-love",
        frames: this.anims.generateFrameNumbers(
          ASSETS.CHARACTERS.THEERTHA.LOVE,
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

    if (!this.anims.exists("akshay-love")) {
      this.anims.create({
        key: "akshay-love",
        frames: this.anims.generateFrameNumbers(ASSETS.CHARACTERS.AKSHAY.LOVE, {
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

    if (!this.anims.exists("boss-idle")) {
      this.anims.create({
        key: "boss-idle",
        frames: this.anims.generateFrameNumbers(ASSETS.CHARACTERS.BOSS.IDLE, {
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
      .sprite(-150, groundY, ASSETS.CHARACTERS.THEERTHA.LOVE)
      .setScale(0.6)
      .setDepth(20);

    this.theertha.play("theertha-love");

    // Akshay from RIGHT (flip so he's facing left)
    this.akshay = this.add
      .sprite(width + 150, groundY - 20, ASSETS.CHARACTERS.AKSHAY.LOVE)
      .setScale(0.8)
      .setFlipX(false)
      .setDepth(20);

    this.akshay.play("akshay-love");

    // --- Run to near-center (leave some gap between them) ---
    const theerthaStopX = width * 0.5 - 200; // left side of center
    const akshayStopX = width * 0.5 + 200; // right side of center
    const bossLandingX = (theerthaStopX + akshayStopX) / 2;
    const bossLandingY = groundY - 110;

    this.tweens.add({
      targets: this.theertha,
      x: theerthaStopX,
      duration: this.RUN_DURATION,
      ease: "Sine.Out",
      onComplete: () => {
        this.theertha.play("theertha-idle", true);
        this.onIntroCharacterArrived(bossLandingX, bossLandingY);
      },
    });

    this.tweens.add({
      targets: this.akshay,
      x: akshayStopX,
      duration: this.RUN_DURATION,
      ease: "Sine.Out",
      onComplete: () => {
        this.akshay.setFlipX(true);
        this.akshay.play("akshay-idle", true);
        this.akshay.setScale(0.7);
        this.akshay.y = groundY - 7;
        this.onIntroCharacterArrived(bossLandingX, bossLandingY);
      },
    });

    // --- Skip to game (enabled only after instruction card lands) ---
    this.skipToGameHandler = () => {
      if (!this.introSkipEnabled) return;
      this.input.keyboard.off("keydown-SPACE", this.skipToGameHandler);
      this.scene.start("PhotoLoadingScene");
    };
    this.input.keyboard.on("keydown-SPACE", this.skipToGameHandler);

    this.events.once("shutdown", () => {
      if (this.skipToGameHandler) {
        this.input.keyboard.off("keydown-SPACE", this.skipToGameHandler);
      }
    });

    this.cameras.main.setAlpha(1);
  }

  update() {
    if (this.bgClouds) this.bgClouds.tilePositionX += 0.2;
  }

  onIntroCharacterArrived(bossLandingX, bossLandingY) {
    this.introArrivals += 1;
    if (this.introArrivals < 2) return;

    this.startBossDrop(bossLandingX, bossLandingY);
  }

  startBossDrop(landingX, landingY) {
    const boss = this.add
      .sprite(landingX, -250, ASSETS.CHARACTERS.BOSS.IDLE)
      .setScale(1.5)
      .setFlipX(true)
      .setDepth(25);

    boss.play("boss-idle", true);

    this.tweens.add({
      targets: boss,
      y: landingY,
      duration: 900,
      ease: "Cubic.In",
      onComplete: () => {
        this.cameras.main.shake(180, 0.01);
        this.playImpactHop(this.theertha, -30);
        this.playImpactHop(this.akshay, 30);
        this.playBossSpeech(boss, () => {
          this.startKidnapRunOut();
        });
        console.log("[Intro] Boss dropped in between them.");
      },
    });
  }

  playBossSpeech(boss, onComplete) {
    if (this.bossSpeechRunning) return;
    this.bossSpeechRunning = true;

    const lines = [
      "I am Time.",
      "I am Distance.",
      "I am every obstacle between you.",
      "If your love is strong enough...",
      "come and take him back",
    ];

    const bubble = this.add
      .image(boss.x - 250, boss.y - 220, ASSETS.ITEMS.SPEECH_BUBBLE)
      .setDepth(90)
      .setScale(0.5)
      .setFlipX(true)
      .setAlpha(0);
    const bubbleBaseScaleY = 0.5;
    const bubbleTextureWidth = bubble.width;
    const bubbleSideOffset = 180;

    const speechText = this.add
      .text(boss.x - 250, boss.y - 235, "", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#1f1f1f",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(91)
      .setAlpha(0);

    const showLine = (index) => {
      if (!bubble.active || !speechText.active) return;
      if (index >= lines.length) {
        this.tweens.add({
          targets: [speechText, bubble],
          alpha: 0,
          duration: 220,
          onComplete: () => {
            if (speechText && speechText.active) speechText.destroy();
            if (bubble && bubble.active) bubble.destroy();
            this.bossSpeechRunning = false;
            if (typeof onComplete === "function") onComplete();
          },
        });
        return;
      }

      speechText.setText(lines[index]);
      const targetBubbleWidth = speechText.width + bubbleSideOffset * 2;
      const targetScaleX = Math.max(
        0.35,
        targetBubbleWidth / bubbleTextureWidth,
      );
      bubble.setScale(targetScaleX, bubbleBaseScaleY);

      this.tweens.add({
        targets: speechText,
        alpha: 1,
        duration: 220,
        ease: "Sine.Out",
        onComplete: () => {
          const holdMs = index === lines.length - 1 ? 1800 : 1300;
          this.time.delayedCall(holdMs, () => {
            this.tweens.add({
              targets: speechText,
              alpha: 0,
              duration: 180,
              ease: "Sine.In",
              onComplete: () => {
                showLine(index + 1);
              },
            });
          });
        },
      });
    };

    this.tweens.add({
      targets: bubble,
      alpha: 1,
      duration: 240,
      ease: "Sine.Out",
      onComplete: () => {
        showLine(0);
      },
    });
  }

  playImpactHop(character, xKnockback) {
    if (!character || !character.active) return;

    const startX = character.x;
    const startY = character.y;

    this.tweens.add({
      targets: character,
      x: startX + xKnockback,
      y: startY - 45,
      duration: 140,
      ease: "Cubic.Out",
      onComplete: () => {
        this.tweens.add({
          targets: character,
          x: startX,
          y: startY,
          duration: 280,
          ease: "Bounce.Out",
        });
      },
    });
  }

  startKidnapRunOut() {
    if (!this.akshay || !this.akshay.active) return;

    const boss = this.children.list.find(
      (child) =>
        child.texture && child.texture.key === ASSETS.CHARACTERS.BOSS.IDLE,
    );
    if (!boss || !boss.active) return;

    boss.setFlipX(false);
    // Keep Akshay in run animation while being taken away
    this.akshay.setFlipX(false);
    this.akshay.play("akshay-run", true);

    // Boss + Akshay move together off-screen to the right
    const exitX = this.cameras.main.width + 400;

    this.tweens.add({
      targets: [boss, this.akshay],
      x: exitX,
      duration: 1800,
      ease: "Sine.In",
      onComplete: () => {
        if (boss && boss.active) boss.destroy();
        if (this.akshay && this.akshay.active) this.akshay.destroy();
        this.dropTitleCard();
        console.log("[Intro] Boss kidnapped Akshay and ran out.");
      },
    });
  }

  dropTitleCard() {
    if (this.titleCardShown) return;
    this.titleCardShown = true;

    const { width, height } = this.cameras.main;
    const titleCardFinalY = height * 0.38;
    const instructionOffsetY = 150;
    const titleCard = this.add
      .image(width / 2, -100, ASSETS.ITEMS.TITLE_CARD)
      .setDepth(80)
      .setScale(0.5);
    const instructionCard = this.add
      .image(width / 2, -20, ASSETS.ITEMS.INSTRUCTION)
      .setDepth(79)
      .setScale(0.3);

    this.tweens.add({
      targets: titleCard,
      y: titleCardFinalY,
      duration: 2600,
      ease: "Sine.InOut",
    });

    this.tweens.add({
      targets: instructionCard,
      y: titleCardFinalY + instructionOffsetY,
      duration: 2600,
      ease: "Sine.InOut",
      onComplete: () => {
        this.introSkipEnabled = true;
      },
    });
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
      ASSETS.CHARACTERS.THEERTHA.LOVE,
      "assets/characters/theertha/love.png",
      { frameWidth: 256, frameHeight: 256 },
    );

    this.load.spritesheet(
      ASSETS.CHARACTERS.AKSHAY.RUN,
      "assets/characters/akshay/run.png",
      { frameWidth: 256, frameHeight: 256 },
    );

    this.load.spritesheet(
      ASSETS.CHARACTERS.AKSHAY.LOVE,
      "assets/characters/akshay/love.png",
      { frameWidth: 256, frameHeight: 256 },
    );

    this.load.spritesheet(
      ASSETS.CHARACTERS.AKSHAY.IDLE,
      "assets/characters/akshay/idle.png",
      { frameWidth: 256, frameHeight: 256 },
    );

    this.load.spritesheet(
      ASSETS.CHARACTERS.BOSS.IDLE,
      "assets/characters/enemies/boss/idle.png",
      { frameWidth: 256, frameHeight: 256 },
    );
  }

  preloadTiles() {
    this.load.image(
      ASSETS.TILESETS.GRASS_GROUND.MIDDLE,
      "assets/enviroment/tilesets/grass-tile-middle.png",
    );
  }

  preloadItems() {
    this.load.image(ASSETS.ITEMS.TITLE_CARD, "assets/items/title-card.png");
    this.load.image(ASSETS.ITEMS.INSTRUCTION, "assets/items/instruction.png");
    this.load.image(
      ASSETS.ITEMS.SPEECH_BUBBLE,
      "assets/items/speech-bubble.png",
    );
  }
}
