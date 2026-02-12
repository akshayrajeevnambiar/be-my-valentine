import { ASSETS } from "../assets/asset-keys";

export default class AssetLoader {
  static loadAll(scene) {
    this.loadBackgrounds(scene);
    this.loadCharacters(scene);
    this.loadTiles(scene);
    this.loadItems(scene);
    this.loadSounds(scene);
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
      ASSETS.ITEMS.GAME_OVER_CARD,
      "assets/items/game-over-card.png",
    );
    scene.load.image(
      ASSETS.ITEMS.SPEECH_BUBBLE,
      "assets/items/speech-bubble.png",
    );
    scene.load.image(
      ASSETS.ITEMS.MOVEMENT_BUTTONS,
      "assets/items/movement-buttons.png",
    );
    scene.load.image(
      ASSETS.ITEMS.ATTACK_BUTTON,
      "assets/items/attack-button.png",
    );
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

  static loadSounds(scene) {
    scene.load.audio(
      ASSETS.SOUNDS.MUSIC.BOSS_FIGHT,
      "assets/sounds/bg-music/boss-fight.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.MUSIC.BOSS_INTRO,
      "assets/sounds/bg-music/boss-intro.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.MUSIC.END_CUTSCENE,
      "assets/sounds/bg-music/end-cutscene.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.MUSIC.GAME_LOOP,
      "assets/sounds/bg-music/game-music-loop.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.MUSIC.GAME_OVER_BG,
      "assets/sounds/bg-music/game-over-bg.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.MUSIC.TITLE_CARD,
      "assets/sounds/bg-music/title-card.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.MUSIC.VICTORY,
      "assets/sounds/bg-music/victory.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.ATTACK,
      "assets/sounds/effects/attack.wav",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.BOSS_ATTACK,
      "assets/sounds/effects/boss-attack.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.BOSS_HURT,
      "assets/sounds/effects/boss-hurt.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.COIN_PICKUP,
      "assets/sounds/effects/coin-pickup.wav",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.HEART_BEAT,
      "assets/sounds/effects/heart-beat.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.HURT,
      "assets/sounds/effects/hurt.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.JUMP,
      "assets/sounds/effects/jump.wav",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.GAME_START,
      "assets/sounds/effects/game-start.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.GAME_OVER,
      "assets/sounds/effects/game-over.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.LIFE_PICKUP,
      "assets/sounds/effects/life-pickup.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.KISS,
      "assets/sounds/effects/kiss.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.MINION_HURT,
      "assets/sounds/effects/minion-hurt.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.RUNNING,
      "assets/sounds/effects/running.mp3",
    );
    scene.load.audio(
      ASSETS.SOUNDS.EFFECTS.WIN,
      "assets/sounds/effects/win.mp3",
    );
  }
}
