"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canReferenceNode = exports.convertPath = exports.extractTypeArgumentIfArray = exports.isAutoGeneratedTypeUnion = exports.isAutoGeneratedEnumUnion = exports.isDynamicallyAdded = exports.insertAt = exports.replaceImportPath = exports.hasPropertyKey = exports.isPromiseOrObservable = exports.getTypeReferenceAsString = exports.getDecoratorOrUndefinedByNames = void 0;
const lodash_1 = require("lodash");
const path_1 = require("path");
const ts = require("typescript");
const ast_utils_1 = require("./ast-utils");
function getDecoratorOrUndefinedByNames(names, decorators, factory) {
    return (decorators || factory.createNodeArray()).find((item) => {
        try {
            const decoratorName = (0, ast_utils_1.getDecoratorName)(item);
            return names.includes(decoratorName);
        }
        catch (_a) {
            return false;
        }
    });
}
exports.getDecoratorOrUndefinedByNames = getDecoratorOrUndefinedByNames;
function getTypeReferenceAsString(type, typeChecker, arrayDepth = 0) {
    if ((0, ast_utils_1.isArray)(type)) {
        const arrayType = (0, ast_utils_1.getTypeArguments)(type)[0];
        const { typeName, arrayDepth: depth } = getTypeReferenceAsString(arrayType, typeChecker, arrayDepth + 1);
        if (!typeName) {
            return { typeName: undefined };
        }
        return {
            typeName: `${typeName}`,
            isArray: true,
            arrayDepth: depth
        };
    }
    if ((0, ast_utils_1.isBoolean)(type)) {
        return { typeName: Boolean.name, arrayDepth };
    }
    if ((0, ast_utils_1.isNumber)(type)) {
        return { typeName: Number.name, arrayDepth };
    }
    if ((0, ast_utils_1.isBigInt)(type)) {
        return { typeName: BigInt.name, arrayDepth };
    }
    if ((0, ast_utils_1.isString)(type) || (0, ast_utils_1.isStringLiteral)(type) || (0, ast_utils_1.isStringMapping)(type)) {
        return { typeName: String.name, arrayDepth };
    }
    if (isPromiseOrObservable((0, ast_utils_1.getText)(type, typeChecker))) {
        const typeArguments = (0, ast_utils_1.getTypeArguments)(type);
        const elementType = getTypeReferenceAsString((0, lodash_1.head)(typeArguments), typeChecker, arrayDepth);
        return elementType;
    }
    if (type.isClass()) {
        return { typeName: (0, ast_utils_1.getText)(type, typeChecker), arrayDepth };
    }
    try {
        const text = (0, ast_utils_1.getText)(type, typeChecker);
        if (text === Date.name) {
            return { typeName: text, arrayDepth };
        }
        if (isOptionalBoolean(text)) {
            return { typeName: Boolean.name, arrayDepth };
        }
        if (isAutoGeneratedTypeUnion(type) ||
            isAutoGeneratedEnumUnion(type, typeChecker)) {
            const types = type.types;
            return getTypeReferenceAsString(types[types.length - 1], typeChecker, arrayDepth);
        }
        if (text === 'any' ||
            text === 'unknown' ||
            text === 'object' ||
            (0, ast_utils_1.isInterface)(type) ||
            (type.isUnionOrIntersection() && !(0, ast_utils_1.isEnum)(type))) {
            return { typeName: 'Object', arrayDepth };
        }
        if ((0, ast_utils_1.isEnum)(type)) {
            return { typeName: undefined, arrayDepth };
        }
        if (type.aliasSymbol) {
            return { typeName: 'Object', arrayDepth };
        }
        if (typeChecker.getApparentType(type).getSymbol().getEscapedName() === 'String') {
            return { typeName: String.name, arrayDepth };
        }
        return { typeName: undefined };
    }
    catch (_a) {
        return { typeName: undefined };
    }
}
exports.getTypeReferenceAsString = getTypeReferenceAsString;
function isPromiseOrObservable(type) {
    return type.includes('Promise<') || type.includes('Observable<');
}
exports.isPromiseOrObservable = isPromiseOrObservable;
function hasPropertyKey(key, properties) {
    return properties
        .filter((item) => !isDynamicallyAdded(item))
        .some((item) => item.name.getText() === key);
}
exports.hasPropertyKey = hasPropertyKey;
function replaceImportPath(typeReference, fileName, options) {
    if (!typeReference.includes('import')) {
        return { typeReference, importPath: null };
    }
    let importPath = /\(\"([^)]).+(\")/.exec(typeReference)[0];
    if (!importPath) {
        return { typeReference: undefined, importPath: null };
    }
    importPath = convertPath(importPath);
    importPath = importPath.slice(2, importPath.length - 1);
    try {
        if ((0, path_1.isAbsolute)(importPath)) {
            throw {};
        }
        require.resolve(importPath);
        typeReference = typeReference.replace('import', 'require');
        return {
            typeReference,
            importPath: null
        };
    }
    catch (_error) {
        const from = (options === null || options === void 0 ? void 0 : options.readonly)
            ? convertPath(options.pathToSource)
            : path_1.posix.dirname(convertPath(fileName));
        let relativePath = path_1.posix.relative(from, importPath);
        relativePath = relativePath[0] !== '.' ? './' + relativePath : relativePath;
        const nodeModulesText = 'node_modules';
        const nodeModulePos = relativePath.indexOf(nodeModulesText);
        if (nodeModulePos >= 0) {
            relativePath = relativePath.slice(nodeModulePos + nodeModulesText.length + 1);
            const typesText = '@types';
            const typesPos = relativePath.indexOf(typesText);
            if (typesPos >= 0) {
                relativePath = relativePath.slice(typesPos + typesText.length + 1);
            }
            const indexText = '/index';
            const indexPos = relativePath.indexOf(indexText);
            if (indexPos >= 0) {
                relativePath = relativePath.slice(0, indexPos);
            }
        }
        typeReference = typeReference.replace(importPath, relativePath);
        if (options.readonly) {
            const { typeName, typeImportStatement } = convertToAsyncImport(typeReference);
            return {
                typeReference: typeImportStatement,
                typeName,
                importPath: relativePath
            };
        }
        return {
            typeReference: typeReference.replace('import', 'require'),
            importPath: relativePath
        };
    }
}
exports.replaceImportPath = replaceImportPath;
function convertToAsyncImport(typeReference) {
    const regexp = /import\(.+\).([^\]]+)(\])?/;
    const match = regexp.exec(typeReference);
    if ((match === null || match === void 0 ? void 0 : match.length) >= 2) {
        const importPos = typeReference.indexOf(match[0]);
        typeReference = typeReference.replace(`.${match[1]}`, '');
        return {
            typeImportStatement: insertAt(typeReference, importPos, 'await '),
            typeName: match[1]
        };
    }
    return { typeImportStatement: typeReference };
}
function insertAt(string, index, substring) {
    return string.slice(0, index) + substring + string.slice(index);
}
exports.insertAt = insertAt;
function isDynamicallyAdded(identifier) {
    return identifier && !identifier.parent && identifier.pos === -1;
}
exports.isDynamicallyAdded = isDynamicallyAdded;
function isAutoGeneratedEnumUnion(type, typeChecker) {
    if (type.isUnionOrIntersection() && !(0, ast_utils_1.isEnum)(type)) {
        if (!type.types) {
            return undefined;
        }
        const undefinedTypeIndex = type.types.findIndex((type) => type.intrinsicName === 'undefined' || type.intrinsicName === 'null');
        if (undefinedTypeIndex < 0) {
            return undefined;
        }
        let parentType = undefined;
        const isParentSymbolEqual = type.types.every((item, index) => {
            if (index === undefinedTypeIndex) {
                return true;
            }
            if (!item.symbol) {
                return false;
            }
            if (!item.symbol.parent ||
                item.symbol.flags !== ts.SymbolFlags.EnumMember) {
                return false;
            }
            const symbolType = typeChecker.getDeclaredTypeOfSymbol(item.symbol.parent);
            if (symbolType === parentType || !parentType) {
                parentType = symbolType;
                return true;
            }
            return false;
        });
        if (isParentSymbolEqual) {
            return parentType;
        }
    }
    return undefined;
}
exports.isAutoGeneratedEnumUnion = isAutoGeneratedEnumUnion;
function isAutoGeneratedTypeUnion(type) {
    if (type.isUnionOrIntersection() && !(0, ast_utils_1.isEnum)(type)) {
        if (!type.types) {
            return false;
        }
        const undefinedTypeIndex = type.types.findIndex((type) => type.intrinsicName === 'undefined');
        if (type.types.length === 2 && undefinedTypeIndex >= 0) {
            return true;
        }
    }
    return false;
}
exports.isAutoGeneratedTypeUnion = isAutoGeneratedTypeUnion;
function extractTypeArgumentIfArray(type) {
    if ((0, ast_utils_1.isArray)(type)) {
        type = (0, ast_utils_1.getTypeArguments)(type)[0];
        if (!type) {
            return undefined;
        }
        return {
            type,
            isArray: true
        };
    }
    return {
        type,
        isArray: false
    };
}
exports.extractTypeArgumentIfArray = extractTypeArgumentIfArray;
function isOptionalBoolean(text) {
    return typeof text === 'string' && text === 'boolean | undefined';
}
function convertPath(windowsPath) {
    return windowsPath
        .replace(/^\\\\\?\\/, '')
        .replace(/\\/g, '/')
        .replace(/\/\/+/g, '/');
}
exports.convertPath = convertPath;
function canReferenceNode(node, options) {
    var _a;
    if (!options.readonly) {
        return true;
    }
    if (ts.isCallExpression(node) || ts.isIdentifier(node)) {
        return false;
    }
    if (ts.isNewExpression(node)) {
        if (((_a = node.expression) === null || _a === void 0 ? void 0 : _a.escapedText) === 'Date') {
            return true;
        }
        return false;
    }
    if (node.kind === ts.SyntaxKind.FalseKeyword ||
        node.kind === ts.SyntaxKind.TrueKeyword ||
        node.kind === ts.SyntaxKind.NullKeyword) {
        return true;
    }
    if (ts.isNumericLiteral(node) ||
        ts.isPrefixUnaryExpression(node) ||
        ts.isStringLiteral(node)) {
        return true;
    }
    return false;
}
exports.canReferenceNode = canReferenceNode;
