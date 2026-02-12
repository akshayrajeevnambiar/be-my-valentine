import { ASSETS } from "../../assets/asset-keys";

export function preloadBackgroundAssets(scene) {
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

export function preloadCharacterAssets(scene) {
  scene.load.spritesheet(
    ASSETS.CHARACTERS.THEERTHA.RUN,
    "assets/characters/theertha/run.png",
    { frameWidth: 256, frameHeight: 256 },
  );

  scene.load.spritesheet(
    ASSETS.CHARACTERS.THEERTHA.IDLE,
    "assets/characters/theertha/idle.png",
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
    ASSETS.CHARACTERS.BOSS.IDLE,
    "assets/characters/enemies/boss/idle.png",
    { frameWidth: 256, frameHeight: 256 },
  );
}

export function preloadTileAssets(scene) {
  scene.load.image(
    ASSETS.TILESETS.GRASS_GROUND.MIDDLE,
    "assets/enviroment/tilesets/grass-tile-middle.png",
  );
}

export function preloadItemAssets(scene) {
  scene.load.image(ASSETS.ITEMS.TITLE_CARD, "assets/items/title-card.png");
  scene.load.image(ASSETS.ITEMS.INSTRUCTION, "assets/items/instruction.png");
  scene.load.image(
    ASSETS.ITEMS.SPEECH_BUBBLE,
    "assets/items/speech-bubble.png",
  );
}

export function preloadSoundAssets(scene) {
  scene.load.audio(
    ASSETS.SOUNDS.MUSIC.BOSS_INTRO,
    "assets/sounds/bg-music/boss-intro.mp3",
  );
  scene.load.audio(
    ASSETS.SOUNDS.MUSIC.END_CUTSCENE,
    "assets/sounds/bg-music/end-cutscene.mp3",
  );
  scene.load.audio(
    ASSETS.SOUNDS.MUSIC.TITLE_CARD,
    "assets/sounds/bg-music/title-card.mp3",
  );
  scene.load.audio(
    ASSETS.SOUNDS.EFFECTS.GAME_START,
    "assets/sounds/effects/game-start.mp3",
  );
}
