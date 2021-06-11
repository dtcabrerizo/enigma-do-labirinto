'use strict'
import { Sounds, Fonts, Sprites } from '../engine/src/game.js'
import Piece from "./piece.js";
import Player from "./player.js";
import { shuffle } from "./utils.js";


export default class Board {
    constructor(x, y) {
        this.animations = null;
        this.mousePosition = null;
        this.x = x;
        this.y = y;
        this.state = 'PUSH';
    }


    init(pieces) {
        if (pieces) {
            this.pieces = pieces.map(p => new Piece(p.type, p.symbol, p.rotation, p.fixed, p.pos, p.startColor, p.turn));
            return;
        } else {

            this.pieces = [
                // Starts
                new Piece(Piece.Types.L, null, 1, true, { x: 0, y: 0 }, Player.Colors.Blue),
                new Piece(Piece.Types.L, null, 2, true, { x: 6, y: 0 }, Player.Colors.Green),
                new Piece(Piece.Types.L, null, 3, true, { x: 6, y: 6 }, Player.Colors.Red),
                new Piece(Piece.Types.L, null, 0, true, { x: 0, y: 6 }, Player.Colors.Yellow),

                // Fixed
                new Piece(Piece.Types.T, 23, 2, true, { x: 2, y: 0 }), // Helmet
                new Piece(Piece.Types.T, 22, 2, true, { x: 4, y: 0 }), // Candlestick

                new Piece(Piece.Types.T, 15, 1, true, { x: 0, y: 2 }), // Sword
                new Piece(Piece.Types.T, 17, 1, true, { x: 2, y: 2 }), // Emerald
                new Piece(Piece.Types.T, 16, 2, true, { x: 4, y: 2 }), // Treasure
                new Piece(Piece.Types.T, 18, 3, true, { x: 6, y: 2 }), // Ring

                new Piece(Piece.Types.T, 1, 1, true, { x: 0, y: 4 }),  // Skull
                new Piece(Piece.Types.T, 8, 0, true, { x: 2, y: 4 }),  // Keys
                new Piece(Piece.Types.T, 6, 3, true, { x: 4, y: 4 }),  // Crown
                new Piece(Piece.Types.T, 12, 3, true, { x: 6, y: 4 }), // Map

                new Piece(Piece.Types.T, 2, 0, true, { x: 2, y: 6 }),  // Bag
                new Piece(Piece.Types.T, 3, 0, true, { x: 4, y: 6 })   // Book


            ];

            const loosePieces = [
                // With Symbols
                new Piece(Piece.Types.T, 24), // Owl
                new Piece(Piece.Types.T, 11), // Genie
                new Piece(Piece.Types.T, 13), // Dragon
                new Piece(Piece.Types.T, 14), // Fairy
                new Piece(Piece.Types.T, 7),  // Gnome
                new Piece(Piece.Types.T, 4),  // Globe
                new Piece(Piece.Types.T, 5),  // Ghost
                new Piece(Piece.Types.L, 21), // Beetle
                new Piece(Piece.Types.L, 20), // Spider
                new Piece(Piece.Types.L, 19), // Lizard
                new Piece(Piece.Types.L, 10), // Butterfly
                new Piece(Piece.Types.L, 9),  // Rat
            ];

            // Clear
            Array(11).fill(null).forEach(() => loosePieces.push(new Piece(Piece.Types.I)));
            Array(11).fill(null).forEach(() => loosePieces.push(new Piece(Piece.Types.L)));

            this.pieces.push(...shuffle(loosePieces));


            let px = 1, py = 0;

            this.pieces.filter(p => !p.fixed).forEach((piece, id) => {

                if (py >= 7) {
                    piece.pos = null;
                    piece.turn = true;
                } else {
                    piece.pos = { x: px, y: py };
                }
                px += py % 2 == 0 ? 2 : 1;

                if (px >= 7) {
                    py += 1;
                    px = py % 2 == 0 ? 1 : 0;
                }

            });
        }
    }

