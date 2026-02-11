import { ASSETS } from "../assets/asset-keys";

export default class PlatformBuilder {
  constructor(scene) {
    this.scene = scene;
    this.platforms = null;
  }

  createGround() {
    const { height } = this.scene.cameras.main;

    this.platforms = this.scene.physics.add.staticGroup();
    this.platforms.setDepth(10);

    this.scene.physics.world.setBounds(0, 0, this.scene.worldWidth, height);

    // Create ground tiles
    for (let x = 0; x < this.scene.worldWidth; x += this.scene.TILE_SIZE) {
      this.platforms
        .create(
          x,
          height - this.scene.TILE_SIZE,
          ASSETS.TILESETS.GRASS_GROUND.MIDDLE,
        )
        .setOrigin(0, 0)
        .setDisplaySize(this.scene.TILE_SIZE, this.scene.TILE_SIZE)
        .refreshBody();
    }
  }

  buildFloatingPlatform(x, y, numTiles = 3) {
    const tiles = [];

    for (let i = 0; i < numTiles; i++) {
      let textureKey;

      if (i === 0) {
        textureKey = ASSETS.TILESETS.GRASS_FLOATING.LEFT;
      } else if (i === numTiles - 1) {
        textureKey = ASSETS.TILESETS.GRASS_FLOATING.RIGHT;
      } else {
        textureKey = ASSETS.TILESETS.GRASS_FLOATING.MIDDLE;
      }

      const tile = this.platforms
        .create(x + i * this.scene.TILE_SIZE, y, textureKey)
        .setOrigin(0, 0)
        .setDisplaySize(this.scene.TILE_SIZE, 50);

      tile.body.setSize(100, 200);
      tile.body.setOffset(0, 200);
      tile.refreshBody();

      tiles.push(tile);
    }

    return tiles;
  }

  buildLevel1() {
    const groundTopY = this.scene.cameras.main.height - this.scene.TILE_SIZE;

    // Floating platforms
    this.buildFloatingPlatform(600, groundTopY - 200, 3);
    this.buildFloatingPlatform(1100, groundTopY - 350, 4);
    this.buildFloatingPlatform(1700, groundTopY - 250, 3);
    this.buildFloatingPlatform(2700, groundTopY - 200, 3);
    this.buildFloatingPlatform(3300, groundTopY - 200, 3);
    this.buildFloatingPlatform(3850, groundTopY - 200, 3);
    this.buildFloatingPlatform(4300, groundTopY - 400, 3);
    this.buildFloatingPlatform(4800, groundTopY - 200, 3);
    this.buildFloatingPlatform(5100, groundTopY - 400, 3);

    // Stars above platforms
    this.spawnStarsForLevel1(groundTopY);

    // Spawn minions throughout level (can drop hearts when defeated)
    this.spawnMinionsForLevel1(groundTopY);

    // Boss will spawn when player enters arena (handled in PlayScene)
  }

  spawnStarsForLevel1(groundTopY) {
    const cm = this.scene.collectibleManager;
    const TILE = this.scene.TILE_SIZE;

    // Platform stars
    cm.spawnStar(600 + TILE, groundTopY - 280);
    cm.spawnStar(700 + TILE, groundTopY - 280);
    cm.spawnStar(1000 + TILE * 2, groundTopY - 440);
    cm.spawnStar(1100 + TILE * 2, groundTopY - 440);
    cm.spawnStar(1200 + TILE * 2, groundTopY - 440);
    cm.spawnStar(1700 + TILE, groundTopY - 330);
    cm.spawnStar(1800 + TILE, groundTopY - 330);
    cm.spawnStar(2800 + TILE, groundTopY - 280);
    cm.spawnStar(2900 + TILE, groundTopY - 280);
    cm.spawnStar(3050 + TILE, groundTopY - 440);
    cm.spawnStar(3200 + TILE, groundTopY - 280);
    cm.spawnStar(3300 + TILE, groundTopY - 280);

    // Ground stars
    cm.spawnStar(800 + TILE, groundTopY - 75);
    cm.spawnStar(1000 + TILE, groundTopY - 75);
    cm.spawnStar(1200 + TILE, groundTopY - 75);
    cm.spawnStar(1400 + TILE, groundTopY - 75);
    cm.spawnStar(1600 + TILE, groundTopY - 75);
  }

  spawnMinionsForLevel1(groundTopY) {
    const em = this.scene.enemyManager;

    // Spawn minions at strategic positions
    // These enemies can drop hearts when defeated (25% base, 50% if lives ≤ 2)

    // // Early game minions
    // em.spawnMinion(1300, groundTopY - 100, 250);
    // em.spawnMinion(1900, groundTopY - 100, 300);

    // // Mid game minions
    // em.spawnMinion(2500, groundTopY - 100, 300);
    // em.spawnMinion(3000, groundTopY - 100, 350);

    // // Late game minions (before boss)
    // em.spawnMinion(3700, groundTopY - 100, 300);
    // em.spawnMinion(4200, groundTopY - 100, 250);
  }
}
