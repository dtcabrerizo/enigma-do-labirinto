
import { Fonts, Images, Rect, Client, Server } from '../engine/src/game.js';
import SceneWait from './wait.js';

const SceneMenu = {
  id: 'SceneMenu',
  init(game) {
    const x = (game.canvas.width - 900) / 2;
    this.newGameButton = new Rect(x, 590 + 75, 440, 100);
    this.connectButton = new Rect(x + 440 + 20, 590 + 75, 440, 100);
    this.buttonOver = null;
  },
  update(game, delta) {

  },
  draw(game, delta) {
    game.ctx.fillStyle = 'rgb(51,51,51)';
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

    Fonts.P2.config(game.ctx, { color: 'rgb(51,51,51)', size: 40, align: 'center', baseline: 'middle' });

    Images.back.draw(game.ctx, (game.canvas.width - 900) / 2, 50);

    const drawButton = (bt, text) => {
      bt.draw(game.ctx, 'rgb(220,220,220)', this.buttonOver == bt ? 'rgb(255,255,255)' : 'rgb(128,128,128)', 6);
      const [bx, by] = bt.center;
      Fonts.P2.draw(game.ctx, text, bx, by);
    };

    drawButton(this.newGameButton, 'Novo Jogo');
    drawButton(this.connectButton, 'Conectar');

  },
  mouseUp(game, e) {
    if (this.buttonOver == this.newGameButton) {
      const name = prompt('Digite seu nome:');
      if (!name) return;
      if (name.length > 15) return alert('Nome muito longo, escolha um nome com menos 15 caracteres');
      game.isServer = true;
      game.network = new Server();
      game.playerName = name;
      game.scene = SceneWait;
    } else if (this.buttonOver == this.connectButton) {
      if (!game.playerName) {
        const name = prompt('Digite seu nome:');
        if (!name) return;
        if (name.length > 15) return alert('Nome muito longo, escolha um nome com menos 15 caracteres');
        game.playerName = name;
      }
      const gameId = prompt('Digite o ID da sala');
      if (!gameId) return;
      game.isServer = false;
      game.network = new Client(gameId);
      game.network.connect();
      game.scene = SceneWait;
    }
  },
  mouseMove(game, e) {
    this.buttonOver = null;
    const p = { x: e.offsetX, y: e.offsetY };
    if (this.newGameButton.containsPoint(p)) {
      this.buttonOver = this.newGameButton;
    }
    if (this.connectButton.containsPoint(p)) {
      this.buttonOver = this.connectButton;
    }
  }
};

export default SceneMenu;
