import Board from "../libs/board.js";
import { Fonts, Rect } from "../engine/src/game.js";
import Player from "../libs/player.js";
import { shuffle, sendTextToClipboard } from '../libs/utils.js';
import SceneGame from "./game.js";

const SceneWait = {
    id: 'SceneWait',
    init(game) {
        this.colors = Object.values(Player.Colors);

        if (game.isServer) {
            this.players = [];
            this.addPlayer(game.playerName, game.network);
        }
        game.network.handleData = this.handleData.bind(this, game);

        this.startButton = new Rect((game.canvas.width - 200) / 2, 700, 200, 50);
    },

    addPlayer(name, client) {
        const player = Player.createPlayer(name, this.colors, client);
        this.players.push(player);
    },

    startGame() {
        // Distribui as cartas
        const cards = shuffle(Array(24).fill(null).map((_, i) => i + 1));
        this.players.forEach(player => {
            player.cards = cards.splice(0, 24 / this.players.length);
        });

        game.players = this.players;
        game.board = new Board(90, 90);
        game.board.init();

        // Envia início de jogo
        game.network.broadcast({ op: 'STARTGAME', content: { players: game.players, board: game.board } });
        game.scene = SceneGame;
    },
    destroy(game) {
        delete game.network.handleData;
    },
    draw(game, delta) {

        game.ctx.fillStyle = 'rgb(51,51,51)';
        game.ctx.fillRect(0, 0, game.ctx.canvas.width, game.ctx.canvas.height);

        Fonts.P2.config(game.ctx, { color: 'rgb(255,255,255)', align: 'center', baseline: 'middle' });

        Fonts.P2.draw(game.ctx, 'Sala de Espera', game.canvas.width / 2, 100, { size: 40 });

        if (game.isServer) {
            Fonts.P2.draw(game.ctx, 'Envie o código abaixo para os jogadores entrarem na sala', game.canvas.width / 2, 200, { size: 20 });
            Fonts.P2.draw(game.ctx, '(Clique para copiar)', game.canvas.width / 2, 250, { size: 15 });
            Fonts.P2.draw(game.ctx, 'Quando os jogadores estiverem prontos, clique em "Inciar"', game.canvas.width / 2, 300, { size: 20 });
            Fonts.P2.draw(game.ctx, game.network.id || 'Obtendo ID da sala...', game.canvas.width / 2, 400, { color: 'rgb(255,215,0)', size: 15 });
        } else {
            Fonts.P2.config(game.ctx, { color: 'rgb(255,215,0)', size: 15 });

            if (game.network.conn == null) {
                Fonts.P2.draw(game.ctx, 'Conectando na sala...', game.canvas.width / 2, 400);
            } else {
                Fonts.P2.draw(game.ctx, 'Aguardando início do jogo...', game.canvas.width / 2, 400);
            }

        }

        if (this.players) {
            this.players.forEach((player, id) => {
                Fonts.P2.draw(game.ctx, player.name, game.canvas.width / 2, 500 + id * 20, { color: player.color, size: 15 });
            })
        }

        if (game.isServer) {
            this.startButton.draw(game.ctx, 'rgb(0,200,0)', 'rgb(128,128,128)', 2);
            Fonts.P2.draw(game.ctx, 'Iniciar', this.startButton.x + this.startButton.w / 2, this.startButton.y + this.startButton.h / 2, { color: 'rbg(0,0,0)', size: 15 });

        }

    },
    update(game, delta) {
        if (game.isServer) {

        } else {
            // Se ainda não enviou seus dados (ainda não recebeu a lista de jogadores)
            if (!this.players) {
                game.network.send({ op: 'HELLO', content: { name: game.playerName } });
            }
        }

    },
    mouseUp: function (game, e) {
        if (!game.isServer || !game.network || !game.network.id) return;

        const p = { x: e.offsetX, y: e.offsetY };

        if (this.startButton.containsPoint(p)) {
            this.startGame();
        } else {
            if (sendTextToClipboard(game.network.id)) {
                return alert('Id copied to clipboard');
            } else {
                return alert('Erro copiando id');
            }
        }
    },

    handleData(game, data, client) {
        // Identificação de novo jogador para o servidor
        if (data.op == 'HELLO' && game.isServer) {
            const playerName = data.content.name;
            const playerExists = this.players.find(p => p.name == playerName)
            if (!playerExists) {
                this.addPlayer(playerName, client);
            }
            // Envia lista de jogadores
            game.network.broadcast({ op: 'PLAYERSLIST', content: this.players.map(p => p.toJSON()) });
        }

        // Atualização da lista de jogadores
        if (data.op == 'PLAYERSLIST' && !game.isServer) {
            this.players = data.content;
        }

        // Início de jogo
        if (data.op == 'STARTGAME' && !game.isServer) {
            game.players = data.content.players.map(p => new Player(p.name, p.color, p.pos, p.cards));
            game.board = new Board(90, 90);
            game.board.init(data.content.board.pieces);
            game.scene = SceneGame;
        }

    }
}

export default SceneWait;