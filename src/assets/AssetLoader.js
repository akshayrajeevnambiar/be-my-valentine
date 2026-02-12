import { ASSETS } from "../assets/asset-keys";

export default class AssetLoader {
  static loadAll(scene) {
    this.loadBackgrounds(scene);
    this.loadCharacters(scene);
    this.loadTiles(scene);
    this.loadItems(scene);
  }

  static loadBackgrounds(scene) {
    scene.load.image(
      ASSETS.BACKGROUNDS.NATURE.SKY,
      "assets/enviroment/backgrounds/nature/sky.png",
    );
    scene.load.image(
      ASSETS.BACKGROUNDS.NATURE.HILLS,
      "assets/enviroment/backgrounds/nature/hills.png",
    );
    scene.load.image(
      ASSETS.BACKGROUNDS.NATURE.TREES,
      "assets/enviroment/backgrounds/nature/trees.png",
    );
    scene.load.image(
      ASSETS.BACKGROUNDS.NATURE.CLOUDS,
      "assets/enviroment/backgrounds/nature/clouds.png",
    );
  }

  static loadCharacters(scene) {
    // Player sprites
    scene.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.IDLE,
      "assets/characters/theertha/idle.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.RUN,
      "assets/characters/theertha/run.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.JUMP,
      "assets/characters/theertha/jump.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.ATTACK,
      "assets/characters/theertha/attack.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.KISS,
      "assets/characters/theertha/kiss.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.HIT,
      "assets/characters/theertha/hit.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.THEERTHA.LOVE,
      "assets/characters/theertha/love.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.AKSHAY.RUN,
      "assets/characters/akshay/run.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.AKSHAY.LOVE,
      "assets/characters/akshay/love.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.AKSHAY.IDLE,
      "assets/characters/akshay/idle.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.AKSHAY.KISS,
      "assets/characters/akshay/kiss.png",
      { frameWidth: 256, frameHeight: 256 },
    );

    // Minion sprites
    scene.load.spritesheet(
      ASSETS.CHARACTERS.MINION.IDLE,
      "assets/characters/enemies/minion/Idle.png",
      { frameWidth: 48, frameHeight: 48 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.MINION.RUN,
      "assets/characters/enemies/minion/Run.png",
      { frameWidth: 48, frameHeight: 48 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.MINION.HIT,
      "assets/characters/enemies/minion/Hit.png",
      { frameWidth: 48, frameHeight: 48 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.MINION.JUMP,
      "assets/characters/enemies/minion/Jump.png",
      { frameWidth: 48, frameHeight: 48 },
    );

    // Boss sprites
    scene.load.spritesheet(
      ASSETS.CHARACTERS.BOSS.JUMP,
      "assets/characters/enemies/boss/jump.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.BOSS.FALL,
      "assets/characters/enemies/boss/fall.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.BOSS.ATTACK,
      "assets/characters/enemies/boss/attack.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.BOSS.IDLE,
      "assets/characters/enemies/boss/idle.png",
      { frameWidth: 256, frameHeight: 256 },
    );
    scene.load.spritesheet(
      ASSETS.CHARACTERS.BOSS.HIT,
      "assets/characters/enemies/boss/hit.png",
      { frameWidth: 256, frameHeight: 256 },
    );
  }

  static loadItems(scene) {
    scene.load.image(ASSETS.ITEMS.HEART, "assets/items/heart.png");
    scene.load.image(
      ASSETS.ITEMS.MOVEMENT_BUTTONS,
      "assets/items/movement-buttons.png",
    );
    scene.load.image(ASSETS.ITEMS.ATTACK_BUTTON, "assets/items/attack-button.png");
    scene.load.spritesheet(ASSETS.ITEMS.STARS, "assets/items/stars.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    // Energy ball spritesheet - 3x3 grid of 64x64 frames
    scene.load.spritesheet(ASSETS.ITEMS.ENERGY_BALL, "assets/items/ball.png", {
      frameWidth: 384,
      frameHeight: 393,
    });
  }

  static loadTiles(scene) {
    scene.load.image(
      ASSETS.TILESETS.GRASS_GROUND.LEFT,
      "assets/enviroment/tilesets/grass-tile-left.png",
    );
    scene.load.image(
      ASSETS.TILESETS.GRASS_GROUND.MIDDLE,
      "assets/enviroment/tilesets/grass-tile-middle.png",
    );
    scene.load.image(
      ASSETS.TILESETS.GRASS_GROUND.RIGHT,
      "assets/enviroment/tilesets/grass-tile-right.png",
    );
    scene.load.image(
      ASSETS.TILESETS.GRASS_FLOATING.LEFT,
      "assets/enviroment/tilesets/grass-floating-tile-left.png",
    );
    scene.load.image(
      ASSETS.TILESETS.GRASS_FLOATING.MIDDLE,
      "assets/enviroment/tilesets/grass-floating-tile-middle.png",
    );
    scene.load.image(
      ASSETS.TILESETS.GRASS_FLOATING.RIGHT,
      "assets/enviroment/tilesets/grass-floating-tile-right.png",
    );
  }
}
