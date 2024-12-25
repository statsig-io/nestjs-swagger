import * as ts from 'typescript';
import { PluginOptions } from '../merge-options';
export declare function getDecoratorOrUndefinedByNames(names: string[], decorators: readonly ts.Decorator[], factory: ts.NodeFactory): ts.Decorator | undefined;
export declare function getTypeReferenceAsString(type: ts.Type, typeChecker: ts.TypeChecker, arrayDepth?: number): {
    typeName: string;
    isArray?: boolean;
    arrayDepth?: number;
};
export declare function isPromiseOrObservable(type: string): boolean;
export declare function hasPropertyKey(key: string, properties: ts.NodeArray<ts.PropertyAssignment>): boolean;
export declare function replaceImportPath(typeReference: string, fileName: string, options: PluginOptions): {
    typeReference: string;
    typeName: string;
    importPath: string;
} | {
    typeReference: string;
    importPath: string;
    typeName?: undefined;
};
export declare function insertAt(string: string, index: number, substring: string): string;
export declare function isDynamicallyAdded(identifier: ts.Node): boolean;
export declare function isAutoGeneratedEnumUnion(type: ts.Type, typeChecker: ts.TypeChecker): ts.Type;
export declare function isAutoGeneratedTypeUnion(type: ts.Type): boolean;
export declare function extractTypeArgumentIfArray(type: ts.Type): {
    type: ts.Type;
    isArray: boolean;
};
export declare function convertPath(windowsPath: string): string;
export declare function canReferenceNode(node: ts.Node, options: PluginOptions): boolean;