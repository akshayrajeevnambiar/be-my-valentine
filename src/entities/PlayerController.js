import Phaser from "phaser";
import { ASSETS } from "../assets/asset-keys";

export default class PlayerController {
  constructor(scene) {
    this.scene = scene;
    this.player = null;
    this.lastAnimKey = null;
    this.isAttacking = false;
    this.runningLoopSfx = null;
    this.criticalHeartbeatSfx = null;

    // Constants
    this.SPEED = 350;
    this.JUMP_VELOCITY = 1000;
    this.ATTACK_COOLDOWN = 450;
  }

  create() {
    const { height } = this.scene.cameras.main;

    this.player = this.scene.physics.add
      .sprite(
        200,
        height - this.scene.TILE_SIZE - 200,
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

    this.scene.physics.add.collider(
      this.player,
      this.scene.platformBuilder.platforms,
    );

    if (this.scene.cache?.audio?.exists(ASSETS.SOUNDS.EFFECTS.RUNNING)) {
      this.runningLoopSfx = this.scene.sound.add(ASSETS.SOUNDS.EFFECTS.RUNNING, {
        loop: true,
        volume: 0.2,
      });
    }

    if (this.scene.cache?.audio?.exists(ASSETS.SOUNDS.EFFECTS.HEART_BEAT)) {
      this.criticalHeartbeatSfx = this.scene.sound.add(
        ASSETS.SOUNDS.EFFECTS.HEART_BEAT,
        {
          loop: true,
          volume: 0.25,
        },
      );
    }

    this.scene.events.once("shutdown", () => {
      this.stopRunningSfx();
      this.stopCriticalHeartbeatSfx();
      if (this.runningLoopSfx) {
        this.runningLoopSfx.destroy();
        this.runningLoopSfx = null;
      }
      if (this.criticalHeartbeatSfx) {
        this.criticalHeartbeatSfx.destroy();
        this.criticalHeartbeatSfx = null;
      }
    });
  }

  update() {
    this.updateMovement();
    this.updateAnimationState();
    this.updateRunningSfx();
    this.updateCriticalHeartbeatSfx();
  }

  updateMovement() {
    const onGround = this.player.body.blocked.down;

    // Auto-move during end cutscene
    if (this.scene.cutsceneAutoMove) {
      const targetX = this.scene.CUTSCENE_END_X;

      if (this.player.x < targetX) {
        this.player.setVelocityX(this.SPEED);
        this.player.setFlipX(false);
      } else {
        this.player.setVelocityX(0);
        if (typeof this.scene.onCutsceneAutoMoveComplete === "function") {
          this.scene.onCutsceneAutoMoveComplete();
        }
      }
      return;
    }

    // Lock controls during cutscene hold
    if (this.scene.cutsceneControlLocked) {
      this.player.setVelocityX(0);
      return;
    }

    // Lock controls during boss arena speech
    if (this.scene.bossArenaSpeechControlLocked) {
      this.player.setVelocityX(0);
      return;
    }

    // Prevent input if hit or dead
    if (this.scene.playerIsBeingHit || this.scene.playerIsDead) {
      return;
    }

    // Attack input
    if (this.scene.inputManager.isAttackJustPressed()) {
      this.performAttack();
    }

    // Stop horizontal movement during attack
    if (this.isAttacking) {
      this.player.setVelocityX(0);
      return;
    }

    // Horizontal movement
    if (this.scene.inputManager.isLeftPressed()) {
      this.player.setVelocityX(-this.SPEED);
      this.player.setFlipX(true);
    } else if (this.scene.inputManager.isRightPressed()) {
      this.player.setVelocityX(this.SPEED);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // Jump
    if (
      !this.scene.jumpDisabled &&
      this.scene.inputManager.isJumpJustPressed() &&
      onGround
    ) {
      this.player.setVelocityY(-this.JUMP_VELOCITY);
      this.playSfx(ASSETS.SOUNDS.EFFECTS.JUMP, { volume: 0.45 });
    }
  }

  updateAnimationState() {
    const onGround = this.player.body.blocked.down;
    const moving = Math.abs(this.player.body.velocity.x) > 1;

    // Skip animation updates if being hit or dead
    if (this.scene.playerIsBeingHit || this.scene.playerIsDead) return;
    if (this.isAttacking) return;
    if (this.scene.endKissActive) {
      this.player.setFlipX(true);
      return this.playAnimation("theertha-kiss");
    }
    if (this.scene.endRunActive || this.scene.slideshowPlaceholderActive) {
      this.player.setFlipX(false);
      return this.playAnimation("run");
    }

    if (!onGround) return this.playAnimation("jump");
    if (moving) {
      if (this.scene.cutsceneTriggered) return this.playAnimation("love");
      return this.playAnimation("run");
    }
    return this.playAnimation("idle");
  }

  playAnimation(key) {
    if (this.lastAnimKey === key) return;
    this.lastAnimKey = key;
    this.player.play(key, true);
  }

  performAttack() {
    if (this.isAttacking) return;
    if (!this.player.body.blocked.down) return;

    this.isAttacking = true;

    this.lastAnimKey = null;
    this.player.play("attack", true);
    this.playSfx(ASSETS.SOUNDS.EFFECTS.ATTACK, { volume: 0.5 });

    const direction = this.player.flipX ? -1 : 1;

    const heart = this.scene.collectibleManager.hearts.create(
      this.player.x + direction * 40,
      this.player.y - 25,
      ASSETS.ITEMS.HEART,
    );

    heart.setDepth(25);
    heart.setScale(0.15);
    heart.setVelocityX(550 * direction);

    this.scene.time.delayedCall(1200, () => {
      if (heart && heart.active) heart.destroy();
    });

    this.scene.time.delayedCall(this.ATTACK_COOLDOWN, () => {
      this.isAttacking = false;
    });
  }

  takeDamage(knockbackDirection) {
    // Lose one life
    this.scene.playerLives -= 1;

    // Update HUD
    this.scene.hudManager.updateLives(this.scene.playerLives);

    // Mark as being hit
    this.scene.playerIsBeingHit = true;

    // Screen shake!
    this.scene.cameras.main.shake(300, 0.015);

    // Apply knockback
    this.player.setVelocityX(knockbackDirection * 300);
    this.player.setVelocityY(-200);
    this.playSfx(ASSETS.SOUNDS.EFFECTS.HURT, { volume: 0.55 });
    this.stopRunningSfx();

    // Play hit animation
    this.lastAnimKey = null;
    this.player.play("jump");

    // Check if dead
    if (this.scene.playerLives <= 0) {
      this.die();
    } else {
      // Resume control after hit
      this.scene.time.delayedCall(500, () => {
        if (this.player && this.player.active && !this.scene.playerIsDead) {
          this.scene.playerIsBeingHit = false;
        }
      });
    }
  }

  die() {
    this.scene.playerIsDead = true;
    this.playSfx(ASSETS.SOUNDS.EFFECTS.GAME_OVER, { volume: 0.65 });
    this.stopRunningSfx();
    this.stopCriticalHeartbeatSfx();

    this.scene.time.delayedCall(400, () => {
      if (!this.player || !this.player.active) return;

      // Disable collisions
      this.player.body.checkCollision.none = true;
      this.player.body.setCollideWorldBounds(false);

      // Jump up
      this.player.setVelocityY(-500);
      this.player.setVelocityX(0);

      // Play jump animation
      this.player.play("jump");

      // Game over
      this.scene.time.delayedCall(2000, () => {
        this.scene.gameOver();
      });
    });
  }

  playSfx(key, config = {}) {
    if (!this.scene?.sound) return;
    if (!this.scene.cache?.audio?.exists(key)) return;
    this.scene.sound.play(key, config);
  }

  updateRunningSfx() {
    if (!this.runningLoopSfx) return;

    const onGround = this.player?.body?.blocked?.down;
    const moving = Math.abs(this.player?.body?.velocity?.x || 0) > 1;
    const canRunSound =
      onGround &&
      moving &&
      !this.isAttacking &&
      !this.scene.playerIsBeingHit &&
      !this.scene.playerIsDead &&
      !this.scene.endKissActive;

    if (canRunSound) {
      if (!this.runningLoopSfx.isPlaying) {
        this.runningLoopSfx.play();
      }
      return;
    }

    this.stopRunningSfx();
  }

  stopRunningSfx() {
    if (this.runningLoopSfx?.isPlaying) {
      this.runningLoopSfx.stop();
    }
  }

  updateCriticalHeartbeatSfx() {
    if (!this.criticalHeartbeatSfx) return;

    const criticalLives = this.scene.playerLives < 3;
    const shouldPlay = criticalLives && !this.scene.playerIsDead;

    if (shouldPlay) {
      if (!this.criticalHeartbeatSfx.isPlaying) {
        this.criticalHeartbeatSfx.play();
      }
      return;
    }

    this.stopCriticalHeartbeatSfx();
  }

  stopCriticalHeartbeatSfx() {
    if (this.criticalHeartbeatSfx?.isPlaying) {
      this.criticalHeartbeatSfx.stop();
    }
  }
}
