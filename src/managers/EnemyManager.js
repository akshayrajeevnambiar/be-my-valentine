import { ASSETS } from "../assets/asset-keys";
import BossController from "../entities/Bosscontroller";

export default class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.minions = null;
    this.bosses = null;
    this.bossControllers = []; // Track active boss controllers
  }

  create() {
    this.createMinionsGroup();
    this.createBossGroup();
  }

  createMinionsGroup() {
    this.minions = this.scene.physics.add.group({
      allowGravity: true,
    });

    this.scene.physics.add.collider(
      this.minions,
      this.scene.platformBuilder.platforms,
    );
  }

  createBossGroup() {
    this.bosses = this.scene.physics.add.group({
      allowGravity: true,
    });

    this.scene.physics.add.collider(
      this.bosses,
      this.scene.platformBuilder.platforms,
    );
  }

  spawnMinion(x, y, patrolDistance = 200) {
    const minion = this.minions.create(x, y, ASSETS.CHARACTERS.MINION.IDLE);

    minion.setScale(3.5);
    minion.body.setGravityY(1200);
    minion.setCollideWorldBounds(true);
    minion.setDepth(30);

    minion.body.setSize(30, 40);
    minion.body.setOffset(9, 8);

    // Patrol properties
    minion.patrolStartX = x;
    minion.patrolDistance = patrolDistance;
    minion.patrolSpeed = 80;
    minion.patrolDirection = 1;

    // Health and state
    minion.health = 500;
    minion.isBeingHit = false;
    minion.isDead = false;

    minion.setFlipX(true);
    minion.play("minion-run");

    return minion;
  }

  spawnBoss(x, y, patrolDistance = 200) {
    const boss = this.bosses.create(x, y, ASSETS.CHARACTERS.BOSS.IDLE);

    boss.setScale(2.0); // Increased from 0.65 to 2.0
    boss.setDepth(30);

    boss.setCollideWorldBounds(true);
    boss.body.setGravityY(1200);

    // Adjusted collider for scale 2.0 (roughly 3x larger)
    boss.body.setSize(150, 220, true);
    boss.body.setOffset(55, 25);

    // Patrol properties
    boss.patrolStartX = x;
    boss.patrolDistance = patrolDistance;
    boss.patrolSpeed = 80;
    boss.patrolDirection = 1;

    // Health and state
    boss.maxHealth = 1200;
    boss.health = 1200;
    boss.isBeingHit = false;
    boss.isDead = false;

    boss.setFlipX(true);
    boss.play("boss-idle", true);

    // Create boss controller for AI and attacks
    const bossController = new BossController(this.scene, boss);
    boss.controller = bossController;
    this.bossControllers.push(bossController);

    // Show boss health bar after a short delay (dramatic entrance)
    this.scene.time.delayedCall(1000, () => {
      this.scene.hudManager.showBossHealth(boss.health, boss.maxHealth);
    });

    return boss;
  }

  update() {
    this.updateMinions();
    this.updateBosses();
    this.updateBossControllers();
  }

  updateBossControllers() {
    const currentTime = this.scene.time.now;
    this.bossControllers.forEach((controller) => {
      controller.update(currentTime);
    });
  }

  updateMinions() {
    this.minions.getChildren().forEach((minion) => {
      if (!minion.active) return;
      if (minion.isBeingHit) return;
      if (minion.health <= 0) return;
      if (minion.isDead) return;

      this.updatePatrol(minion);
    });
  }

  updateBosses() {
    this.bosses.getChildren().forEach((boss) => {
      if (!boss.active) return;
      if (boss.isBeingHit) return;
      if (boss.health <= 0) return;
      if (boss.isDead) return;

      this.updatePatrol(boss);
    });
  }

  updatePatrol(entity) {
    const leftBound = entity.patrolStartX - entity.patrolDistance / 2;
    const rightBound = entity.patrolStartX + entity.patrolDistance / 2;

    entity.setVelocityX(entity.patrolSpeed * entity.patrolDirection);

    if (entity.x <= leftBound) {
      entity.patrolDirection = 1;
      entity.setFlipX(true);
    } else if (entity.x >= rightBound) {
      entity.patrolDirection = -1;
      entity.setFlipX(false);
    }
  }

  handleMinionHit(minion, knockbackDirection) {
    minion.health -= 100;
    minion.isBeingHit = true;

    minion.setVelocityX(knockbackDirection * 150);
    minion.play("minion-hit");

    if (minion.health <= 0) {
      this.killMinion(minion);
    } else {
      this.scene.time.delayedCall(400, () => {
        if (minion && minion.active) {
          minion.isBeingHit = false;
          minion.play("minion-run");
        }
      });
    }
  }

  handleBossHit(boss, knockbackDirection) {
    if (!boss.controller) return;
    if (boss.isDead) return; // Already dead, skip

    boss.isBeingHit = true;

    boss.setVelocityX(knockbackDirection * 150);
    boss.play("boss-hit");

    // Use controller to handle damage
    boss.controller.takeDamage(100);

    if (boss.health <= 0) {
      // Controller handles death
      boss.controller.die();
    } else {
      this.scene.time.delayedCall(400, () => {
        if (boss && boss.active && !boss.isDead) {
          boss.isBeingHit = false;
          boss.play("boss-idle");
        }
      });
    }
  }

  killMinion(minion) {
    minion.isDead = true;

    this.scene.time.delayedCall(400, () => {
      if (!minion || !minion.active) return;

      minion.body.checkCollision.none = true;
      minion.body.setCollideWorldBounds(false);

      minion.setVelocityY(-400);
      minion.setVelocityX(0);

      // Store position for potential heart drop
      const dropX = minion.x;
      const dropY = minion.y;

      this.scene.time.delayedCall(2000, () => {
        if (minion && minion.active) {
          minion.destroy();

          // Check for heart drop after minion is destroyed
          this.checkHeartDrop(dropX, dropY);
        }
      });
    });
  }

  checkHeartDrop(x, y) {
    // Don't drop if player already at max lives
    if (this.scene.playerLives >= 5) return;

    // Drop chance based on player lives
    let dropChance = 0.25; // 25% base chance

    if (this.scene.playerLives <= 2) {
      dropChance = 0.5; // 50% when desperate (≤2 lives)
    }

    // Roll for drop
    if (Math.random() < dropChance) {
      console.log(`Heart dropped! (${Math.floor(dropChance * 100)}% chance)`);
      this.scene.collectibleManager.spawnLifePickup(x, y);
    }
  }

  killBoss(boss) {
    boss.isDead = true;

    this.scene.time.delayedCall(400, () => {
      if (!boss || !boss.active) return;

      boss.body.checkCollision.none = true;
      boss.body.setCollideWorldBounds(false);

      boss.setVelocityY(-400);
      boss.setVelocityX(0);

      this.scene.time.delayedCall(2000, () => {
        if (boss && boss.active) {
          boss.destroy();
        }
      });
    });
  }
}
