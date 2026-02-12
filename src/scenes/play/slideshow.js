import { ASSETS } from "../../assets/asset-keys";
import { stopCurrentMusic } from "./audio";

export function startPhotoSlideshowPlaceholder(scene) {
  if (scene.slideshowPlaceholderActive) return;

  const player = scene.playerController?.player;
  if (!player || !player.active || !scene.akshay || !scene.akshay.active)
    return;
  if (!scene.slideshowPhotosReady) {
    preloadSlideshowPhotos(scene, () => {
      startPhotoSlideshowPlaceholder(scene);
    });
    return;
  }

  scene.slideshowPlaceholderActive = true;

  // Keep characters running in place while only background drifts.
  player.setFlipX(false);
  player.play("run", true);
  scene.akshay.setFlipX(false);
  scene.akshay.play("akshay-run", true);

  if (scene.backgroundManager) {
    scene.backgroundManager.setCinematicScrollSpeed(1.4);
  }

  createPhotoCarouselBackground(scene);
  startCarouselMessageFlow(scene);
  startFloatingHearts(scene);
}

export function preloadSlideshowPhotos(scene, onComplete) {
  if (scene.slideshowPhotosReady) {
    if (typeof onComplete === "function") onComplete();
    return;
  }

  const missingKeys = scene.slideshowPhotoKeys.filter(
    (key) => !scene.textures.exists(key),
  );
  if (missingKeys.length === 0) {
    scene.slideshowPhotosReady = true;
    if (typeof onComplete === "function") onComplete();
    return;
  }

  if (typeof onComplete === "function") {
    scene.load.once("complete", onComplete);
  }

  if (scene.slideshowPhotoPreloadStarted) return;
  scene.slideshowPhotoPreloadStarted = true;

  missingKeys.forEach((key) => {
    const index = scene.slideshowPhotoKeys.indexOf(key);
    scene.load.image(key, `assets/photos/photo-${index + 1}.jpg`);
  });

  scene.load.once("complete", () => {
    scene.slideshowPhotosReady = true;
    scene.slideshowPhotoPreloadStarted = false;
  });
  scene.load.start();
}

export function fitCarouselImage(scene, image, key) {
  const source = scene.textures.get(key).getSourceImage();
  if (!source || !source.width || !source.height) return;

  const maxWidth = 720;
  const maxHeight = 470;
  const scale = Math.min(maxWidth / source.width, maxHeight / source.height);

  image.setDisplaySize(source.width * scale, source.height * scale);
}

export function createPhotoCarouselBackground(scene) {
  if (scene.carouselPhotos.length > 0) return;

  const laneY = scene.cameras.main.height * 0.28;
  const startX = scene.cameras.main.width + 120;
  const visibleCount = 15;

  scene.carouselPhotoIndex = 0;
  scene.carouselEndTriggered = false;
  scene.carouselLastPhotoReached = false;
  scene.carouselMessagesCompleted = false;
  scene.carouselTransitionQueued = false;
  scene.carouselSpeed = 4;
  let nextLeftEdge = startX;

  for (let i = 0; i < visibleCount; i += 1) {
    const key = getNextCarouselPhotoKey(scene);
    if (!key) break;
    const photo = scene.add
      .image(0, laneY, key)
      .setDepth(-35)
      .setScrollFactor(0)
      .setAlpha(0.9);

    fitCarouselImage(scene, photo, key);
    photo.isLastCarouselPhoto = key === scene.slideshowPhotoKeys.at(-1);
    photo.x = nextLeftEdge + photo.displayWidth * 0.5;
    nextLeftEdge += photo.displayWidth;
    scene.carouselPhotos.push(photo);
  }
}

export function updatePhotoCarousel(scene, delta = 16.67) {
  if (!scene.slideshowPlaceholderActive || scene.carouselPhotos.length === 0)
    return;

  const step = scene.carouselSpeed * (delta / 16.67);
  let rightmostEdge = -Infinity;
  scene.carouselPhotos.forEach((photo) => {
    photo.x -= step;
    const rightEdge = photo.x + photo.displayWidth * 0.5;
    if (rightEdge > rightmostEdge) rightmostEdge = rightEdge;

    if (!scene.carouselEndTriggered && photo.isLastCarouselPhoto) {
      const leftEdge = photo.x - photo.displayWidth * 0.5;
      if (leftEdge <= scene.cameras.main.width) {
        scene.carouselEndTriggered = true;
        scene.carouselLastPhotoReached = true;
        tryFinishCarouselSequence(scene);
      }
    }
  });

  scene.carouselPhotos.forEach((photo) => {
    const offscreenX = -photo.displayWidth * 0.5 - 40;
    if (photo.x < offscreenX) {
      const key = getNextCarouselPhotoKey(scene);
      if (!key) {
        if (photo && photo.active) photo.destroy();
        return;
      }
      photo.setTexture(key);
      fitCarouselImage(scene, photo, key);
      photo.isLastCarouselPhoto = key === scene.slideshowPhotoKeys.at(-1);
      photo.x = rightmostEdge + photo.displayWidth * 0.5;
      rightmostEdge += photo.displayWidth;
    }
  });

  scene.carouselPhotos = scene.carouselPhotos.filter((photo) => photo.active);
}

