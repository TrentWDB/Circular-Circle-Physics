/**
 * Created by Trent on 4/13/2018.
 */

'use strict';

const MitoCircle = class MitoCircle {
    constructor() {
        this._position = [0, 0];
        this._radius = 0;

        this._density = 1;

        this._boundingCircle = new MitoBoundingCircle();
    }

    getPosition() {
        return this._position;
    }

    setPosition(x, y) {
        this._position[0] = x;
        this._position[1] = y;
    }

    getRadius() {
        return this._radius;
    }

    setRadius(radius) {
        this._radius = radius;
    }

    getBoundingCircle() {
        return this._boundingCircle;
    }

    updateBoundingCircle() {
        this._boundingCircle.setRadius(this._radius);
    }

    getMass() {
        return Math.PI * this._radius * this._radius * this._density;
    }
};