    update(game, delta) {
        if (this.animations) {
            this.animations.forEach((animation, animationId) => {
                if (!animation) return;
                if (animation.type == 'ROW' || animation.type == 'COL') {
                    animation.pieces.forEach(anim => {

                        const { x: fromX, y: fromY } = this.posToCoords(anim.from);
                        const { x: toX, y: toY } = this.posToCoords(anim.to);

                        const newX = animation.type == 'ROW' ? (toX - fromX) * delta : 0;
                        const newY = animation.type == 'COL' ? (toY - fromY) * delta : 0;

                        anim.piece.diff.x += newX;
                        anim.piece.diff.y += newY;
                    });
                    if (animation.frame == 0) Sounds.pushed.play();
                    // Se a animação passou de um seggundo ela finalizou
                    if (animation.frame > animation.time) {
                        // Chama callback de término da animação
                        if (animation.then) animation.then.call(this);
                        // Destroi objeto de aimação, liberando o tabuleiro
                        this.animations[animationId] = null;
                    }
                } else if (animation.type == 'PLAYER') {

                    const from = animation.path[animation.step - 1];
                    const to = animation.path[animation.step];

                    const player = game.players.find(p => p.name == animation.player.name);

                    // console.log('Animating Player', player.name, from, to, animation.step, animation.frame, player.diff)
                    if (from && to) {
                        const [difX, difY] = [to.x - from.x, to.y - from.y];

                        player.diff.x += difX * 100 * delta / animation.time;
                        player.diff.y += difY * 100 * delta / animation.time;
                    }
                    // if (animation.frame == 0) Sounds.walked.play();
                    if (animation.frame > animation.time) {
                        Sounds.walked.play();
                        if (++animation.step >= animation.path.length) {
                            // Chama callback de término da animação
                            if (animation.then) animation.then.call(this);
                            // Destroi objeto de aimação, liberando o tabuleiro
                            this.animations[animationId] = null;
                        } else {
                            animation.frame = 0;
                        }
                    }
                } else if (animation.type == 'CARD') {

                    if (animation.frame == 0) {
                        this.card = { y: game.canvas.height, symbol: animation.symbol };
                        Sounds.collected.play();
                    } else if (animation.frame <= animation.time / 2) {
                        this.card.y -= 586 * delta / animation.time * 2;
                    }

                    if (animation.frame >= animation.time) {
                        this.card = null;
                        // Chama callback de término da animação
                        if (animation.then) animation.then.call(this);
                        // Destroi objeto de aimação, liberando o tabuleiro
                        this.animations[animationId] = null;
                    }
                }

                if (animation) animation.frame += delta;
            });

            if (!this.animations.some(anim => anim)) this.animations = null;
        }
        if (this.mousePosition && this.turnPiece && !this.animations && this.state == 'PUSH') {
            const coords = this.coordsToPos(this.mousePosition);

            const validPos = [
                { x: -1, y: 1 }, { x: -1, y: 3 }, { x: -1, y: 5 },
                { x: 7, y: 1 }, { x: 7, y: 3 }, { x: 7, y: 5 },
                { x: 1, y: -1 }, { x: 3, y: -1 }, { x: 5, y: -1 },
                { x: 1, y: 7 }, { x: 3, y: 7 }, { x: 5, y: 7 }
            ];

          
            if (validPos.some(c => c.x == coords.x && c.y == coords.y)) {
                this.turnPiece.pos = coords;
            } else {
                this.turnPiece.pos = null;
            }
        }
    }

