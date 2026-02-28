import Phaser from "phaser";

// ESCENA DE MENÚ Y SELECCIÓN DE MODO DE JUEGO
// Permite elegir entre jugar contra CPU (aventura) o contra otro jugador (local)
class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image("mario", "assets/mario.png");
    this.load.image("portada", "assets/portada.png");
    this.load.image("luigi", "assets/luigi.png");
    this.load.image("boo", "assets/boo.png");
    this.load.image("koopa", "assets/koopa.png");
    this.load.image("bowser", "assets/bowser.png");
    this.load.image("fondoClasico", "assets/fondoClasico.png");
    this.load.image("fondoFantasma", "assets/fondoFantasma.png");
    this.load.image("fondoBowser", "assets/fondoBowser.png");

    // AUDIOS
    this.load.audio("musica_clasico", "assets/musica_clasico.mp3");
    this.load.audio("musica_boo", "assets/musica_boo.mp3");
    this.load.audio("musica_bowser", "assets/musica_bowser.mp3");
  }

  create() {
    const { width, height } = this.scale;
    this.add
      .image(width / 2, height / 2, "portada")
      .setDisplaySize(width, height)
      .setAlpha(0.6);

    const btnAventura = this.add
      .text(width / 2, height * 0.45, "MODO AVENTURA", {
        fontSize: "32px",
        fill: "white",
        backgroundColor: "red",
        padding: 15,
      })
      .setOrigin(0.5)
      .setInteractive();

    const btnMulti = this.add
      .text(width / 2, height * 0.6, "MULTIJUGADOR", {
        fontSize: "32px",
        fill: "white",
        backgroundColor: "blue",
        padding: 15,
      })
      .setOrigin(0.5)
      .setInteractive();

    btnAventura.on("pointerdown", () => {
      this.scene.start("GameScene", { mode: "cpu", level: 0, p1: "mario" });
    });

    btnMulti.on("pointerdown", () => this.abrirSelectorMulti(width, height));
  }

  // FUNCIÓN DE SELECCIÓN EN MULTIJUGADOR
  // Permite elegir personajes y mapa para el modo multijugador
  // P1 selecciona con clic en la izquierda
  // P2 selecciona con clic en el centro
  // Mapa selecciona con clic a la derecha
  abrirSelectorMulti(w, h) {
    this.children.removeAll();
    const personajes = ["mario", "luigi", "koopa", "boo", "bowser"];
    const mapas = ["fondoClasico", "fondoFantasma", "fondoBowser"];

    let p1S = "mario",
      p2S = "luigi",
      mapaS = "fondoClasico";

    const nombresMapas = {
      fondoClasico: "MAPA: REINO CHAMPIÑÓN",
      fondoFantasma: "MAPA: MANSIÓN BOO",
      fondoBowser: "MAPA: CASTILLO BOWSER",
    };

    this.add
      .text(w / 2, 50, "CONFIGURACIÓN", { fontSize: "30px", fill: "white" })
      .setOrigin(0.5);

    const textosP1 = [];
    const textosP2 = [];
    const textosMapas = [];

    personajes.forEach((p, i) => {
      let t1 = this.add
        .text(w * 0.2, 150 + i * 45, "P1: " + p.toUpperCase(), {
          fontSize: "22px",
          fill: p === p1S ? "yellow" : "white",
        })
        .setInteractive();
      textosP1.push(t1);
      t1.on("pointerdown", () => {
        p1S = p;
        textosP1.forEach((t) => t.setStyle({ fill: "white" }));
        t1.setStyle({ fill: "yellow" });
      });

      let t2 = this.add
        .text(w * 0.5, 150 + i * 45, "P2: " + p.toUpperCase(), {
          fontSize: "22px",
          fill: p === p2S ? "cyan" : "white",
        })
        .setInteractive();
      textosP2.push(t2);
      t2.on("pointerdown", () => {
        p2S = p;
        textosP2.forEach((t) => t.setStyle({ fill: "white" }));
        t2.setStyle({ fill: "cyan" });
      });
    });

    mapas.forEach((m, i) => {
      let tm = this.add
        .text(w * 0.8, 150 + i * 45, nombresMapas[m], {
          fontSize: "20px",
          fill: m === mapaS ? "magenta" : "white",
        })
        .setInteractive();
      textosMapas.push(tm);
      tm.on("pointerdown", () => {
        mapaS = m;
        textosMapas.forEach((t) => t.setStyle({ fill: "white" }));
        tm.setStyle({ fill: "magenta" });
      });
    });

    const btnStart = this.add
      .text(w / 2, h - 80, "¡LUCHAR!", {
        fontSize: "40px",
        fill: "white",
        backgroundColor: "green",
        padding: 20,
      })
      .setOrigin(0.5)
      .setInteractive();

    btnStart.on("pointerdown", () => {
      this.scene.start("GameScene", {
        mode: "local",
        p1: p1S,
        p2: p2S,
        mapa: mapaS,
      });
    });
  }
}

