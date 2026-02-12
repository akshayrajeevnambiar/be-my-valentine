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
import {
  finishPhotoSlideshow as finishPhotoSlideshowImpl,
  fitCarouselImage as fitCarouselImageImpl,
  getNextCarouselPhotoKey as getNextCarouselPhotoKeyImpl,
  preloadSlideshowPhotos as preloadSlideshowPhotosImpl,
  showNextCarouselMessage as showNextCarouselMessageImpl,
  startCarouselFadeOutToEndScene as startCarouselFadeOutToEndSceneImpl,
  startCarouselMessageFlow as startCarouselMessageFlowImpl,
  startFloatingHearts as startFloatingHeartsImpl,
  startPhotoSlideshowPlaceholder as startPhotoSlideshowPlaceholderImpl,
  tryFinishCarouselSequence as tryFinishCarouselSequenceImpl,
  updatePhotoCarousel as updatePhotoCarouselImpl,
  createPhotoCarouselBackground as createPhotoCarouselBackgroundImpl,
} from "./play/slideshow";
import {
  playMusic as playMusicImpl,
  playSfx as playSfxImpl,
  playGameOverBgMusic as playGameOverBgMusicImpl,
  stopCurrentMusic as stopCurrentMusicImpl,
  stopGameOverBgMusic as stopGameOverBgMusicImpl,
} from "./play/audio";
import { showGameOver } from "./play/game-over";

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayScene" });
    this.resetSceneState();
  }

  resetSceneState() {
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
    this.bossArenaSpeechControlLocked = false;
    this.akshay = null;
    this.akshayEntranceStarted = false;
    this.bossArenaSpeechShown = false;
    this.bossArenaSpeechRunning = false;
    this.jumpDisabled = false;
    this.endKissActive = false;
    this.endRunActive = false;
    this.slideshowPlaceholderActive = false;
    this.carouselPhotos = [];
    this.carouselPhotoIndex = 0;
    this.carouselSpeed = 4;
    this.carouselEndTriggered = false;
    this.carouselLastPhotoReached = false;
    this.carouselMessagesCompleted = false;
    this.carouselTransitionQueued = false;
    this.carouselFadeOutStarted = false;
    this.currentMusic = null;
    this.currentMusicKey = null;
    this.gameOverBgMusic = null;
    this.gameOverActive = false;
    this.gameOverCard = null;
    this.gameOverRestartHandler = null;
    this.carouselMessageText = null;
    this.carouselMessageIndex = 0;
    this.carouselMessageTimer = null;
    this.floatingHearts = null;
    this.slideshowPhotosReady = false;
    this.slideshowPhotoPreloadStarted = false;
    this.controlInstructionImages = [];
    this.slideshowPhotoKeys = Array.from(
      { length: 32 },
      (_, index) => `photo-${index + 1}`,
    );
    this.carouselMessages = [
      "We started as two separate stories...",
      "And somehow, life brought us together.",
      "Through laughs, chaos, distance, and dreams...",
      "Through every challenge, you stayed by my side.",
      "You are my peace in the noise.",
      "My courage when I doubt myself.",
      "My favorite place to come back to.",
      "Every memory with you feels like magic.",
      "And this is only the beginning...",
      "More adventures await us, my love.",
      "Happy Valentine's Day.",
    ];

    // Constants
    this.TILE_SIZE = 128;
    this.BOSS_GATE_X = 4860;
    this.BOSS_RIGHT_GATE_X = 5737;
    this.CUTSCENE_TRIGGER_X = 5761;
    this.CUTSCENE_END_X = 6751;
    this.AKSHAY_END_X = 6820;
  }

  init() {
    this.resetSceneState();
  }

  preload() {
    AssetLoader.loadAll(this);
  }

  create() {
    const { width, height } = this.cameras.main;
    if (this.physics?.world) {
      this.physics.world.resume();
    }
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
    this.playMusic(ASSETS.SOUNDS.MUSIC.GAME_LOOP, { volume: 0.28, loop: true });
    this.events.once("shutdown", () => this.stopCurrentMusic());
    this.events.once("destroy", () => this.stopCurrentMusic());
    this.events.once("shutdown", () => {
      if (this.gameOverRestartHandler) {
        this.input.keyboard.off("keydown-R", this.gameOverRestartHandler);
        this.gameOverRestartHandler = null;
      }
      this.stopGameOverBgMusic();
    });
  }

  update(_time, delta) {
    // Check boss gate boundary lock and spawn boss
    if (
      !this.leftBoundLocked &&
      this.playerController.player.x >= this.BOSS_GATE_X
    ) {
      this.lockLeftBoundaryAt(this.BOSS_GATE_X);
      this.lockRightBoundaryAt(this.BOSS_RIGHT_GATE_X);
      this.spawnBoss(); // Spawn boss when entering arena
      this.playBossArenaSpeech();
    }

    // Update all systems
    this.playerController.update();
    this.enemyManager.update();
    this.backgroundManager.update();
    this.updatePhotoCarousel(delta);

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
    this.playMusic(ASSETS.SOUNDS.MUSIC.BOSS_FIGHT, {
      volume: 0.32,
      loop: true,
    });

    const groundTopY = this.cameras.main.height - this.TILE_SIZE;

    // Spawn boss at the arena position
    this.enemyManager.spawnBoss(5600, groundTopY - 400, 300);

    console.log("Boss spawned! Fight begins!");
  }

  playBossArenaSpeech() {
    if (this.bossArenaSpeechShown || this.bossArenaSpeechRunning) return;

    const boss = this.enemyManager?.bosses
      ?.getChildren()
      ?.find((b) => b.active);
    if (!boss) return;

    this.bossArenaSpeechShown = true;
    this.bossArenaSpeechRunning = true;
    this.bossArenaSpeechControlLocked = true;

    const lines = [
      "You came.",
      "Most hearts break before this point.",
      "Lets see how far your love can go",
    ];

    const bubbleOffsetX = 240;
    const bubbleOffsetY = -250;
    const textOffsetY = -265;
    const bubbleLeftOffset = 20;
    const bubbleRightOffset = 20;
    const bubbleInnerWidthRatio = 0.58;
    const bubbleSafetyScale = 1.08;

    const bubble = this.add
      .image(
        boss.x - bubbleOffsetX,
        boss.y + bubbleOffsetY,
        ASSETS.ITEMS.SPEECH_BUBBLE,
      )
      .setDepth(90)
      .setScale(0.5)
      .setFlipX(true)
      .setAlpha(0);

    const bubbleBaseScaleY = 0.5;
    const bubbleTextureWidth = bubble.width;

    const speechText = this.add
      .text(boss.x - bubbleOffsetX, boss.y + textOffsetY, "", {
        fontSize: "30px",
        fontFamily: "Arial",
        color: "#1f1f1f",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(91)
      .setAlpha(0);

    const syncWithBoss = () => {
      if (!boss.active || !bubble.active || !speechText.active) return;
      bubble.setPosition(boss.x - bubbleOffsetX, boss.y + bubbleOffsetY);
      speechText.setPosition(boss.x - bubbleOffsetX, boss.y + textOffsetY);
    };

    const syncEvent = this.time.addEvent({
      delay: 16,
      loop: true,
      callback: syncWithBoss,
    });

    const cleanup = () => {
      if (syncEvent) syncEvent.remove(false);
      if (speechText && speechText.active) speechText.destroy();
      if (bubble && bubble.active) bubble.destroy();
      this.bossArenaSpeechRunning = false;
      this.bossArenaSpeechControlLocked = false;
    };

    const showLine = (index) => {
      if (!boss.active || !bubble.active || !speechText.active) {
        cleanup();
        return;
      }

      if (index >= lines.length) {
        this.tweens.add({
          targets: [speechText, bubble],
          alpha: 0,
          duration: 220,
          onComplete: cleanup,
        });
        return;
      }

      speechText.setText(lines[index]);
      const textWidth = speechText.width;
      const targetInnerWidth = textWidth + bubbleLeftOffset + bubbleRightOffset;
      const targetBubbleWidth =
        (targetInnerWidth / bubbleInnerWidthRatio) * bubbleSafetyScale;
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
          const holdMs = index === lines.length - 1 ? 1500 : 1200;
          this.time.delayedCall(holdMs, () => {
            this.tweens.add({
              targets: speechText,
              alpha: 0,
              duration: 180,
              ease: "Sine.In",
              onComplete: () => showLine(index + 1),
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
      onComplete: () => showLine(0),
    });
  }

  logPlayerPosition() {
    const player = this.playerController.player;
    console.log(
      `Player Position: X=${Math.floor(player.x)}, Y=${Math.floor(player.y)}`,
    );
    return { x: player.x, y: player.y };
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
    this.playMusic(ASSETS.SOUNDS.MUSIC.VICTORY, { volume: 0.35, loop: true });
    console.log(`Boss defeated: right boundary unlocked to ${this.worldWidth}`);
  }

  triggerEndCutscene() {
    this.cutsceneTriggered = true;
    this.cutsceneAutoMove = true;
    this.cutsceneControlLocked = true;
    this.playMusic(ASSETS.SOUNDS.MUSIC.END_CUTSCENE, {
      volume: 0.36,
      loop: true,
    });
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
        this.playSfx(ASSETS.SOUNDS.EFFECTS.KISS, { volume: 0.55 });
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

        // Step 2: after kiss hold, both run right together for a short while.
        this.time.delayedCall(2300, () => {
          this.startCoupleRunSequence();
        });
      },
    });

    console.log("[TODO] Akshay entrance started from the right side.");
  }

  playKissHeartBeat() {
    const player = this.playerController?.player;
    if (!player || !player.active || !this.akshay || !this.akshay.active)
      return;
    this.playSfx(ASSETS.SOUNDS.EFFECTS.HEART_BEAT, { volume: 0.5 });

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

  startCoupleRunSequence() {
    if (this.endRunActive) return;

    const player = this.playerController?.player;
    if (!player || !player.active || !this.akshay || !this.akshay.active)
      return;

    this.endKissActive = false;
    this.endRunActive = true;

    player.angle = 0;
    player.setFlipX(false);
    player.play("run", true);

    this.akshay.angle = 0;
    this.akshay.setFlipX(false);
    this.akshay.play("akshay-run", true);

    const runDistance = 260;
    const runDuration = 1800;

    this.tweens.add({
      targets: player,
      x: player.x + runDistance,
      duration: runDuration,
      ease: "Sine.InOut",
    });

    this.tweens.add({
      targets: this.akshay,
      x: this.akshay.x + runDistance,
      duration: runDuration,
      ease: "Sine.InOut",
      onComplete: () => {
        this.endRunActive = false;
        this.startPhotoSlideshowPlaceholder();
      },
    });
  }

  startPhotoSlideshowPlaceholder() {
    startPhotoSlideshowPlaceholderImpl(this);
  }

  preloadSlideshowPhotos(onComplete) {
    preloadSlideshowPhotosImpl(this, onComplete);
  }

  fitCarouselImage(image, key) {
    fitCarouselImageImpl(this, image, key);
  }

  createPhotoCarouselBackground() {
    createPhotoCarouselBackgroundImpl(this);
  }

  updatePhotoCarousel(delta = 16.67) {
    updatePhotoCarouselImpl(this, delta);
  }

  getNextCarouselPhotoKey() {
    return getNextCarouselPhotoKeyImpl(this);
  }

  startCarouselMessageFlow() {
    startCarouselMessageFlowImpl(this);
  }

  showNextCarouselMessage() {
    showNextCarouselMessageImpl(this);
  }

  startFloatingHearts() {
    startFloatingHeartsImpl(this);
  }

  tryFinishCarouselSequence() {
    tryFinishCarouselSequenceImpl(this);
  }

  startCarouselFadeOutToEndScene() {
    startCarouselFadeOutToEndSceneImpl(this);
  }

  finishPhotoSlideshow() {
    finishPhotoSlideshowImpl(this);
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
    showGameOver(this);
  }

  playMusic(key, config = {}) {
    playMusicImpl(this, key, config);
  }

  stopCurrentMusic() {
    stopCurrentMusicImpl(this);
  }

  playGameOverBgMusic() {
    playGameOverBgMusicImpl(this);
  }

  stopGameOverBgMusic() {
    stopGameOverBgMusicImpl(this);
  }

  playSfx(key, config = {}) {
    playSfxImpl(this, key, config);
  }
}
