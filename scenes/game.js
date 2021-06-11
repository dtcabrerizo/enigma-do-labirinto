import { Sprites, Sounds, Images, Fonts, Scripts } from '../engine/src/game.js'

import Player from "../libs/player.js";
import SceneWinner from "./winner.js";


const SceneGame = {
  id: 'SceneGame',
  init(game) {
    game.network.handleData = this.handleData.bind(this, game);

    this.playing = false;

    this.playerTurn = {};

    // Determina de quem é a vez
    if (game.isServer) {
      game.send = game.network.broadcast.bind(game.network);
      this.nextPlayer(game, Math.floor(Math.random() * game.players.length));
    } else {
      game.send = game.network.send.bind(game.network);
    }

    this.playing = this.playerTurn.name == this.currentPlayer.name;

  },

  get currentPlayer() {
    return game.players.find(player => player.name == game.playerName);
  },
  nextPlayer(game, id = null) {
    game.players.forEach(p => p.ready = false);
    let index = id == null ? game.players.indexOf(this.playerTurn) : id;
    if (++index >= game.players.length) index = 0;
    this.playerTurn = game.players[index];
    this.playing = this.playerTurn.name == this.currentPlayer.name;
    setTimeout(() => game.send({ op: 'PLAYERTURN', content: { players: game.players, playerTurn: this.playerTurn } }), 1000);
  },
  draw(game, delta) {

    game.ctx.fillStyle = 'rgb(51,51,51)';
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);


    Fonts.P2.config(game.ctx, { color: 'rgb(255,255,255)', size: 15, align: 'center', baseline: 'top' });
    Fonts.P2.draw(game.ctx, 'Objetivo', 920 + 47 + (156 / 2), 240);

    Sprites.main.draw(game.ctx, 'CardBack', 920 + 47, 260);
    Sprites.main.draw(game.ctx, `Symbol-${this.currentPlayer.goal}`, 920 + 47 + 38, 260 + 104 - 40);

    if (this.playing) {
      const text = game.board.state == 'PUSH' ? ['Insira a peça', 'no jogo'] : ['Movimente', 'seu peão'];
      Fonts.P2.draw(game.ctx, text[0], 920 + 47 + (156 / 2), 500, 145, { color: 'rgb(255,255,255)' });
      Fonts.P2.draw(game.ctx, text[1], 920 + 47 + (156 / 2), 520, 145, { color: 'rgb(255,255,255)' });

      game.ctx.fillStyle = this.currentPlayer.color;
      game.ctx.fillRect(0, 0, 10, game.canvas.height);
      game.ctx.fillRect(0, game.canvas.height - 10, game.canvas.width, 10);
      game.ctx.fillRect(0, 0, game.canvas.width, 10);
      game.ctx.fillRect(game.canvas.width - 10, 0, 10, game.canvas.height);

    }

    game.board.draw(game, delta);
    game.players.forEach((player, id) => {
      player.draw(game);

      game.ctx.fillStyle = player.color;
      game.ctx.strokeStyle = player.color;
      game.ctx.fillRect(920, 600 + id * 30, 25, 25);
      game.ctx.strokeRect(920, 600 + id * 30, 250, 25);

      Fonts.P2.config(game.ctx, { color: 'rgb(255,255,255)', size: 12, align: 'left', baseline: 'middle' });
      const name = Array.from(player.name || `Player${id + 1}`).reduce((acc, char) => {
        if (game.ctx.measureText(acc + char).width < 200) acc = acc + char;
        return acc;
      });
      Fonts.P2.draw(game.ctx, name, 950, 600 + id * 30 + 12.5);
      Fonts.P2.draw(game.ctx, player.cards.length, 1145, 600 + id * 30 + 12.5);
    });

  },
  update(game, delta) {
    game.board.update(game, delta)
  },

  mouseUp(game, e) {
    if (!this.playing) return;
    if (e.button == 0) {
      let data;
      if (game.board.state == 'MOVE') {
        data = { op: 'MOVE', content: { playerName: this.currentPlayer.name, mousePosition: game.board.mousePosition } };
        this.playing = false;

      } else if (game.board.state == 'PUSH') {
        data = { op: 'PUSH', content: { playerName: this.currentPlayer.name, mousePosition: game.board.mousePosition, piece: game.board.turnPiece } };
      }

      if (data) {
        if (game.isServer) {
          this.handleData(game, data);
        } else {
          game.send(data);
        }

      }

    }
    if (e.button == 2) game.board.rotatePiece();
  },
  mouseMove(game, e) {
    if (this.playing) game.board.mousePosition = { x: e.offsetX - game.board.x, y: e.offsetY - game.board.y }
  },
  handleData(game, data) {
    // Se recebeu uma lista de players, atualiza lista
    if (data?.content?.players && !game.isServer) {
      game.players = data.content.players.map(Player.fromJSON);
    }

    if (data.op == 'PLAYERTURN' && !game.isServer) {
      this.playing = this.currentPlayer.name == data.content.playerTurn.name;
      this.playerTurn = Player.fromJSON(data.content.playerTurn);
    }

    if (data.op == 'MOVE') {
      const player = game.players.find(p => p.name == data.content.playerName);
      game.board.mousePosition = data.content.mousePosition;

      const path = game.board.movePath(player);

      if (path == null) {
        // Cancela movimento
        if (player.name == this.currentPlayer.name) {
          this.playing = true;
        } else if (game.isServer) {
          player.client.send(JSON.stringify({ op: 'MOVE', player }));
        }

        return;
      };

      if (game.isServer) {
        game.send(data);
        this.currentPlayer.ready = true;
        game.board.move(player, path).then(() => {
          if (player.winner) {
            game.send({ op: 'WINNER', content: { players: game.players.map(p => p.toJSON()) } });
            this.playing = false;
            game.scene = SceneWinner;
          }
        });
      } else {
        game.board.move(player, path).then(() => {
          game.send({ op: 'READY', content: { player: this.currentPlayer } });
        });
      }
    }

    if (data.op == 'PUSH') {
      game.board.mousePosition = data.content.mousePosition;
      game.board.turnPiece = data.content.piece;
      console.log('PUSHX', game.board.lastMove, game.board.pushConfig);
      // Verifica validade do movimento
      if (game.board.lastMove && game.board.pushConfig) {
        if (game.board.lastMove.type == game.board.pushConfig.type &&
          game.board.lastMove.n == game.board.pushConfig.n &&
          game.board.lastMove.dir == game.board.pushConfig.dir * -1) {
          if (game.isServer) return;
          const player = game.players.find(p => p.name == data.content.playerName);
          return player.client.send(JSON.stringify({ op: 'PUSH', content: { board: game.board } }));
        }
      }

      if (game.isServer) game.send(data);

      game.board.push(game.players);

    }

    if (data.op == 'MOVE' && !game.isServer) {
      game.board.state = 'MOVE'
      this.playing = true;
    }

    if (data.op == 'PUSH' && !game.isServer) {
      game.board.state = 'PUSH'
      if (data.content?.board?.pieces) game.board.init(data.content.board.pieces);
      this.playing = true;
    }
    if (data.op == 'WINNER' && !game.isServer) {
      this.playing = false;
      game.scene = SceneWinner;
    }
    if (data.op == 'READY' && game.isServer) {
      const player = game.players.find(p => p.name == data.content.player.name);
      if (player) {
        player.ready = true;
      }
      if (game.players.filter(p => p.ready).length == game.players.length) this.nextPlayer(game);
    }



  }


}

export default SceneGame;