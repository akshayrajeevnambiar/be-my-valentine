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

    // Constants
    this.TILE_SIZE = 128;
    this.BOSS_GATE_X = 4860;
    this.BOSS_RIGHT_GATE_X = 5737;
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
    this.lockRightBoundaryAt(this.worldWidth);
    console.log(`Boss defeated: right boundary unlocked to ${this.worldWidth}`);
  }

  gameOver() {
    console.log("Game Over!");
    this.scene.start("EndScene", { stars: this.starsCollected });
  }
}
