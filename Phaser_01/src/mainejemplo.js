// Importa la librería Phaser para crear el juego
import Phaser from "phaser";

// Objeto de configuración del juego
var config = {
  // Tipo de renderizado automático (usa WebGL si está disponible, sino usa Canvas)
  type: Phaser.AUTO,
  // Ancho de la ventana del juego en píxeles
  width: 800,
  // Alto de la ventana del juego en píxeles
  height: 600,
  // Configuración de física del juego
  physics: {
    // Motor de física por defecto: arcade (simple y rápido)
    default: "arcade",
    // Configuraciones específicas del motor arcade
    arcade: {
      // Gravedad hacia abajo (y: 300 = caída es bastante rápida)
      gravity: { y: 300 },
      // Desactiva las líneas de depuración de colisiones
      debug: false,
    },
  },
  // Configuración de escenas (fases del juego)
  scene: {
    // Función que se ejecuta para cargar las imágenes
    preload: preload,
    // Función que se ejecuta para crear el mundo del juego
    create: create,
    // Función que se ejecuta constantemente (60 veces por segundo)
    update: update,
  },
};
//usa los elementos de asset como start y el prota para el ejercicio

// hazme el proyecto que te facilite siguiendo la estructura de codigo y conocimientos del apunte.js
// usa los conocimientos que ves en apunte.js y crea el codigo en main.js del pdf que te mando

// Crea una nueva instancia del juego Phaser con la configuración anterior
var game = new Phaser.Game(config);

// ============ VARIABLES GLOBALES ============
// Variable que almacena el objeto del jugador (personaje principal)
var player;
// Variable que almacena el grupo de estrellas que se recojen
var stars;
// Variable que almacena el grupo de bombas que deben evitarse
var bombs;
// Variable que almacena el grupo de plataformas donde caminar
var platforms;
// Variable que almacena los inputs del teclado (teclas de dirección)
var cursors;
// Variable que almacena la puntuación actual del jugador (comienza en 0)
var score = 0;
// Variable booleana que indica si el juego ha terminado (comienza en false)
var gameOver = false;
// Variable que almacena el texto visual del puntaje en pantalla
var scoreText;
// Variable que almacena el texto visual del nivel en pantalla
var textNivel;
// Variable que almacena el número del nivel actual (comienza en nivel 1)
var level = 1;

