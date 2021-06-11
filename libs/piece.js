'use strict'

import { Sprites } from "../engine/src/game.js";


export default class Piece {
    static Types = {
        I: 'I',
        T: 'T',
        L: 'L'
    }

    constructor(type, symbol = null, rotation = null, fixed = false, pos, startColor = null, turn = false) {
        this.type = type;
        this.pos = pos;
        this.maxRotations = this.type == Piece.Types.I ? 1 : 3;
        this.rotation = rotation == null ? Math.floor(Math.random() * this.maxRotations) : rotation;
        this.symbol = symbol;
        this.startColor = startColor;
        this.fixed = fixed;
        this.turn = turn;
        this.diff = { x: 0, y: 0 };
    }

    get connections() {
        const ret = [];
        if (this.type == Piece.Types.I) {
            if (this.rotation == 0) ret.push(...['W', 'E']);
            if (this.rotation == 1) ret.push(...['N', 'S']);
        } else if (this.type == Piece.Types.L) {
            if (this.rotation == 0) ret.push(...['N', 'E']);
            if (this.rotation == 1) ret.push(...['S', 'E']);
            if (this.rotation == 2) ret.push(...['S', 'W']);
            if (this.rotation == 3) ret.push(...['N', 'W']);
        } else if (this.type == Piece.Types.T) {
            if (this.rotation == 0) ret.push(...['N', 'E', 'W']);
            if (this.rotation == 1) ret.push(...['N', 'E', 'S']);
            if (this.rotation == 2) ret.push(...['S', 'E', 'W']);
            if (this.rotation == 3) ret.push(...['S', 'W', 'N']);
        }

        return ret.reduce( (acc,r) => {
            if (r == 'W' && this.pos.x > 0) acc.W = { x: this.pos.x - 1, y: this.pos.y};
            if (r == 'E' && this.pos.x < 6) acc.E = { x: this.pos.x + 1, y: this.pos.y};
            if (r == 'N' && this.pos.y > 0) acc.N = { x: this.pos.x, y: this.pos.y - 1};
            if (r == 'S' && this.pos.y < 6) acc.S = { x: this.pos.x, y: this.pos.y + 1};
            return acc;
        }, {});
    }

    canConnect(piece) {
        const difX = this.pos.x - piece.pos.x;
        const difY = this.pos.y - piece.pos.y;

        return Object.keys(this.connections).some( dir => {
            if (dir == 'N') return piece.connections.S != undefined && difY == 1;
            if (dir == 'S') return piece.connections.N != undefined && difY == -1;
            if (dir == 'W') return piece.connections.E != undefined && difX == 1;
            if (dir == 'E') return piece.connections.W != undefined && difX == -1;
            return false;
        })
    }

    draw(game, x, y) {
        if (!this.pos && !x) return;
        const pieceSprite = `Piece${this.type}`;
        const rotation = Math.PI * this.rotation / 2;

        if (!x) {
            const coords = game.board.posToCoords(this.pos);
            x = coords.x + this.diff.x;
            y = coords.y + this.diff.y;
        }
        Sprites.main.draw(game.ctx, pieceSprite, x, y, rotation);


        if (this.symbol) {
            const symbolSprite = `Symbol-${this.symbol}`;
            Sprites.main.draw(game.ctx, symbolSprite, x + 27, y + 27, this.fixed ? 0 : this.rotation * Math.PI, [0.6, 0.6]);
        }

        if (this.startColor) {
            const colorSprite = `Start${this.startColor}`;
            Sprites.main.draw(game.ctx, colorSprite, x + 20, y + 20);
        }
    }

    rotate() {

        if (++this.rotation > this.maxRotations) this.rotation = 0;
    }
}