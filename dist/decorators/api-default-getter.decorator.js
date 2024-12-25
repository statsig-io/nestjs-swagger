"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDefaultGetter = void 0;
const constants_1 = require("../constants");
function ApiDefaultGetter(type, parameter) {
    return (prototype, key, descriptor) => {
        if (type.prototype) {
            Reflect.defineMetadata(constants_1.DECORATORS.API_DEFAULT_GETTER, { getter: descriptor.value, parameter, prototype }, type.prototype);
        }
        return descriptor;
    };
}
exports.ApiDefaultGetter = ApiDefaultGetter;
