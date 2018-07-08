/**
 * Created by Trent on 4/17/2018.
 */

'use strict';

const MitoPriorityQueueSet = class MitoPriorityQueueSet {
    constructor() {
        this._values = [];
        this._valueSet = {};
    }

    insert(value) {
        if (this._valueSet[String(value)]) {
            return;
        }

        this._values.push(value);
        this._valueSet[String(value)] = true;
        this._move(this._values.length - 1);
    }

    peek() {
        return this._values.length > 0 ? this._values[this._values.length - 1] : null;
    }

    pop() {
        let value = this._values.length > 0 ? this._values.pop() : null;
        delete this._valueSet[String(value)];

        return value;
    }

    remove(value) {
        this._values = this._values.filter(current => current !== value);
        delete this._valueSet[String(value)];
    }

    clear() {
        this._values = [];
        this._valueSet = {};
    }

    _move(index) {
        if (index === 0) {
            return;
        }

        let currentValue = this._values[index];
        let nextValue = this._values[index - 1];

        if (nextValue <= currentValue) {
            this._values[index - 1] = currentValue;
            this._values[index] = nextValue;
        }

        this._move(index - 1);
    }
};

module.exports = MitoPriorityQueueSet;