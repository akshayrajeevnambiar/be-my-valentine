import { ASSETS } from "../assets/asset-keys";

export default class AnimationManager {
  constructor(scene) {
    this.scene = scene;
  }

  createAll() {
    this.createPlayerAnimations();
    this.createMinionAnimations();
    this.createBossAnimations();
    this.createItemAnimations();
  }

  createPlayerAnimations() {
    this.scene.anims.create({
      key: "idle",
      frames: this.scene.anims.generateFrameNumbers(
        ASSETS.CHARACTERS.THEERTHA.IDLE,
        { start: 0, end: 24 },
      ),
      frameRate: 24,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "run",
      frames: this.scene.anims.generateFrameNumbers(
        ASSETS.CHARACTERS.THEERTHA.RUN,
        { start: 0, end: 24 },
      ),
      frameRate: 24,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "jump",
      frames: this.scene.anims.generateFrameNumbers(
        ASSETS.CHARACTERS.THEERTHA.JUMP,
        { start: 0, end: 24 },
      ),
      frameRate: 24,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "kiss",
      frames: this.scene.anims.generateFrameNumbers(
        ASSETS.CHARACTERS.THEERTHA.KISS,
        { start: 0, end: 24 },
      ),
      frameRate: 24,
      repeat: 0,
    });

    this.scene.anims.create({
      key: "hit",
      frames: this.scene.anims.generateFrameNumbers(
        ASSETS.CHARACTERS.THEERTHA.HIT,
        { start: 0, end: 24 },
      ),
      frameRate: 24,
      repeat: 0,
    });
  }

  createMinionAnimations() {
    this.scene.anims.create({
      key: "minion-idle",
      frames: this.scene.anims.generateFrameNumbers(
        ASSETS.CHARACTERS.MINION.IDLE,
        { start: 0, end: 3 },
      ),
      frameRate: 8,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "minion-run",
      frames: this.scene.anims.generateFrameNumbers(
        ASSETS.CHARACTERS.MINION.RUN,
        { start: 0, end: 5 },
      ),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "minion-hit",
      frames: this.scene.anims.generateFrameNumbers(
        ASSETS.CHARACTERS.MINION.HIT,
        { start: 0, end: 3 },
      ),
      frameRate: 12,
      repeat: 0,
    });
  }

  createBossAnimations() {
    if (!this.scene.anims.exists("boss-idle")) {
      this.scene.anims.create({
        key: "boss-idle",
        frames: this.scene.anims.generateFrameNumbers(
          ASSETS.CHARACTERS.BOSS.IDLE,
          { start: 0, end: 24 },
        ),
        frameRate: 24,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists("boss-attack")) {
      this.scene.anims.create({
        key: "boss-attack",
        frames: this.scene.anims.generateFrameNumbers(
          ASSETS.CHARACTERS.BOSS.ATTACK,
          { start: 0, end: 24 },
        ),
        frameRate: 24,
        repeat: 0,
      });
    }

    if (!this.scene.anims.exists("boss-hit")) {
      this.scene.anims.create({
        key: "boss-hit",
        frames: this.scene.anims.generateFrameNumbers(
          ASSETS.CHARACTERS.BOSS.HIT,
          { start: 0, end: 24 },
        ),
        frameRate: 24,
        repeat: 0,
      });
    }

    if (!this.scene.anims.exists("boss-jump")) {
      this.scene.anims.create({
        key: "boss-jump",
        frames: this.scene.anims.generateFrameNumbers(
          ASSETS.CHARACTERS.BOSS.JUMP,
          { start: 0, end: 24 },
        ),
        frameRate: 24,
        repeat: 0,
      });
    }

    if (!this.scene.anims.exists("boss-fall")) {
      this.scene.anims.create({
        key: "boss-fall",
        frames: this.scene.anims.generateFrameNumbers(
          ASSETS.CHARACTERS.BOSS.FALL,
          { start: 0, end: 24 },
        ),
        frameRate: 24,
        repeat: 0,
      });
    }
  }

  createItemAnimations() {
    if (!this.scene.anims.exists("star-spin")) {
      this.scene.anims.create({
        key: "star-spin",
        frames: this.scene.anims.generateFrameNumbers(ASSETS.ITEMS.STARS, {
          start: 0,
          end: 6,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists("energy-ball")) {
      this.scene.anims.create({
        key: "energy-ball",
        frames: this.scene.anims.generateFrameNumbers(
          ASSETS.ITEMS.ENERGY_BALL,
          {
            start: 0,
            end: 8,
          },
        ),
        frameRate: 12,
        repeat: -1,
      });
    }
  }
}