// ============ FUNCIÓN PRELOAD: Carga los recursos antes de empezar ============
function preload() {
  // Carga la imagen del cielo (fondo del juego)
  this.load.image("sky", "assets/sky.png");
  // Carga la imagen de la plataforma (para crear las superficies donde pisar)
  this.load.image("ground", "assets/platform.png");
  // Carga la imagen de la estrella (objeto que el jugador debe recoger)
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

// ============ FUNCIÓN CREATE: Construye el mundo del juego ============
function create() {
  // Coloca la imagen del cielo en la posición (400, 300) que es el centro de la pantalla
  this.add.image(400, 300, "sky");

  // Crea un grupo estático de plataformas (no se mueven con física)
  platforms = this.physics.add.staticGroup();
  // Crea la plataforma del suelo en la posición (400, 568), la duplica de tamaño y refresca su cuerpo físico
  platforms.create(400, 568, "ground").setScale(2).refreshBody();
  // Crea una plataforma intermedia en la posición (600, 400)
  platforms.create(600, 400, "ground");
  // Crea una plataforma a la izquierda en la posición (50, 250)
  platforms.create(50, 250, "ground");
  // Crea una plataforma a la derecha en la posición (750, 220)
  platforms.create(750, 220, "ground");

  // Crea el jugador (sprite con física) en la posición (100, 450) usando la imagen "dude"
  player = this.physics.add.sprite(100, 450, "dude");
  // Establece el rebote del jugador (0.2 = rebota un poco, 0 = no rebota)
  player.setBounce(0.2);
  // Configura el jugador para que no salga de los límites de la pantalla
  player.setCollideWorldBounds(true);

  // Crea la animación "left" para cuando el jugador va hacia la izquierda
  this.anims.create({
    // Nombre de la animación
    key: "left",
    // Fotogramas 0 a 3 del spritesheet (3 fotogramas diferentes para el movimiento)
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    // Velocidad de reproducción: 10 fotogramas por segundo
    frameRate: 10,
    // -1 significa que se repite infinitamente en bucle
    repeat: -1,
  });

  // Crea la animación "turn" para cuando el jugador se queda quieto (sin movimiento)
  this.anims.create({
    // Nombre de la animación
    key: "turn",
    // Solo usa el fotograma 4 (personaje de frente)
    frames: [{ key: "dude", frame: 4 }],
    // Velocidad de reproducción
    frameRate: 20,
  });

  // Crea la animación "right" para cuando el jugador va hacia la derecha
  this.anims.create({
    // Nombre de la animación
    key: "right",
    // Fotogramas 5 a 8 del spritesheet (3 fotogramas diferentes para el movimiento)
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    // Velocidad de reproducción: 10 fotogramas por segundo
    frameRate: 10,
    // -1 significa que se repite infinitamente en bucle
    repeat: -1,
  });

  // Habilita el control del teclado usando las teclas de dirección (↑ ↓ ← →)
  cursors = this.input.keyboard.createCursorKeys();

  // Crea un grupo de 12 estrellas (repeat: 11 = 1 + 11 = 12 estrellas totales)
  stars = this.physics.add.group({
    // Tipo de objeto que crea
    key: "star",
    // Repite 11 veces (más la primera = 12 estrellas)
    repeat: 11,
    // Posición inicial: x=12, y=0 (arriba), con separación de 70 píxeles horizontalmente
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  // Para cada estrella del grupo, establece un rebote aleatorio en el eje Y
  stars.children.iterate(function (child) {
    // Establece un rebote Y aleatorio entre 0.4 y 0.8 (caen con un bote específico)
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  // Crea un grupo vacío de bombas (se añadirán después cuando se recojan todas las estrellas)
  bombs = this.physics.add.group();

  // Crea el texto del puntaje en la esquina superior izquierda (16, 16)
  scoreText = this.add.text(16, 16, "Score: 0", {
    // Tamaño de la fuente
    fontSize: "32px",
    // Color del texto (negro en código hexadecimal)
    fill: "#000",
  });

  // Crea el texto del nivel en la esquina superior derecha (625, 16)
  textNivel = this.add.text(625, 16, "Nivel: " + level, {
    // Tamaño de la fuente
    fontSize: "32px",
    // Color del texto (negro en código hexadecimal)
    fill: "#000",
  });

  // Configura las colisiones (los objetos rebotan cuando se tocan)
  // El jugador colisiona con las plataformas (rebota en ellas)
  this.physics.add.collider(player, platforms);
  // Las estrellas colisionan con las plataformas (rebotan en ellas)
  this.physics.add.collider(stars, platforms);
  // Las bombas colisionan con las plataformas (rebotan en ellas)
  this.physics.add.collider(bombs, platforms);

  // Configura los traslapes (when one object touches another, ejecuta una función)
  // Cuando el jugador toca una estrella, ejecuta la función collectStar
  this.physics.add.overlap(player, stars, collectStar, null, this);
  // Cuando el jugador toca una bomba, ejecuta la función hitBomb
  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

// ============ FUNCIÓN UPDATE: Se ejecuta 60 veces por segundo (cada frame) ============
function update() {
  // Si el juego ha terminado, no hace nada y sale de la función
  if (gameOver) {
    return;
  }

  // Si se presiona la tecla izquierda (←)
  if (cursors.left.isDown) {
    // Establece la velocidad horizontal del jugador hacia la izquierda (-160)
    player.setVelocityX(-160);
    // Reproduce la animación "left" (el personaje corre hacia la izquierda)
    player.anims.play("left", true);
  }
  // Si se presiona la tecla derecha (→)
  else if (cursors.right.isDown) {
    // Establece la velocidad horizontal del jugador hacia la derecha (160)
    player.setVelocityX(160);
    // Reproduce la animación "right" (el personaje corre hacia la derecha)
    player.anims.play("right", true);
  }
  // Si no se presiona ninguna tecla de dirección horizontal
  else {
    // Detiene el movimiento horizontal del jugador
    player.setVelocityX(0);
    // Reproduce la animación "turn" (el personaje está quieto de frente)
    player.anims.play("turn");
  }

  // Si se presiona la tecla arriba (↑) Y el jugador está tocando el suelo
  if (cursors.up.isDown && player.body.touching.down) {
    // Establece la velocidad vertical del jugador hacia arriba (-330 es un salto fuerte)
    player.setVelocityY(-330);
  }
}

// ============ FUNCIÓN COLLECTSTAR: Se ejecuta cuando el jugador toca una estrella ============
function collectStar(player, star) {
  // Desactiva el cuerpo físico de la estrella y la quita del juego (la borra visualmente)
  star.disableBody(true, true);

  // Suma 10 puntos a la puntuación total
  score += 10;
  // Actualiza el texto del puntaje en pantalla
  scoreText.setText("Score: " + score);

  // Verifica si no hay más estrellas activas (todas han sido recoidas)
  if (stars.countActive(true) === 0) {
    // Para cada estrella del grupo
    stars.children.iterate(function (child) {
      // Reactiva la estrella en su posición original (x) pero en la parte superior (y: 0)
      child.enableBody(true, child.x, 0, true, true);
    });

    // Variable para almacenar la posición X donde spawn la bomba
    // Si el jugador está en la izquierda (x < 400), la bomba aparece a la derecha
    // Si el jugador está en la derecha (x >= 400), la bomba aparece a la izquierda
    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800) // Posición aleatoria entre 400 y 800 (derecha)
        : Phaser.Math.Between(0, 400); // Posición aleatoria entre 0 y 400 (izquierda)

    // Incrementa el nivel en 1
    level += 1;
    // Actualiza el texto del nivel en pantalla
    textNivel.setText("Nivel:" + level);
    // Crea una nueva bomba en la posición (x, 16) que es arriba de la pantalla
    var bomb = bombs.create(x, 16, "bomb");
    // Establece el rebote de la bomba en 1 (rebota perfectamente, sin perder altura)
    bomb.setBounce(1);
    // La bomba no sale de los límites de la pantalla
    bomb.setCollideWorldBounds(true);
    // Establece la velocidad de la bomba: horizontal aleatoria entre -200 y 200, vertical 20 (cae)
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

// ============ FUNCIÓN HITBOMB: Se ejecuta cuando el jugador toca una bomba ============
function hitBomb(player, bomb) {
  // Crea un nuevo texto en el centro de la pantalla (300, 300)
  scoreText = this.add.text(300, 300, " ", {
    // Tamaño de la fuente
    fontSize: "32px",
    // Color rojo oscuro en código hexadecimal
    fill: "#892727",
  });
  // Establece el texto a "FIN DEL JUEGO" para indicar que el jugador perdió
  scoreText.setText("FIN DEL JUEGO");
  // Pausa toda la física del juego (todo para de moverse)
  this.physics.pause();
  // Cambia el color del jugador a rojo (0xff0000) indicando que está "muerto"
  player.setTint(0xff0000);
  // Reproduce la animación "turn" para que el personaje quede de frente
  player.anims.play("turn");
  // Establece la bandera gameOver en true para indicar que el juego terminó
  gameOver = true;
}
