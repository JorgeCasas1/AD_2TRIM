import Phaser from "phaser";

// ESCENA DE MENÚ Y SELECCIÓN
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

  init(data) {
    this.mode = data.mode;
    this.currentLevel = data.level || 0;
    this.p1Key = data.p1;
    this.p2Key = data.p2;
    this.mapaKey = data.mapa;

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
    this.scoreP1 = 0;
    this.scoreP2 = 0;
    this.gameOver = false;

    let configMap =
      this.mode === "cpu"
        ? this.aventura[this.currentLevel]
        : { fondo: this.mapaKey };

    this.add
      .image(width / 2, height / 2, configMap.fondo)
      .setDisplaySize(width, height);

    const mapaAudios = {
      fondoClasico: "musica_clasico",
      fondoFantasma: "musica_boo",
      fondoBowser: "musica_bowser",
    };
    this.musicaAmbiental = this.sound.add(mapaAudios[configMap.fondo], {
      loop: true,
      volume: 0.5,
    });
    this.musicaAmbiental.play();

    let rivalKey = this.mode === "cpu" ? configMap.enemigo : this.p2Key;

    this.player1 = this.physics.add
      .sprite(100, height / 2, this.p1Key)
      .setImmovable(true)
      .setCollideWorldBounds(true);
    this.player2 = this.physics.add
      .sprite(width - 100, height / 2, rivalKey)
      .setImmovable(true)
      .setCollideWorldBounds(true)
      .setFlipX(true);

    const ajustarEscalaPersonaje = (sprite, key) => {
      if (key === "bowser") sprite.setScale(0.9);
      else if (key === "boo") sprite.setScale(0.5);
      else if (key === "mario") sprite.setScale(0.7);
      else if (key === "luigi") sprite.setScale(0.6);
      else sprite.setScale(0.8);
    };

    ajustarEscalaPersonaje(this.player1, this.p1Key);
    ajustarEscalaPersonaje(this.player2, rivalKey);

    this.ball = this.physics.add
      .sprite(width / 2, height / 2, "bola")
      .setScale(0.12);
    this.ball.setBounce(1, 1);
    this.ball.setCollideWorldBounds(true);
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

  handlePaddleCollision(ball, paddle) {
    // Calculamos el punto de impacto para la dirección real
    let relativeIntersectY = (ball.y - paddle.y) / (paddle.displayHeight / 2);
    let bounceAngle = relativeIntersectY * 550;
    ball.setVelocityY(bounceAngle);

    // Incremento de velocidad para más dificultad
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

    // Tu instrucción: La bola de fuego debe estar girando
    this.ball.angle += 12;

    if (this.keys.W.isDown) this.player1.setVelocityY(-650);
    else if (this.keys.S.isDown) this.player1.setVelocityY(650);
    else this.player1.setVelocityY(0);

    if (this.mode === "local") {
      if (this.cursors.up.isDown) this.player2.setVelocityY(-650);
      else if (this.cursors.down.isDown) this.player2.setVelocityY(650);
      else this.player2.setVelocityY(0);
    } else {
      let speed = 320 + this.currentLevel * 65;
      let diff = this.ball.y - this.player2.y;
      if (this.ball.x > this.scale.width * 0.35) {
        this.player2.setVelocityY(Phaser.Math.Clamp(diff * 10, -speed, speed));
      } else {
        this.player2.setVelocityY(0);
      }
    }

    if (this.ball.x < 0) this.anotarPunto("p2");
    else if (this.ball.x > this.scale.width) this.anotarPunto("p1");
  }

  anotarPunto(ganador) {
    if (ganador === "p1") {
      this.scoreP1++;
      this.starsP1
        .create(40 + this.scoreP1 * 35, 80, "estrella")
        .setScale(0.18);
    } else {
      this.scoreP2++;
      this.starsP2
        .create(this.scale.width - (40 + this.scoreP2 * 35), 80, "estrella")
        .setScale(0.18);
    }
    if (this.scoreP1 === 5 || this.scoreP2 === 5) this.finalizar();
    else this.resetBall();
  }

  resetBall() {
    this.ball
      .setPosition(this.scale.width / 2, this.scale.height / 2)
      .setVelocity(0, 0);
    this.time.delayedCall(800, () => {
      const vx = Math.random() > 0.5 ? 600 : -600;
      const vy = Phaser.Math.Between(-250, 250);
      if (this.ball.active) this.ball.setVelocity(vx, vy);
    });
  }

  finalizar() {
    this.gameOver = true;
    this.ball.destroy();
    if (this.musicaAmbiental) this.musicaAmbiental.stop();

    let victoria = this.scoreP1 === 5;
    let msg = victoria ? "¡VICTORIA!" : "¡DERROTA!";
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, msg, {
        fontSize: "70px",
        fill: "white",
        stroke: "black",
        strokeThickness: 10,
      })
      .setOrigin(0.5);

    if (
      victoria &&
      this.mode === "cpu" &&
      this.currentLevel < this.aventura.length - 1
    ) {
      this.time.delayedCall(2000, () =>
        this.scene.start("GameScene", {
          mode: "cpu",
          level: this.currentLevel + 1,
          p1: this.p1Key,
        }),
      );
    } else {
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
