/**
 * Created by Trent on 4/17/2018.
 */

'use strict';

const MitoBoundingCircle = class MitoBoundingCircle {
    constructor() {
        this._position = [0, 0];
        this._radius = 0;
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
};