import { ASSETS } from "../assets/asset-keys";
import { playAudio } from "../utils/audio";

export default class BossController {
  constructor(scene, boss) {
    this.scene = scene;
    this.boss = boss;

    // Attack properties
    this.isAttacking = false;
    this.attackCooldown = 3000; // 3 seconds between attacks
    this.lastAttackTime = 0;
    this.energyBalls = null;

    // Boss AI state
    this.attackPattern = 0; // 0 = single shot, 1 = triple shot, 2 = spread

    // Boss arena heart spawn system
    this.heartSpawnCooldown = 8000; // Check every 8 seconds
    this.lastHeartSpawnCheck = 0;

    this.setupAttacks();
  }

  setupAttacks() {
    // Create energy ball group
    this.energyBalls = this.scene.physics.add.group({
      allowGravity: false,
    });
  }

  update(time) {
    if (!this.boss || !this.boss.active) return;
    if (this.boss.isDead) return;
    if (this.boss.isBeingHit) return;
    if (this.scene.bossArenaSpeechControlLocked) return;

    // Check if we should attack
    if (time - this.lastAttackTime > this.attackCooldown) {
      this.performAttack();
      this.lastAttackTime = time;
    }

    // Check for conditional heart spawn (boss arena only)
    if (time - this.lastHeartSpawnCheck > this.heartSpawnCooldown) {
      this.checkBossArenaHeartSpawn();
      this.lastHeartSpawnCheck = time;
    }
  }

  checkBossArenaHeartSpawn() {
    // Only spawn if player has ≤ 3 lives
    if (this.scene.playerLives > 3) return;

    // Don't spawn if already at max
    if (this.scene.playerLives >= 5) return;

    // 40% chance to spawn a heart
    const spawnChance = 0.4;

    if (Math.random() < spawnChance) {
      // Define boss arena area
      const arenaStartX = this.scene.BOSS_GATE_X;
      const groundY = this.scene.cameras.main.height - this.scene.TILE_SIZE;

      // Possible spawn positions in boss arena (including platforms)
      const spawnPositions = [
        // Ground level positions
        { x: arenaStartX + 150, y: groundY - 100 },
        { x: arenaStartX + 300, y: groundY - 100 },
        { x: arenaStartX + 450, y: groundY - 100 },
        { x: arenaStartX + 600, y: groundY - 100 },

        // Platform at x=4800 (groundY - 200)
        { x: 4800 + 100, y: groundY - 280 },
        { x: 4800 + 200, y: groundY - 280 },

        // Platform at x=5100 (groundY - 400) - higher platform
        { x: 5100 + 100, y: groundY - 480 },
        { x: 5100 + 200, y: groundY - 480 },
      ];

      // Pick a random spawn position
      const spawnPos =
        spawnPositions[Math.floor(Math.random() * spawnPositions.length)];

      console.log(
        `Boss arena heart spawned at platform! (Player at ${this.scene.playerLives} lives)`,
      );
      this.scene.collectibleManager.spawnLifePickup(spawnPos.x, spawnPos.y);
    } else {
      console.log(
        `Boss arena heart spawn failed (${Math.floor(spawnChance * 100)}% chance)`,
      );
    }
  }

  performAttack() {
    if (this.isAttacking) return;

    this.isAttacking = true;

    // Play attack animation
    this.boss.play("boss-attack");
    this.playSfx(ASSETS.SOUNDS.EFFECTS.BOSS_ATTACK, { volume: 0.5 });

    // Determine attack pattern based on health
    const healthPercent = this.boss.health / this.boss.maxHealth;

    if (healthPercent > 0.66) {
      // Phase 1: Single shot
      this.scene.time.delayedCall(400, () => {
        this.shootEnergyBall(0);
      });
    } else if (healthPercent > 0.33) {
      // Phase 2: Double shot
      this.scene.time.delayedCall(400, () => {
        this.shootEnergyBall(-20, 0.2);
        this.shootEnergyBall(20, 0.2);
      });
    } else {
      // Phase 3: Spread shot (3 balls)
      this.scene.time.delayedCall(400, () => {
        this.shootEnergyBall(-15, 0.1);
        this.shootEnergyBall(0, 0.1);
        this.shootEnergyBall(15, 0.1);
      });
    }

    // Return to idle after attack animation
    this.scene.time.delayedCall(1000, () => {
      if (this.boss && this.boss.active && !this.boss.isDead) {
        this.isAttacking = false;
        this.boss.play("boss-idle");
      }
    });
  }

