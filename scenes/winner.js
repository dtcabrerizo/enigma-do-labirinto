'use strict'
import { Sprites, Fonts } from "../engine/src/game.js";


const SceneWinner = {
    id: 'SceneWinner',
    init(game) {
        this.winner = game.players.find(p => p.winner);
        this.others = game.players.filter(p => !p.winner).sort((a, b) => b.doneCards.length - a.doneCards.length);
    },
    draw(game, delta) {
        game.ctx.fillStyle = 'rgb(51,51,51)';
        game.ctx.fillRect(0, 0, game.ctx.canvas.width, game.ctx.canvas.height);

        game.ctx.fillStyle = this.winner.color;
        game.ctx.fillRect(0, 0, 50, game.ctx.canvas.height);
        game.ctx.fillRect(game.ctx.canvas.width - 50, 0, game.ctx.canvas.width, game.ctx.canvas.height);


        Fonts.P2.config(game.ctx, { color: 'rgb(255,255,255)', align: 'center', baseline: 'top' });

        Fonts.P2.draw(game.ctx, 'VENCEDOR', game.canvas.width / 2, 25, { size: 50 });
        Fonts.P2.draw(game.ctx, this.winner.name, game.canvas.width / 2, 100, { size: 30 });

        const cards = Array.from(this.winner.doneCards);

        const lines = [
            cards.splice(0, 4),
            cards.splice(0, 4),
            cards.splice(0, 4),
        ];

        lines.forEach((line, id) => {

            const y = id * 208 + 20 + 150;
            let x = (game.canvas.width - 156 * line.length) / 2 - 200;

            line.forEach(card => {
                Sprites.main.draw(game.ctx, 'CardBack', x, y);
                Sprites.main.draw(game.ctx, `Symbol-${card}`, x + 38, y + 104 - 40);
                x += 156;
            });
        });

        this.others.forEach((player, id) => {
            game.ctx.fillStyle = player.color;
            game.ctx.strokeStyle = player.color;
            game.ctx.fillRect(750, 170 + id * 220, 50, 50);
            game.ctx.strokeRect(750, 170 + id * 220, 350, 50);

            const name = Array.from(player.name || `Player${id + 1}`).reduce((acc, char) => {
                if (game.ctx.measureText(acc + char).width < 270) acc = acc + char;
                return acc;
            });

            Fonts.P2.draw(game.ctx, name, 810, 182 + id * 220 + 12.5, { color: 'rgb(255,255,255)', size: 20, align: 'left', baseline: 'middle' });
            let x = 750;
            const y = 170 + id * 220 + 50 + 20;
            player.doneCards.forEach(card => {
                Sprites.main.draw(game.ctx, 'CardBack', x, y, 0, [0.5, 0.5]);
                Sprites.main.draw(game.ctx, `Symbol-${card}`, x + 38 / 2, y + (104 - 40) / 2, 0, [0.5, 0.5]);
                x += 25;
            });

        })



    }
}

export default SceneWinner;