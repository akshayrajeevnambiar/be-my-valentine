import { createAudio, playAudio } from "../../utils/audio";

export function introPlaySfx(scene, key, config = {}) {
  playAudio(scene, key, config);
}

export function introPlayMusic(scene, key, config = {}) {
  if (!scene.sound || !scene.cache?.audio?.exists(key)) return;
  const { volume = 0.4, loop = true } = config;
  const ctx = scene.sound?.context;
  const audioBlocked =
    scene.sound.locked || (ctx && ctx.state && ctx.state !== "running");

  if (audioBlocked) {
    scene.pendingIntroMusicKey = key;
    scene.pendingIntroMusicConfig = { volume, loop };
    return;
  }

  if (scene.currentIntroMusic && scene.currentIntroMusicKey === key) {
    if (!scene.currentIntroMusic.isPlaying) {
      scene.currentIntroMusic.play();
    }
    return;
  }

  introStopMusic(scene);
  scene.currentIntroMusic = createAudio(scene, key, { volume, loop });
  if (!scene.currentIntroMusic) return;
  scene.currentIntroMusicKey = key;
  scene.currentIntroMusic.play();
}

export function introTryPlayPendingMusic(scene) {
  if (!scene.pendingIntroMusicKey) return;
  const key = scene.pendingIntroMusicKey;
  const config = scene.pendingIntroMusicConfig || {};
  scene.pendingIntroMusicKey = null;
  scene.pendingIntroMusicConfig = null;
  introPlayMusic(scene, key, config);
}

export function introStopMusic(scene) {
  if (scene.currentIntroMusic) {
    scene.currentIntroMusic.stop();
    scene.currentIntroMusic.destroy();
    scene.currentIntroMusic = null;
    scene.currentIntroMusicKey = null;
  }
}