  shootEnergyBall(angleOffset = 0, scale = 0.3) {
    if (!this.boss || !this.boss.active) return;

    // Get player position for aiming
    const player = this.scene.playerController.player;

    // Calculate direction to player
    const dx = player.x - this.boss.x;
    const dy = player.y - this.boss.y;
    const angle = Math.atan2(dy, dx);

    // Apply angle offset for spread patterns
    const finalAngle = angle + (angleOffset * Math.PI) / 180;

    // Create energy ball
    const ball = this.energyBalls.create(
      this.boss.x,
      this.boss.y - 50,
      ASSETS.ITEMS.ENERGY_BALL,
    );

    // Scale down since new sprite is much larger (384x393)
    ball.setScale(scale);
    ball.setDepth(25);
    ball.play("energy-ball");

    // Set velocity based on angle
    const speed = 300;
    ball.setVelocity(
      Math.cos(finalAngle) * speed,
      Math.sin(finalAngle) * speed,
    );

    // Destroy ball after 5 seconds if it doesn't hit anything
    this.scene.time.delayedCall(5000, () => {
      if (ball && ball.active) {
        ball.destroy();
      }
    });
  }

  takeDamage(amount) {
    if (this.boss.isDead) {
      console.log("Boss is already dead, ignoring damage");
      return;
    }

    this.boss.health -= amount;

    console.log(
      `Boss took ${amount} damage! Health: ${this.boss.health}/${this.boss.maxHealth}`,
    );

    // Screen shake on boss hit
    this.scene.cameras.main.shake(200, 0.008);

    // Update boss health bar
    this.scene.hudManager.updateBossHealth(
      this.boss.health,
      this.boss.maxHealth,
    );

    if (this.boss.health <= 0) {
      console.log("Boss health <= 0, triggering death!");
      this.die();
    }
  }

  die() {
    if (!this.boss || !this.boss.active) return;
    if (this.boss.isDead) return;

    this.boss.isDead = true;
    this.isAttacking = false;

    // Stop all energy balls
    this.energyBalls.clear(true, true);

    console.log("Boss defeated!");

    // Big screen shake on death
    this.scene.cameras.main.shake(800, 0.02);

    // Freeze in fall pose, deliver final line, then drop through the floor.
    this.scene.time.delayedCall(300, () => {
      if (!this.boss || !this.boss.active) return;

      this.boss.setVelocity(0, 0);
      this.boss.play("boss-fall", true);

      this.playFinalLine(() => {
        if (!this.boss || !this.boss.active) return;

        this.boss.body.checkCollision.none = true;
        this.boss.body.setCollideWorldBounds(false);
        this.boss.setVelocityX(0);
        this.boss.setVelocityY(520);

        this.scene.time.delayedCall(2400, () => {
          if (this.boss && this.boss.active) {
            this.boss.destroy();

            // Hide boss health bar with fade out
            this.scene.hudManager.hideBossHealth();

            if (typeof this.scene.onBossDefeated === "function") {
              this.scene.onBossDefeated();
            }

            console.log("Victory!");
          }
        });
      });
    });
  }

  playFinalLine(onComplete) {
    if (!this.boss || !this.boss.active) {
      if (typeof onComplete === "function") onComplete();
      return;
    }

    const line = "Even Time cannot stand against true love.";

    const bubble = this.scene.add
      .image(this.boss.x - 320, this.boss.y - 20, ASSETS.ITEMS.SPEECH_BUBBLE)
      .setDepth(90)
      .setScale(0.5)
      .setFlipX(true)
      .setAlpha(0);

    const speechText = this.scene.add
      .text(this.boss.x - 320, this.boss.y - 35, line, {
        fontSize: "30px",
        fontFamily: "Arial",
        color: "#1f1f1f",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(91)
      .setAlpha(0);

    const bubbleSideOffset = 200;
    const targetBubbleWidth = speechText.width + bubbleSideOffset * 2;
    const targetScaleX = Math.max(0.35, targetBubbleWidth / bubble.width);
    bubble.setScale(targetScaleX, 0.5);

    const syncEvent = this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (
          !this.boss ||
          !this.boss.active ||
          !bubble.active ||
          !speechText.active
        )
          return;
        bubble.setPosition(this.boss.x - 320, this.boss.y - 20);
        speechText.setPosition(this.boss.x - 320, this.boss.y - 35);
      },
    });

    const cleanup = () => {
      if (syncEvent) syncEvent.remove(false);
      if (speechText && speechText.active) speechText.destroy();
      if (bubble && bubble.active) bubble.destroy();
      if (typeof onComplete === "function") onComplete();
    };

    this.scene.tweens.add({
      targets: [bubble, speechText],
      alpha: 1,
      duration: 260,
      onComplete: () => {
        this.scene.time.delayedCall(1700, () => {
          this.scene.tweens.add({
            targets: [bubble, speechText],
            alpha: 0,
            duration: 220,
            onComplete: cleanup,
          });
        });
      },
    });
  }

  destroy() {
    if (this.energyBalls) {
      this.energyBalls.clear(true, true);
    }
  }

  playSfx(key, config = {}) {
    playAudio(this.scene, key, config);
  }
}