export function getNextCarouselPhotoKey(scene) {
  if (scene.carouselPhotoIndex >= scene.slideshowPhotoKeys.length) return null;
  const key = scene.slideshowPhotoKeys[scene.carouselPhotoIndex];
  scene.carouselPhotoIndex += 1;
  return key;
}

export function startCarouselMessageFlow(scene) {
  if (scene.carouselMessageText && scene.carouselMessageText.active) {
    scene.carouselMessageText.destroy();
  }

  scene.carouselMessageIndex = 0;
  scene.carouselMessageText = scene.add
    .text(scene.cameras.main.width * 0.5, scene.cameras.main.height * 0.94, "", {
      fontSize: "40px",
      fontFamily: "Georgia",
      color: "#fff5f8",
      align: "center",
      stroke: "#000000",
      strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(210)
    .setAlpha(0);

  showNextCarouselMessage(scene);
}

export function showNextCarouselMessage(scene) {
  if (!scene.carouselMessageText || !scene.carouselMessageText.active) return;

  if (scene.carouselMessageIndex >= scene.carouselMessages.length) {
    scene.carouselMessagesCompleted = true;
    // If messages finish first, accelerate until the last carousel photo appears.
    if (!scene.carouselLastPhotoReached) {
      scene.carouselSpeed = Math.max(scene.carouselSpeed, 14);
    }
    tryFinishCarouselSequence(scene);
    return;
  }

  const message = scene.carouselMessages[scene.carouselMessageIndex];
  const isPenultimate = scene.carouselMessageIndex === scene.carouselMessages.length - 2;
  const isFinal = scene.carouselMessageIndex === scene.carouselMessages.length - 1;

  scene.carouselMessageText.setText(message);
  scene.carouselMessageText.setAlpha(0);
  scene.carouselMessageText.setScale(isPenultimate ? 1.04 : 1);
  scene.carouselMessageText.setColor(isFinal ? "#ffe4ec" : "#fff5f8");

  scene.tweens.add({
    targets: scene.carouselMessageText,
    alpha: 1,
    duration: 800,
    ease: "Sine.Out",
    onComplete: () => {
      const hold = isPenultimate ? 2800 : isFinal ? 3200 : 1700;
      scene.carouselMessageTimer = scene.time.delayedCall(hold, () => {
        scene.tweens.add({
          targets: scene.carouselMessageText,
          alpha: 0,
          duration: 420,
          ease: "Sine.In",
          onComplete: () => {
            scene.carouselMessageIndex += 1;
            showNextCarouselMessage(scene);
          },
        });
      });
    },
  });
}

export function startFloatingHearts(scene) {
  if (scene.floatingHearts) return;

  const { width, height } = scene.cameras.main;
  scene.floatingHearts = scene.add.particles(0, 0, ASSETS.ITEMS.HEART, {
    x: { min: 80, max: width - 80 },
    y: height + 10,
    frequency: 220,
    lifespan: 8000,
    quantity: 1,
    speedY: { min: -80, max: -45 },
    speedX: { min: -18, max: 18 },
    scale: { start: 0.22, end: 0.08 },
    alpha: { start: 0.62, end: 0 },
  });

  scene.floatingHearts.setDepth(205).setScrollFactor(0);
}

export function tryFinishCarouselSequence(scene) {
  if (scene.carouselTransitionQueued) return;
  if (!scene.carouselLastPhotoReached || !scene.carouselMessagesCompleted) return;

  scene.carouselTransitionQueued = true;
  startCarouselFadeOutToEndScene(scene);
}

export function startCarouselFadeOutToEndScene(scene) {
  if (scene.carouselFadeOutStarted) return;
  scene.carouselFadeOutStarted = true;

  scene.cameras.main.once("camerafadeoutcomplete", () => {
    finishPhotoSlideshow(scene);
  });
  scene.cameras.main.fadeOut(1800, 0, 0, 0);
}

export function finishPhotoSlideshow(scene) {
  scene.slideshowPlaceholderActive = false;
  stopCurrentMusic(scene);

  if (scene.backgroundManager) {
    scene.backgroundManager.setCinematicScrollSpeed(0);
  }

  scene.carouselPhotos.forEach((photo) => {
    if (photo && photo.active) photo.destroy();
  });
  scene.carouselPhotos = [];

  if (scene.carouselMessageTimer) {
    scene.carouselMessageTimer.remove(false);
    scene.carouselMessageTimer = null;
  }
  if (scene.carouselMessageText && scene.carouselMessageText.active) {
    scene.carouselMessageText.destroy();
    scene.carouselMessageText = null;
  }
  if (scene.floatingHearts) {
    scene.floatingHearts.destroy();
    scene.floatingHearts = null;
  }

  scene.scene.start("EndScene", { stars: scene.starsCollected });
}
