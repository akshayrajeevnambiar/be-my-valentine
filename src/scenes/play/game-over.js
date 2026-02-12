import { ASSETS } from "../../assets/asset-keys";
import { playGameOverBgMusic, stopCurrentMusic, stopGameOverBgMusic } from "./audio";

export function showGameOver(scene) {
  if (scene.gameOverActive) return;
  scene.gameOverActive = true;

  console.log("Game Over!");
  stopCurrentMusic(scene);
  playGameOverBgMusic(scene);

  if (scene.physics?.world) {
    scene.physics.world.pause();
  }

  scene.hideControlInstructionsUI();

  const cam = scene.cameras.main;
  const targetY = cam.height * 0.5;

  scene.gameOverCard = scene.add
    .image(cam.width * 0.5, -220, ASSETS.ITEMS.GAME_OVER_CARD)
    .setScrollFactor(0)
    .setDepth(1000)
    .setScale(2)
    .setAlpha(0.98);

  scene.tweens.add({
    targets: scene.gameOverCard,
    y: targetY,
    duration: 1500,
    ease: "Cubic.Out",
  });

  scene.gameOverRestartHandler = () => {
    scene.input.keyboard.off("keydown-R", scene.gameOverRestartHandler);
    stopGameOverBgMusic(scene);
    scene.scene.restart();
  };
  scene.input.keyboard.on("keydown-R", scene.gameOverRestartHandler);
}
