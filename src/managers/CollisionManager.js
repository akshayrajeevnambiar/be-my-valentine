export default class CollisionManager {
  constructor(scene) {
    this.scene = scene;
  }

  setupAll() {
    this.setupStarCollect();
    this.setupLifePickupCollect();
    this.setupHeartMinionCollision();
    this.setupHeartBossCollision();
    this.setupPlayerMinionCollision();
    this.setupPlayerBossCollision();
    this.setupEnergyBallPlayerCollision();
  }

  setupStarCollect() {
    this.scene.physics.add.overlap(
      this.scene.playerController.player,
      this.scene.collectibleManager.stars,
      (player, star) => {
        this.scene.collectibleManager.collectStar(star);
      },
    );
  }

  setupLifePickupCollect() {
    this.scene.physics.add.overlap(
      this.scene.playerController.player,
      this.scene.collectibleManager.lifePickups,
      (player, lifeHeart) => {
        this.scene.collectibleManager.collectLifePickup(lifeHeart);
      },
    );
  }

  setupHeartMinionCollision() {
    this.scene.physics.add.overlap(
      this.scene.collectibleManager.hearts,
      this.scene.enemyManager.minions,
      (heart, minion) => {
        if (!heart || !heart.active || !minion || !minion.active) return;
        if (minion.isBeingHit) return;

        const knockbackDirection = heart.body.velocity.x > 0 ? 1 : -1;
        heart.destroy();

        this.scene.enemyManager.handleMinionHit(minion, knockbackDirection);
      },
    );
  }

  setupHeartBossCollision() {
    this.scene.physics.add.overlap(
      this.scene.collectibleManager.hearts,
      this.scene.enemyManager.bosses,
      (heart, boss) => {
        if (!heart || !heart.active || !boss || !boss.active) return;
        if (boss.isDead) return; // Only check if dead

        const knockbackDirection = heart.body.velocity.x > 0 ? 1 : -1;
        heart.destroy();

        this.scene.enemyManager.handleBossHit(boss, knockbackDirection);
      },
    );
  }

  setupPlayerMinionCollision() {
    this.scene.physics.add.overlap(
      this.scene.playerController.player,
      this.scene.enemyManager.minions,
      (player, minion) => {
        if (!player || !player.active || !minion || !minion.active) return;
        if (this.scene.playerIsBeingHit) return;
        if (this.scene.playerIsDead) return;
        if (minion.isDead) return;

        const knockbackDirection = player.x < minion.x ? -1 : 1;
        this.scene.playerController.takeDamage(knockbackDirection);
      },
    );
  }

  setupPlayerBossCollision() {
    this.scene.physics.add.overlap(
      this.scene.playerController.player,
      this.scene.enemyManager.bosses,
      (player, boss) => {
        if (!player || !player.active || !boss || !boss.active) return;
        if (this.scene.playerIsBeingHit) return;
        if (this.scene.playerIsDead) return;
        if (boss.isDead) return;

        const knockbackDirection = player.x < boss.x ? -1 : 1;
        this.scene.playerController.takeDamage(knockbackDirection);
      },
    );
  }

  setupEnergyBallPlayerCollision() {
    // We need to setup collision for each boss controller's energy balls
    // This will be called dynamically when bosses spawn
    // For now, we'll check in the update or handle it differently

    // Actually, let's setup a general overlap check
    this.scene.events.on("update", () => {
      // Check all boss controllers
      if (this.scene.enemyManager && this.scene.enemyManager.bossControllers) {
        this.scene.enemyManager.bossControllers.forEach((controller) => {
          if (controller.energyBalls) {
            this.scene.physics.overlap(
              this.scene.playerController.player,
              controller.energyBalls,
              (player, ball) => {
                this.handleEnergyBallHit(player, ball);
              },
            );
          }
        });
      }
    });
  }

  handleEnergyBallHit(player, ball) {
    if (!player || !player.active || !ball || !ball.active) return;
    if (this.scene.playerIsBeingHit) return;
    if (this.scene.playerIsDead) return;

    // Destroy the energy ball
    ball.destroy();

    // Determine knockback direction (away from ball)
    const knockbackDirection = player.x < ball.x ? -1 : 1;

    // Player takes damage
    this.scene.playerController.takeDamage(knockbackDirection);
  }
}
