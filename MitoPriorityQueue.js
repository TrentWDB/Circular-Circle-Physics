/**
 * Created by Trent on 4/17/2018.
 */

'use strict';

const MitoPriorityQueue = class MitoPriorityQueue {
    constructor() {
        this._values = [];
    }

    insert(value) {
        this._values.push(value);
        this._move(this._values.length - 1);
    }

    peek() {
        return this._values.length > 0 ? this._values[this._values.length - 1] : null;
    }

    pop() {
        return this._values.length > 0 ? this._values.pop() : null;
    }

    remove(value) {
        this._values = this._values.filter(current => current !== value);
    }

    _move(index) {
        if (index === 0) {
            return;
        }

        let currentValue = this._values[index];
        let nextValue = this._values[index - 1];

        if (nextValue < currentValue) {
            this._values[index - 1] = currentValue;
            this._values[index] = nextValue;
        }

        this._move(index - 1);
    }
};