    draw(game, delta) {

        game.ctx.save();

        game.ctx.fillStyle = 'rgb(120,40,0)';
        game.ctx.fillRect(this.x, this.y, 100 * 7 + 40, 100 * 7 + 40);


        for (let n = 1; n < 7; n += 2) {
             

            game.ctx.fillStyle = this.lastMove?.type == 'COL' && this.lastMove?.n == n && this.lastMove?.dir == -1 ? 'rgb(255,0,0)' : 'rgb(255,255,0)';
            game.ctx.beginPath();
            game.ctx.moveTo(this.x + 20 + 50 + 100 * n - 10, this.y + 5);
            game.ctx.lineTo(this.x + 20 + 50 + 100 * n + 10, this.y + 5);
            game.ctx.lineTo(this.x + 20 + 50 + 100 * n, this.y + 20);
            game.ctx.fill();

            game.ctx.fillStyle = this.lastMove?.type == 'COL' && this.lastMove?.n == n && this.lastMove?.dir == 1 ? 'rgb(255,0,0)' : 'rgb(255,255,0)';
            game.ctx.beginPath();
            game.ctx.moveTo(this.x + 20 + 50 + 100 * n - 10, this.y + 40 + 100 * 7 - 5);
            game.ctx.lineTo(this.x + 20 + 50 + 100 * n + 10, this.y + 40 + 100 * 7 - 5);
            game.ctx.lineTo(this.x + 20 + 50 + 100 * n, this.y + 40 + 100 * 7 - 20);
            game.ctx.fill();

            game.ctx.fillStyle = this.lastMove?.type == 'ROW' && this.lastMove?.n == n && this.lastMove?.dir == -1 ? 'rgb(255,0,0)' : 'rgb(255,255,0)';
            game.ctx.beginPath();
            game.ctx.moveTo(this.x + 5, this.y + 20 + 50 + 100 * n - 10);
            game.ctx.lineTo(this.x + 5, this.y + 20 + 50 + 100 * n + 10);
            game.ctx.lineTo(this.x + 20, this.y + 20 + 50 + 100 * n);
            game.ctx.fill();

            game.ctx.fillStyle = this.lastMove?.type == 'ROW' && this.lastMove?.n == n && this.lastMove?.dir == 1 ? 'rgb(255,0,0)' : 'rgb(255,255,0)';
            game.ctx.beginPath();
            game.ctx.moveTo(this.x + 40 + 100 * 7 - 5, this.y + 20 + 50 + 100 * n - 10);
            game.ctx.lineTo(this.x + 40 + 100 * 7 - 5, this.y + 20 + 50 + 100 * n + 10);
            game.ctx.lineTo(this.x + 40 + 100 * 7 - 20, this.y + 20 + 50 + 100 * n);
            game.ctx.fill();
        }

        Fonts.P2.config(game.ctx, { color: 'rgb(255,255,255)', size: 15, align: 'center', baseline: 'top' });

        Fonts.P2.draw(game.ctx, 'Peça Atual', 920 + 75 + (100 / 2), 90);

        game.board.turnPiece.draw(game, 920 + 75, 120);

        this.pieces.forEach(piece => piece.draw(game));


        if (this.card) {
            Sprites.main.draw(game.ctx, 'CardBack', this.x + (740 - 156) / 2, this.card.y);
            Sprites.main.draw(game.ctx, `Symbol-${this.card.symbol}`, this.x + (740 - 80) / 2, this.card.y + 104 - 40);
        }



        game.ctx.restore();
    }

    posToCoords(pos) {
        return {
            x: pos.x * 100 + this.x + 20,
            y: pos.y * 100 + this.y + 20
        }
    }
    coordsToPos(coords) {
        return {
            x: Math.floor((coords.x - 20) / 100),
            y: Math.floor((coords.y - 20) / 100)
        }
    }

    pieceFromPos(pos) {

        return this.pieces.find(p => p.pos && p.pos.x == pos.x && p.pos.y == pos.y);
    }

    set turnPiece(piece) {
        this.turnPiece.pos = piece.pos;
        this.turnPiece.rotation = piece.rotation;
    }

    get turnPiece() {
        return this.pieces.find(p => p.turn);
    }

    movePath(player) {
        const destinationCoords = this.coordsToPos(this.mousePosition);
        const destination = this.pieceFromPos(destinationCoords)
        const origin = this.pieceFromPos(player.pos);
        if (this.state != 'MOVE' || this.animations) {
            console.error(new Error(`Wrong move or state State: ${this.state}, animations: ${JSON.stringify(this.animations)}`));
            return;
        }


        if (!origin || !destination) {
            console.error(new Error(`Wrong Origin/Destination : ${JSON.stringify(origin)}, ${JSON.stringify(destination)}`));
            return;
        }

        // Sem movimento
        if (origin == destination) return [];

        const visited = [], path = [origin];
        let found = false, iter = 0;

        while (!found && iter < 1000) {
            const currentPiece = path[path.length - 1];
            if (currentPiece) {
                const connections = Object.values(currentPiece.connections).reduce((acc, pos) => {
                    const dest = this.pieceFromPos(pos);
                    if (currentPiece.canConnect(dest) && path.indexOf(dest) < 0 && visited.indexOf(dest) < 0) acc.push(dest);
                    return acc;
                }, []);

                if (currentPiece == destination) {
                    break;
                } else if (connections.length == 0) {
                    visited.push(currentPiece);
                    path.pop();
                } else {
                    path.push(connections[0]);
                }
            }
            iter++;
        }

        if (path.length == 0 || iter == 1000) {
            console.error(new Error(`Wrong Move : ${JSON.stringify(origin)},  ${JSON.stringify(destination)}`));
            return;
        }
        return path;
    }

