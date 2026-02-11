import { ASSETS } from "../assets/asset-keys";

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

    // Determine attack pattern based on health
    const healthPercent = this.boss.health / this.boss.maxHealth;

    if (healthPercent > 0.66) {
      // Phase 1: Single shot
      this.scene.time.delayedCall(400, () => {
        this.shootEnergyBall(0);
      });
    } else if (healthPercent > 0.33) {
      // Phase 2: Triple shot
      this.scene.time.delayedCall(400, () => {
        this.shootEnergyBall(-15);
        this.shootEnergyBall(0);
        this.shootEnergyBall(15);
      });
    } else {
      // Phase 3: Spread shot (5 balls)
      this.scene.time.delayedCall(400, () => {
        this.shootEnergyBall(-30);
        this.shootEnergyBall(-15);
        this.shootEnergyBall(0);
        this.shootEnergyBall(15);
        this.shootEnergyBall(30);
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

  shootEnergyBall(angleOffset = 0) {
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
    ball.setScale(0.3); // Smaller scale for the larger sprite
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
    this.boss.isDead = true;
    this.isAttacking = false;

    // Stop all energy balls
    this.energyBalls.clear(true, true);

    console.log("Boss defeated!");

    // Big screen shake on death
    this.scene.cameras.main.shake(800, 0.02);

    // Play death sequence
    this.scene.time.delayedCall(400, () => {
      if (!this.boss || !this.boss.active) return;

      this.boss.body.checkCollision.none = true;
      this.boss.body.setCollideWorldBounds(false);

      this.boss.setVelocityY(-400);
      this.boss.setVelocityX(0);

      this.scene.time.delayedCall(2000, () => {
        if (this.boss && this.boss.active) {
          this.boss.destroy();

          // Hide boss health bar with fade out
          this.scene.hudManager.hideBossHealth();

          console.log("Victory!");
        }
      });
    });
  }

  destroy() {
    if (this.energyBalls) {
      this.energyBalls.clear(true, true);
    }
  }
}
