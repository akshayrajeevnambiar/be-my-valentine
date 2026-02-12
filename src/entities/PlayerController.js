import Phaser from "phaser";
import { ASSETS } from "../assets/asset-keys";

export default class PlayerController {
  constructor(scene) {
    this.scene = scene;
    this.player = null;
    this.lastAnimKey = null;
    this.isAttacking = false;

    // Constants
    this.SPEED = 350;
    this.JUMP_VELOCITY = 1000;
    this.ATTACK_COOLDOWN = 450;
  }

  create() {
    const { height } = this.scene.cameras.main;

    this.player = this.scene.physics.add
      .sprite(
        4400,
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
  }

  update() {
    this.updateMovement();
    this.updateAnimationState();
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
}