    move(player, path) {
        const destinationCoords = this.coordsToPos(this.mousePosition);
        const destination = this.pieceFromPos(destinationCoords)
        const origin = this.pieceFromPos(player.pos);

        console.log('moving player', player, origin, destination);
        return new Promise(
            (resolve, reject) => {

                console.log(path)
                const finalPath = path.map(p => p.pos);

                this.animations = [{
                    type: 'PLAYER',
                    player,
                    path: finalPath,
                    frame: 0,
                    step: 1,
                    time: 0.5,
                    then: () => {
                        player.pos = destination.pos;
                        player.diff = { x: 0, y: 0 };
                        this.state = 'PUSH';
                        console.log('ANIM MOVE PLAYER DONE');

                        // Verifica se o player chegou no ojbetivo
                        if (player.cards.length == 0 && destination.startColor == player.color) player.winner = true;
                        
                        if (player.goal != null && destination.symbol == player.goal) {
                            player.removeCard();
                            this.animations.push({
                                type: 'CARD',
                                symbol: destination.symbol,
                                frame: 0,
                                time: 2,
                                then: () => {
                                    console.log('ANIM CARD DONE');
                                    resolve();
                                }
                            });
                        } else {
                            resolve();
                        }

                    }
                }];
            }
        );
    }

    rotatePiece() {
        if (this.state != 'PUSH') return;
        this.turnPiece?.rotate();
    }

    get pushConfig() {
        if (!this.turnPiece || !this.turnPiece.pos) return null;
        
        if (this.turnPiece.pos.x == -1 || this.turnPiece.pos.x == 7) {
            return { type: 'ROW', dir: this.turnPiece.pos.x == -1 ? 1 : -1, n: this.turnPiece.pos.y };
        } else if (this.turnPiece.pos.y == -1 || this.turnPiece.pos.y == 7) {
            return { type: 'COL', dir: this.turnPiece.pos.y == - 1 ? 1 : -1, n: this.turnPiece.pos.x };
        } else {
            return null;
        }
    }
    push(players) {
        console.log('pushing blocks');
        return new Promise(
            (resolve, reject) => {
                if (this.state != 'PUSH' || this.animations) reject(new Error(`Wrong push or state State: ${this.state}, animations: ${JSON.stringify(this.animations)}`));

                const pieceAdded = this.turnPiece;

                if (pieceAdded.pos == null) reject(new Error(`Piece has no position:  ${JSON.stringify(pieceAdded)}`));

                const { type, dir, n} = this.pushConfig;

                const pieces = this.pieces.filter(p => type == 'ROW' ? p.pos.y == n : p.pos.x == n);

                if (pieces.some(p => p.fixed)) reject(new Error(`Pushing fixed piece ${JSON.stringify(pieces)}`));

                this.animations = [
                    {
                        type,
                        n,
                        pieces: pieces.map(p => ({
                            piece: p,
                            from: p.pos,
                            to: { x: p.pos.x + (type == 'ROW' ? dir : 0), y: p.pos.y + (type == 'COL' ? dir : 0) }
                        })),
                        frame: 0,
                        time: 1,
                        then: () => {
                            this.animations[0].pieces.forEach(anim => {
                                // Reseta a peça da vez
                                pieceAdded.turn = false;
                                // Salva posição final da peça
                                anim.piece.pos = anim.to;
                                // Reseta diferencial de animação
                                anim.piece.diff = { x: 0, y: 0 };
                                // Se a peça saiu do tabuleiro
                                if (anim.piece.pos.x > 6 || anim.piece.pos.x < 0 || anim.piece.pos.y > 6 || anim.piece.pos.y < 0) {
                                    // TODO: reposicionar player se exisitir
                                    anim.piece.pos = null;
                                    anim.piece.turn = true;
                                }
                                // Salva último movimento do tabuleiro
                                this.lastMove = { type, n, dir };
                                // Atualiza status do tabuleiro
                                this.state = 'MOVE';
                                console.log('ANIM PUSH DONE');
                                resolve();
                            });
                        }
                    }
                ];

                const playersToMove = players.filter(player => {
                    return type == 'ROW' ? player.pos.y == n : player.pos.x == n;
                });
                if (playersToMove.length > 0) {
                    this.animations.push(
                        ...playersToMove.map(
                            player => {
                                const dest = { x: player.pos.x + (type == 'ROW' ? dir : 0), y: player.pos.y + (type == 'COL' ? dir : 0) }
                                const finalPath = [
                                    player.pos, dest
                                ];
                                return {
                                    type: 'PLAYER',
                                    player,
                                    path: finalPath,
                                    frame: 0,
                                    step: 1,
                                    time: 1,
                                    then: () => {
                                        if (dest.x < 0) dest.x = 6;
                                        if (dest.x > 6) dest.x = 0;
                                        if (dest.y < 0) dest.y = 6;
                                        if (dest.y > 6) dest.y = 0;
                                        player.pos = dest;
                                        player.diff = { x: 0, y: 0 };
                                        console.log('ANIM PUSH PLAYER DONE');

                                    }
                                }
                            }
                        )
                    )
                }


            }
        );
    }
}
