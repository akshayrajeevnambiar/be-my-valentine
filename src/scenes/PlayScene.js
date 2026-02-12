import Phaser from "phaser";
import AssetLoader from "../assets/AssetLoader";
import AnimationManager from "../managers/AnimationManager";
import InputManager from "../managers/InputManager";
import CameraManager from "../managers/CameraManager";
import BackgroundManager from "../managers/BackgroundManager";
import PlatformBuilder from "../builders/PlatformBuilder";
import PlayerController from "../entities/PlayerController";
import EnemyManager from "../managers/EnemyManager";
import CollectibleManager from "../managers/CollectibleManager";
import HUDManager from "../managers/HUDManager";
import CollisionManager from "../managers/CollisionManager";
import { ASSETS } from "../assets/asset-keys";

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayScene" });

    // Game state
    this.starsCollected = 0;
    this.playerLives = 5;
    this.playerIsBeingHit = false;
    this.playerIsDead = false;
    this.leftBoundLocked = false;
    this.bossSpawned = false; // Track if boss has been spawned
    this.cutsceneTriggered = false;
    this.cutsceneAutoMove = false;
    this.cutsceneControlLocked = false;
    this.cutsceneAutoMoveCompleted = false;
    this.akshay = null;
    this.akshayEntranceStarted = false;
    this.jumpDisabled = false;
    this.endKissActive = false;
    this.controlInstructionImages = [];

    // Constants
    this.TILE_SIZE = 128;
    this.BOSS_GATE_X = 4860;
    this.BOSS_RIGHT_GATE_X = 5737;
    this.CUTSCENE_TRIGGER_X = 5761;
    this.CUTSCENE_END_X = 6751;
    this.AKSHAY_END_X = 6820;
  }

  preload() {
    AssetLoader.loadAll(this);
  }

  create() {
    const { width, height } = this.cameras.main;
    this.viewWidth = width;
    this.viewHeight = height;
    this.worldWidth = Math.max(width * 4, 2400);

    // Initialize managers
    this.backgroundManager = new BackgroundManager(this);
    this.platformBuilder = new PlatformBuilder(this);
    this.inputManager = new InputManager(this);
    this.animationManager = new AnimationManager(this);
    this.playerController = new PlayerController(this);
    this.enemyManager = new EnemyManager(this);
    this.collectibleManager = new CollectibleManager(this);
    this.hudManager = new HUDManager(this);
    this.collisionManager = new CollisionManager(this);
    this.cameraManager = new CameraManager(this);

    // Setup scene
    this.backgroundManager.create();
    this.platformBuilder.createGround();
    this.inputManager.create();
    this.animationManager.createAll();
    this.playerController.create();
    this.enemyManager.create();
    this.collectibleManager.create();
    this.hudManager.create();
    this.collisionManager.setupAll();
    this.cameraManager.setup();

    // Build level
    this.platformBuilder.buildLevel1();

    // Start player animation
    this.playerController.playAnimation("idle");

    this.input.keyboard.on("keydown-P", () => {
      this.logPlayerPosition();
    });

    this.input.keyboard.on("keydown-O", () => {
      this.logWorldBoundsWidth();
    });

    this.createControlInstructionsUI();
  }

  update() {
    // Check boss gate boundary lock and spawn boss
    if (
      !this.leftBoundLocked &&
      this.playerController.player.x >= this.BOSS_GATE_X
    ) {
      this.lockLeftBoundaryAt(this.BOSS_GATE_X);
      this.lockRightBoundaryAt(this.BOSS_RIGHT_GATE_X);
      this.spawnBoss(); // Spawn boss when entering arena
    }

    // Update all systems
    this.playerController.update();
    this.enemyManager.update();
    this.backgroundManager.update();

    if (
      !this.cutsceneTriggered &&
      this.playerController.player.x >= this.CUTSCENE_TRIGGER_X
    ) {
      this.triggerEndCutscene();
    }
  }

  spawnBoss() {
    if (this.bossSpawned) return; // Only spawn once

    this.bossSpawned = true;

    const groundTopY = this.cameras.main.height - this.TILE_SIZE;

    // Spawn boss at the arena position
    this.enemyManager.spawnBoss(5600, groundTopY - 400, 300);

    console.log("Boss spawned! Fight begins!");
  }

  logPlayerPosition() {
    const player = this.playerController.player;
    console.log(
      `Player Position: X=${Math.floor(player.x)}, Y=${Math.floor(player.y)}`,
    );
    return { x: player.x, y: player.y };
  }

  logWorldWidth() {
    console.log(`World Width: ${Math.floor(this.worldWidth)}`);
    return this.worldWidth;
  }

  logWorldBoundsWidth() {
    const boundsWidth = this.physics.world.bounds.width;
    console.log(`World Bounds Width: ${Math.floor(boundsWidth)}`);
    return boundsWidth;
  }

  lockLeftBoundaryAt(x) {
    const cam = this.cameras.main;
    this.leftBoundLocked = true;

    const lockX = Phaser.Math.Clamp(x, 0, this.worldWidth - cam.width);
    const currentRight =
      this.physics.world.bounds.x + this.physics.world.bounds.width;
    const nextRight = Math.max(currentRight, lockX + cam.width);

    cam.setBounds(lockX, 0, nextRight - lockX, cam.height);
    this.physics.world.setBounds(lockX, 0, nextRight - lockX, cam.height);

    if (this.playerController.player.x < lockX + 5) {
      this.playerController.player.x = lockX + 5;
    }
  }

  lockRightBoundaryAt(x) {
    const cam = this.cameras.main;

    const lockRightX = Phaser.Math.Clamp(x, cam.width, this.worldWidth);
    const currentLeft = this.physics.world.bounds.x;
    const nextLeft = Math.min(currentLeft, lockRightX - cam.width);

    cam.setBounds(nextLeft, 0, lockRightX - nextLeft, cam.height);
    this.physics.world.setBounds(
      nextLeft,
      0,
      lockRightX - nextLeft,
      cam.height,
    );

    if (this.playerController.player.x > lockRightX - 5) {
      this.playerController.player.x = lockRightX - 5;
    }
  }

  onBossDefeated() {
    this.jumpDisabled = true;
    this.lockRightBoundaryAt(this.worldWidth);
    console.log(`Boss defeated: right boundary unlocked to ${this.worldWidth}`);
  }

  triggerEndCutscene() {
    this.cutsceneTriggered = true;
    this.cutsceneAutoMove = true;
    this.cutsceneControlLocked = true;
    this.hideControlInstructionsUI();
    this.startAkshayEntrance();
    console.log(
      `[TODO] Cutscene starts here (player crossed X=${this.CUTSCENE_TRIGGER_X})`,
    );
  }

  onCutsceneAutoMoveComplete() {
    if (this.cutsceneAutoMoveCompleted) return;

    this.cutsceneAutoMoveCompleted = true;
    this.cutsceneAutoMove = false;

    this.playerController.player.setVelocityX(0);
    this.playerController.playAnimation("idle");

    console.log(
      `[TODO] Cutscene auto-run complete at X=${Math.floor(this.playerController.player.x)} (target ${this.CUTSCENE_END_X})`,
    );
  }

  startAkshayEntrance() {
    if (this.akshayEntranceStarted) return;

    this.akshayEntranceStarted = true;

    const groundY = this.playerController.player.y;
    const spawnX = this.cameras.main.scrollX + this.cameras.main.width + 150;
    const stopX = this.AKSHAY_END_X;

    this.akshay = this.add
      .sprite(spawnX, groundY - 20, ASSETS.CHARACTERS.AKSHAY.LOVE)
      .setScale(0.8)
      .setFlipX(false)
      .setDepth(20);

    this.akshay.play("akshay-love", true);

    this.tweens.add({
      targets: this.akshay,
      x: stopX,
      duration: 2400,
      ease: "Sine.Out",
      onComplete: () => {
        if (!this.akshay || !this.akshay.active) return;
        const player = this.playerController?.player;

        this.akshay.angle = 10;
        this.akshay.setScale(0.9);
        this.akshay.y += 15;
        this.akshay.play("akshay-kiss", true);
        this.time.delayedCall(400, () => {
          // change 400 ms to what you want
          if (player && player.active) {
            this.endKissActive = true;
            player.y -= 25;
            player.angle -= 10;
            player.setScale(0.7);
            player.setFlipX(true);
            player.play("theertha-kiss", true);
          }
        });
        this.playKissHeartBeat();
      },
    });

    console.log("[TODO] Akshay entrance started from the right side.");
  }

  playKissHeartBeat() {
    const player = this.playerController?.player;
    if (!player || !player.active || !this.akshay || !this.akshay.active)
      return;

    const heartX = (player.x + this.akshay.x) / 2;
    const heartY = Math.min(player.y, this.akshay.y) - 140;
    const heart = this.add
      .image(heartX + 80, heartY + 100, ASSETS.ITEMS.HEART)
      .setDepth(-10)
      .setScale(1)
      .setAlpha(0.9);

    this.tweens.add({
      targets: heart,
      scaleX: 0.24,
      scaleY: 0.24,
      duration: 450,
      yoyo: true,
      repeat: 3,
      ease: "Sine.InOut",
    });

    this.tweens.add({
      targets: heart,
      alpha: 0,
      delay: 2400,
      duration: 500,
      onComplete: () => {
        if (heart && heart.active) heart.destroy();
      },
    });
  }

  createControlInstructionsUI() {
    const cam = this.cameras.main;
    const baseX = 26;
    const baseY = cam.height - 26;

    const movementHint = this.add
      .image(baseX - 90, baseY + 93, ASSETS.ITEMS.MOVEMENT_BUTTONS)
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(200)
      .setScale(0.2)
      .setAlpha(0.92);

    const attackHint = this.add
      .image(baseX + 50, baseY + 105, ASSETS.ITEMS.ATTACK_BUTTON)
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(200)
      .setScale(0.55)
      .setAlpha(0.92);

    this.controlInstructionImages = [movementHint, attackHint];
  }

  hideControlInstructionsUI() {
    this.controlInstructionImages.forEach((image) => {
      if (image && image.active) image.setVisible(false);
    });
  }

  gameOver() {
    console.log("Game Over!");
    this.scene.start("EndScene", { stars: this.starsCollected });
  }
}