// ESCENA DE JUEGO
class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  // INICIALIZACIÓN: Recibe los parámetros del juego del menú
  init(data) {
    this.mode = data.mode; // 'cpu' o 'local'
    this.currentLevel = data.level || 0; // Nivel actual en aventura (0, 1, 2)
    this.p1Key = data.p1; // Personaje del Jugador 1
    this.p2Key = data.p2; // Personaje del Jugador 2
    this.mapaKey = data.mapa; // Mapa seleccionado

    // NIVELES DE AVENTURA: Cada nivel tiene un enemigo y fondo diferente
    // Nivel 0: Koopa en Reino Champiñón
    // Nivel 1: Boo en Mansión Fantasma
    // Nivel 2: Bowser en Castillo Bowser (final)
    this.aventura = [
      { enemigo: "koopa", fondo: "fondoClasico" },
      { enemigo: "boo", fondo: "fondoFantasma" },
      { enemigo: "bowser", fondo: "fondoBowser" },
    ];
  }

  preload() {
    this.load.image("bola", "assets/bola.png");
    this.load.image("toad", "assets/toad.png");
    this.load.image("estrella", "assets/star.png");
  }

  create() {
    const { width, height } = this.scale;
    // PUNTUACIONES INICIALES: Se comienza con 0-0
    this.scoreP1 = 0;
    this.scoreP2 = 0;
    this.gameOver = false; // Control de si el juego ha terminado

    // SELECCIÓN DE MAPA Y CONFIGURACIÓN
    // En aventura se selecciona automáticamente, en local elige el jugador
    let configMap =
      this.mode === "cpu"
        ? this.aventura[this.currentLevel]
        : { fondo: this.mapaKey };

    // Añade el fondo de pantalla
    this.add
      .image(width / 2, height / 2, configMap.fondo)
      .setDisplaySize(width, height);

    // MÚSICA AMBIENTAL: Se reproduce continuamente durante el juego
    // Cada mapa tiene su propia música
    const mapaAudios = {
      fondoClasico: "musica_clasico",
      fondoFantasma: "musica_boo",
      fondoBowser: "musica_bowser",
    };
    this.musicaAmbiental = this.sound.add(mapaAudios[configMap.fondo], {
      loop: true, // Repetir infinitamente
      volume: 0.5, // Volumen moderado
    });
    this.musicaAmbiental.play();

    let rivalKey = this.mode === "cpu" ? configMap.enemigo : this.p2Key;

    // CREACIÓN DE LOS JUGADORES
    // Jugador 1: Aparece en la izquierda (x=100)
    // Jugador 2: Aparece en la derecha (x=width-100)
    // Se utilizan personajes seleccionados en el menú
    this.player1 = this.physics.add
      .sprite(100, height / 2, this.p1Key)
      .setImmovable(true) // No es afectado por gravedad
      .setCollideWorldBounds(true); // Colisiona con los límites del mundo
    this.player2 = this.physics.add
      .sprite(width - 100, height / 2, rivalKey)
      .setImmovable(true)
      .setCollideWorldBounds(true)
      .setFlipX(true); // Se voltea horizontalmente para mirar al jugador 1

    const ajustarEscalaPersonaje = (sprite, key) => {
      // ESCALADO DE PERSONAJES: Bowser es más grande, Boo es más pequeño
      // Se ajusta para que el juego sea visualmente equilibrado
      if (key === "bowser") sprite.setScale(0.9);
      else if (key === "boo") sprite.setScale(0.5);
      else if (key === "mario") sprite.setScale(0.7);
      else if (key === "luigi") sprite.setScale(0.6);
      else sprite.setScale(0.8);
    };

    ajustarEscalaPersonaje(this.player1, this.p1Key);
    ajustarEscalaPersonaje(this.player2, rivalKey);

    // CREACIÓN DE LA BOLA DE FUEGO
    // Se crea en el centro de la pantalla con física de rebote
    this.ball = this.physics.add
      .sprite(width / 2, height / 2, "bola")
      .setScale(0.12);
    // setBounce(1,1) hace que rebote perfectamente (sin perder energía)
    this.ball.setBounce(1, 1);
    this.ball.setCollideWorldBounds(true);
    // Permite rebote en piso y techo, pero no en paredes izquierda/derecha
    this.physics.world.setBoundsCollision(false, false, true, true);

    this.resetBall();

    // UI DE JUGADORES
    this.add.image(60, 40, "toad").setScale(0.3);
    this.add
      .image(width - 60, 40, "toad")
      .setScale(0.3)
      .setFlipX(true);

    this.starsP1 = this.add.group();
    this.starsP2 = this.add.group();

    // COLISIONES CON EFECTO PONG
    // Cuando la bola golpea el paddle, utiliza la función handlePaddleCollision
    // para calcular el rebote adecuado
    this.physics.add.collider(
      this.ball,
      this.player1,
      this.handlePaddleCollision,
      null,
      this,
    );
    this.physics.add.collider(
      this.ball,
      this.player2,
      this.handlePaddleCollision,
      null,
      this,
    );

    this.keys = this.input.keyboard.addKeys({ W: "W", S: "S", R: "R" });
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  // FUNCIÓN DE COLISIÓN: Controla como rebota la bola al golpearla con el paddle
  // Calcula el ángulo de rebote según donde golpee la bala en el paddle (efecto Pong)
  handlePaddleCollision(ball, paddle) {
    // Calculamos el punto de impacto para la dirección real
    // Esto permite que la bola rebote en diferentes ángulos según donde golpee
    let relativeIntersectY = (ball.y - paddle.y) / (paddle.displayHeight / 2);
    let bounceAngle = relativeIntersectY * 550;
    ball.setVelocityY(bounceAngle);

    // Incremento de velocidad después de cada golpe para que el juego sea más difícil
    let speedUp = ball.body.velocity.x > 0 ? 40 : -40;
    ball.setVelocityX(ball.body.velocity.x + speedUp);
  }

  update() {
    if (this.gameOver) {
      if (this.keys.R.isDown) {
        if (this.musicaAmbiental) this.musicaAmbiental.stop();
        this.scene.start("MenuScene");
      }
      return;
    }

    // La bola gira constantemente para simular una bola de fuego
    this.ball.angle += 12;

    // CONTROLES DEL JUGADOR 1: Teclas W (arriba) y S (abajo)
    // W y S permiten controlar el movimiento vertical del jugador 1
    if (this.keys.W.isDown) this.player1.setVelocityY(-650);
    else if (this.keys.S.isDown) this.player1.setVelocityY(650);
    else this.player1.setVelocityY(0);

    // CONTROLES DEL JUGADOR 2
    if (this.mode === "local") {
      // Modo local: Jugador humano usa flechas arriba y abajo
      if (this.cursors.up.isDown) this.player2.setVelocityY(-650);
      else if (this.cursors.down.isDown) this.player2.setVelocityY(650);
      else this.player2.setVelocityY(0);
    } else {
      // Modo CPU: Controla automáticamente el movimiento del enemigo
      // La IA se vuelve más difícil conforme avanzan los niveles
      let speed = 320 + this.currentLevel * 65;
      let diff = this.ball.y - this.player2.y;
      // Solo se mueve si la bola está cerca (parte derecha de la pantalla)
      if (this.ball.x > this.scale.width * 0.35) {
        this.player2.setVelocityY(Phaser.Math.Clamp(diff * 10, -speed, speed));
      } else {
        this.player2.setVelocityY(0);
      }
    }

    // DETECCIÓN DE GOLES
    // Si la bola sale del lado izquierdo (x < 0): gol de jugador 2
    // Si la bola sale del lado derecho (x > ancho): gol de jugador 1
    if (this.ball.x < 0) this.anotarPunto("p2");
    else if (this.ball.x > this.scale.width) this.anotarPunto("p1");
  }

  // FUNCIÓN DE ANOTACIÓN: Se ejecuta cuando alguien mete un punto
  // Incrementa la puntuación y añade una estrella (vida/punto) en la pantalla
  anotarPunto(ganador) {
    if (ganador === "p1") {
      this.scoreP1++;
      // Añade una estrella en la parte superior izquierda por cada punto
      this.starsP1
        .create(40 + this.scoreP1 * 35, 80, "estrella")
        .setScale(0.18);
    } else {
      this.scoreP2++;
      // Añade una estrella en la parte superior derecha por cada punto
      this.starsP2
        .create(this.scale.width - (40 + this.scoreP2 * 35), 80, "estrella")
        .setScale(0.18);
    }
    // El juego termina cuando alguien llega a 5 puntos (victoria)
    if (this.scoreP1 === 5 || this.scoreP2 === 5) this.finalizar();
    else this.resetBall(); // Reinicia la bola en el centro
  }

  // FUNCIÓN DE REINICIO: Posiciona la bola en el centro y la lanza después de 800ms
  // Esto da tiempo al jugador para prepararse
  resetBall() {
    this.ball
      .setPosition(this.scale.width / 2, this.scale.height / 2)
      .setVelocity(0, 0); // Detiene la bola temporalmente
    // Después de esperar 800ms, lanza la bola hacia un lado aleatorio
    this.time.delayedCall(800, () => {
      // Velocidad X aleatoria: 600px/s hacia izquierda o derecha
      const vx = Math.random() > 0.5 ? 600 : -600;
      // Velocidad Y aleatoria: entre -250 y 250px/s para movimiento diagonal
      const vy = Phaser.Math.Between(-250, 250);
      if (this.ball.active) this.ball.setVelocity(vx, vy);
    });
  }

  // FUNCIÓN DE FINALIZACIÓN: Se ejecuta cuando alguien gana (5 puntos)
  // Detiene la música, muestra el resultado y gestiona el siguiente nivel
  finalizar() {
    this.gameOver = true; // Detiene el update del juego
    this.ball.destroy(); // Elimina la bola de la pantalla
    if (this.musicaAmbiental) this.musicaAmbiental.stop(); // Detiene la música

    let victoria = this.scoreP1 === 5; // Verdadero si el jugador 1 gana
    let msg = victoria ? "¡VICTORIA!" : "¡DERROTA!";
    // Muestra el mensaje de victoria o derrota en grande
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, msg, {
        fontSize: "70px",
        fill: "white",
        stroke: "black",
        strokeThickness: 10,
      })
      .setOrigin(0.5);

    // Si ganas en MODO AVENTURA y no es el último nivel, continúa al siguiente
    if (
      victoria &&
      this.mode === "cpu" &&
      this.currentLevel < this.aventura.length - 1
    ) {
      this.time.delayedCall(2000, () =>
        this.scene.start("GameScene", {
          mode: "cpu",
          level: this.currentLevel + 1, // Sube de nivel
          p1: this.p1Key,
        }),
      );
    } else {
      // Si pierdes o completas la aventura, muestra opción para volver al menú
      this.add
        .text(
          this.scale.width / 2,
          this.scale.height / 2 + 100,
          "R PARA VOLVER",
          {
            fontSize: "25px",
            fill: "white",
          },
        )
        .setOrigin(0.5);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: { default: "arcade" },
  scene: [MenuScene, GameScene],
};
new Phaser.Game(config);
