import { ASSETS } from "../../assets/asset-keys";
import { createAudio, playAudio } from "../../utils/audio";

export function playMusic(scene, key, config = {}) {
  if (!scene.registry.get("musicUnlocked")) return;
  const { volume = 0.3, loop = true } = config;

  if (scene.currentMusic && scene.currentMusicKey === key) {
    if (!scene.currentMusic.isPlaying) {
      scene.currentMusic.play();
    }
    return;
  }

  stopCurrentMusic(scene);
  scene.currentMusic = createAudio(scene, key, { volume, loop });
  if (!scene.currentMusic) return;
  scene.currentMusicKey = key;
  scene.currentMusic.play();
}

export function stopCurrentMusic(scene) {
  if (scene.currentMusic) {
    scene.currentMusic.stop();
    scene.currentMusic.destroy();
    scene.currentMusic = null;
    scene.currentMusicKey = null;
  }
}

export function playGameOverBgMusic(scene) {
  if (scene.gameOverBgMusic) {
    if (!scene.gameOverBgMusic.isPlaying) scene.gameOverBgMusic.play();
    return;
  }
  scene.gameOverBgMusic = createAudio(scene, ASSETS.SOUNDS.MUSIC.GAME_OVER_BG, {
    volume: 0.34,
    loop: true,
  });
  if (!scene.gameOverBgMusic) return;
  scene.gameOverBgMusic.play();
}

export function stopGameOverBgMusic(scene) {
  if (scene.gameOverBgMusic) {
    scene.gameOverBgMusic.stop();
    scene.gameOverBgMusic.destroy();
    scene.gameOverBgMusic = null;
  }
}

export function playSfx(scene, key, config = {}) {
  playAudio(scene, key, config);
}
