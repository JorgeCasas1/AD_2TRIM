import Phaser from "phaser";

var config = {
  type: Phaser.AUTO,

  width: 800,

  height: 600,

  physics: {
    default: "arcade",

    arcade: {
      gravity: { y: 300 },

      debug: false,
    },
  },

  scene: {
    preload: preload,

    create: create,

    update: update,
  },
};

var game = new Phaser.Game(config);

// (personaje principal)
var player;
// Variable objeto
var stars;
// Plataformas
var platforms;

function preload() {
  this.load.image("sky", "assets/sky.png");

  this.load.image("ground", "assets/platform.png");

  this.load.image("star", "assets/star.png");
  // Carga laimagen de la bomba (objeto peligroso que termina el juego)
  this.load.image("bomb", "assets/bomb.png");
  // Carga el spritesheet del personaje con fotogramas de 32x48 píxeles (para animaciones)
  this.load.spritesheet("dude", "assets/dude.png", {
    // Ancho de cada fotograma del personaje
    frameWidth: 32,
    // Alto de cada fotograma del personaje
    frameHeight: 48,
  });
}

function create() {
  this.add.image(400, 300, "sky");
}
