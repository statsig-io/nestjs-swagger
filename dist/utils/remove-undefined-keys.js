"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUndefinedKeys = void 0;
function removeUndefinedKeys(obj) {
    Object.entries(obj).forEach(([key, value]) => {
        if (value === undefined) {
            delete obj[key];
        }
    });
    return obj;
}
exports.removeUndefinedKeys = removeUndefinedKeys;
