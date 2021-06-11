import SceneMenu from './menu.js';
import { Sprites, Sounds, Images, Fonts, Scripts } from '../engine/src/game.js'

const SceneLoading = {
  id: 'SceneLoading',
  init(game) {

    // Configuração dos sprites das peças, peões, inícios dos peões e fundo da carta
    const sprites = {
      PieceT: { x: 540, y: 200, w: 100, h: 100 },
      PieceL: { x: 540, y: 100, w: 100, h: 100 },
      PieceI: { x: 540, y: 0, w: 100, h: 100 },

      PawnGreen: { x: 480, y: 240, w: 30, h: 30 },
      PawnRed: { x: 510, y: 240, w: 30, h: 30 },
      PawnBlue: { x: 480, y: 270, w: 30, h: 30 },
      PawnYellow: { x: 510, y: 270, w: 30, h: 30 },

      StartGreen: { x: 480, y: 0, w: 60, h: 60 },
      StartBlue: { x: 480, y: 60, w: 60, h: 60 },
      StartRed: { x: 480, y: 120, w: 60, h: 60 },
      StartYellow: { x: 480, y: 180, w: 60, h: 60 },

      CardBack: { x: 640, y: 0, w: 156, h: 208 },
    };

    // Configuração dos sprites dos símbolos
    Array(4).fill(null).forEach((_, y) => {
      Array(6).fill(null).forEach((_, x) => {
        const n = x + y * 6;
        sprites[`Symbol-${n + 1}`] = { x: x * 80, y: y * 80, w: 80, h: 80 };
      });
    });


    // Controla o progresso da carga dos recursos
    this.progress = 0;


    // List of resources to load, each resource is a promise
    const promises = [
      Images.load('back', './back.jpg'),
      Sprites.load('main', './sprite.png', sprites),
      Sounds.load('walked', './sounds/walked.wav'),
      Sounds.load('collected', './sounds/collected.wav'),
      Sounds.load('pushed', './sounds/pushed.wav'),
      Fonts.load('P2', 'Press Start 2P', 'https://fonts.googleapis.com/css?family=Press+Start+2P'),
      Scripts.load('PeerJS', 'https://unpkg.com/peerjs@1.0.0/dist/peerjs.min.js')
    ];

    // Incrementa progresso para exibição na barra de progresso
    const inc = () => this.progress += 100 / promises.length;
    promises.forEach(p => p.then(inc));

    // Move para a próxima cena quando todas as promessas finalizarem
    Promise.all(promises).then(() => this.done(game));

  },
  done(game) {
    game.scene = SceneMenu;
  },
  draw(game, delta) {
    game.ctx.fillStyle = 'rgb(128,0,0)';
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

    // Se ainda está carregando exibe barra de progresso
    if (this.progress < 100) {
           
      Fonts.P2?.draw(game.ctx, 'Loading...', game.canvas.width / 2, game.canvas.height / 2 - 50, { color: 'rgb(255,255,255)', size: 40, align: 'center', baseline: 'middle' });
      
      game.ctx.fillStyle = 'rgb(255,255,255)';
      game.ctx.strokeStyle = 'rgb(255,255,255)';
      game.ctx.lineWidth = 4;

      game.ctx.strokeRect(20, game.canvas.height / 2 + 50, game.canvas.width - 40, 20)
      game.ctx.fillRect(20, game.canvas.height / 2 + 50, (game.canvas.width - 40) * this.progress / 100, 20)
    } 
  }
};

export default SceneLoading;

