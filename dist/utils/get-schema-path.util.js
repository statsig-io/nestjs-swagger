"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refs = exports.getSchemaPath = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const constants_1 = require("../constants");
function getSchemaPath(model) {
    const modelName = (0, shared_utils_1.isString)(model) ? model : getSchemaNameByClass(model);
    return `#/components/schemas/${modelName}`;
}
exports.getSchemaPath = getSchemaPath;
function getSchemaNameByClass(target) {
    var _a;
    if (!target || typeof target !== 'function') {
        return '';
    }
    const customSchema = Reflect.getOwnMetadata(constants_1.DECORATORS.API_SCHEMA, target);
    if (!customSchema || customSchema.length === 0) {
        return target.name;
    }
    return (_a = customSchema[customSchema.length - 1].name) !== null && _a !== void 0 ? _a : target.name;
}
function refs(...models) {
    return models.map((item) => ({
        $ref: getSchemaPath(item.name)
    }));
}
exports.refs = refs;
