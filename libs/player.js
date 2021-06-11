'use strict'

import { Sprites } from '../engine/src/game.js';
import { shuffle } from "./utils.js";

export default class Player {

    static Colors = {
        Blue: 'Blue',
        Green: 'Green',
        Red: 'Red',
        Yellow: 'Yellow'
    }

    static StartingPos = {
        Blue: { x: 0, y: 0 },
        Green: { x: 6, y: 0 },
        Red: { x: 6, y: 6 },
        Yellow: { x: 0, y: 6 }
    }

    constructor(name, color, pos, cards, client) {
        this.name = name;
        this.color = color;
        this.pos = pos;
        this.cards = cards;
        this.client = client;
        this.diff = { x: 0, y: 0 };
        this.doneCards = [];
    }

    static fromJSON(json) {
        const player = new Player(json.name, json.color, json.pos, json.cards);
        player.doneCards = json.doneCards;
        player.winner = json.winner;
        return player;
    }

    toJSON() {
        return {
            name: this.name,
            color: this.color,
            pos: this.pos,
            doneCards: this.doneCards,
            cards: this.cards,
            diff: this.diff,
            winner: this.winner
        };
    }
    static createPlayer(name, colors, client) {
        colors = shuffle(colors);
        const color = colors.pop();

        const player = new Player(name, color, Player.StartingPos[color], [], client);
        return player;
    }

    get goal() {
        return this.cards[0];
    }
    removeCard() {
        this.doneCards.push(this.cards.splice(0, 1));
    }

    draw(game) {


        const x = game.board.x + 20 + this.pos.x * 100 + 35 + this.diff.x;
        const y = game.board.y + 20 + this.pos.y * 100 + 35 + this.diff.y;


        let dispX = 0, dispY = 0;
        const otherPlayers = game.players.filter(player => player.pos.x == this.pos.x && player.pos.y == this.pos.y && player.color != this.color);
        if (otherPlayers.length > 0) {
            if (this.color == Player.Colors.Blue) [dispX, dispY] = [-10, -10];
            if (this.color == Player.Colors.Red) [dispX, dispY] = [10, -10];
            if (this.color == Player.Colors.Green) [dispX, dispY] = [-10, 10];
            if (this.color == Player.Colors.Yellow) [dispX, dispY] = [10, 10];
        }
        Sprites.main.draw(game.ctx, `Pawn${this.color}`, x + dispX, y + dispY);

    }

}