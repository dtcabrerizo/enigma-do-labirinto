'use strict'

import SceneLoading from './scenes/loading.js';

class Game {
  constructor( initialScene, parent = document.body) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1200;
    this.canvas.height = 920;

    ['mouseMove', 'mouseDown', 'mouseUp', 'mouseEnter', 'mouseLeave', 'click'].forEach(event => {
      this.canvas.addEventListener(event.toLowerCase(), this.event.bind(this, event));
    })
    this.canvas.addEventListener('contextmenu', this.event.bind(this, 'click'));

    parent.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.scene = initialScene;
    this.loop(new Date());
  }

  get scene() {
    return this.currentScene;
  }
  set scene(scene) {
    console.debug('Chnaging Scene: ', scene);
    
    if (typeof (this.currentScene?.destroy) == 'function') this.currentScene.destroy(this);
    if (scene.init && typeof (scene.init) == 'function') scene.init(this);
    this.currentScene = scene;
    return this;
  }

  loop(date) {
    const delta = (new Date() - date) / 1000;

    if (this.currentScene.update) this.currentScene.update(this, delta);
    if (this.currentScene.draw) this.currentScene.draw(this, delta);

    window.requestAnimationFrame(this.loop.bind(this, new Date()));
  }

  event(event, e) {
    e.preventDefault();
    return this.currentScene?.[event] &&  this.currentScene?.[event](this, e);
  }
}

window.game = new Game(SceneLoading);