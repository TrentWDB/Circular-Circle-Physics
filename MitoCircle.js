/**
 * Created by Trent on 4/13/2018.
 */

'use strict';

const MitoCircle = class MitoCircle {
    constructor() {
        this._position = [0, 0];
    }

    getPosition() {
        return this._position;
    }

    setPosition(x, y) {
        this._position[0] = x;
        this._position[1] = y;
    }
};