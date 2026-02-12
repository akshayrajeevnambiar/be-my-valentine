export function hasAudio(scene, key) {
  return Boolean(scene?.sound && scene?.cache?.audio?.exists(key));
}

export function playAudio(scene, key, config = {}) {
  if (!hasAudio(scene, key)) return null;
  return scene.sound.play(key, config);
}

export function createAudio(scene, key, config = {}) {
  if (!hasAudio(scene, key)) return null;
  return scene.sound.add(key, config);
}
