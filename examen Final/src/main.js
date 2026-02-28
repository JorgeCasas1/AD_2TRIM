import Phaser from "phaser";

const configuracion = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "black",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: precargar,
    create: crear,
    update: actualizar,
  },
};

const juego = new Phaser.Game(configuracion);

let personaje;
let controles;
let muros;
let estrellas;
let meta;
let contadorEstrellas = 0;
const totalEstrellas = 5;

function precargar() {
  // Carga mis imagenes
  this.load.image("cielo", "assets/sky.png");
  this.load.image("plataforma", "assets/platform.png");
  this.load.image("estrella", "assets/star.png");
  this.load.image("bomba", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function crear() {
  // Laberinto
  muros = this.physics.add.staticGroup();

  // Creomuros en posiciones aleatorias de color rojo
  for (let i = 0; i < 12; i++) {
    let x = Phaser.Math.Between(100, 700);
    let y = Phaser.Math.Between(100, 500);
    let muro = muros.create(x, y, "plataforma");
    muro.setScale(0.2).refreshBody();
    muro.setTint(0xff0000); // Forzamos el color rojo
  }

  // El Personaje
  personaje = this.physics.add.sprite(100, 100, "dude");
  personaje.setTint(0xff0000); // El personaje debe ser rojo
  personaje.setCollideWorldBounds(true);
  personaje.direccion = "DERECHA"; // Movimiento constante

  // Animaciones del personaje
  this.anims.create({
    key: "caminar",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });
  personaje.play("caminar");

  // Objetos a recolectar
  estrellas = this.physics.add.group();
  for (let i = 0; i < totalEstrellas; i++) {
    let estrella = estrellas.create(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550),
      "estrella",
    );
    estrella.setTint(0xff0000); // Color rojo

    // La bola de fuego debe estar girando
    this.tweens.add({
      targets: estrella,
      angle: 360,
      duration: 2000,
      repeat: -1,
    });
  }

  // La Salida. Uso la bomba para la meta
  meta = this.physics.add.sprite(750, 550, "bomba");
  meta.setTint(0xff0000); // Color rojo

  // Controles
  controles = this.input.keyboard.createCursorKeys();

  // Si toca una pared roja, vuelve al inicio y reinicia tamaño
  this.physics.add.collider(
    personaje,
    muros,
    () => {
      personaje.setPosition(100, 100);
      personaje.setScale(1);
      personaje.direccion = "DERECHA";
      // Reiniciamos el nivel para que sea jugable tras morir
      contadorEstrellas = 0;
      estrellas.children.iterate((child) => {
        child.enableBody(true, child.x, child.y, true, true);
      });
    },
    null,
    this,
  );

  // Recogido estrellas y aumento de tamaño
  this.physics.add.overlap(
    personaje,
    estrellas,
    (jugador, item) => {
      item.disableBody(true, true);
      contadorEstrellas++;
      jugador.setScale(jugador.scale + 0.2); // Crece al recoger objetos
    },
    null,
    this,
  );

  // Llegar a la meta
  this.physics.add.overlap(
    personaje,
    meta,
    () => {
      if (contadorEstrellas === totalEstrellas) {
        alert("Has completado el Laberinto Rojo");
        this.scene.restart();
        contadorEstrellas = 0;
      }
    },
    null,
    this,
  );
}

function actualizar() {
  const velocidadFija = 160; // Velocidad constante de 160

  // Cambiar dirección sin detenerse
  if (controles.left.isDown && personaje.direccion !== "DERECHA") {
    personaje.direccion = "IZQUIERDA";
    personaje.flipX = true;
  } else if (controles.right.isDown && personaje.direccion !== "IZQUIERDA") {
    personaje.direccion = "DERECHA";
    personaje.flipX = false;
  } else if (controles.up.isDown && personaje.direccion !== "ABAJO") {
    personaje.direccion = "ARRIBA";
  } else if (controles.down.isDown && personaje.direccion !== "ARRIBA") {
    personaje.direccion = "ABAJO";
  }

  // Aplicar movimiento según la dirección actual
  if (personaje.direccion === "IZQUIERDA")
    personaje.setVelocity(-velocidadFija, 0);
  else if (personaje.direccion === "DERECHA")
    personaje.setVelocity(velocidadFija, 0);
  else if (personaje.direccion === "ARRIBA")
    personaje.setVelocity(0, -velocidadFija);
  else if (personaje.direccion === "ABAJO")
    personaje.setVelocity(0, velocidadFija);
}
