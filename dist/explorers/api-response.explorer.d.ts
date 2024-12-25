/// <reference types="lodash" />
import { Type } from '@nestjs/common';
import { SchemaObject } from '../interfaces/open-api-spec.interface';
import { FactoriesNeededByResponseFactory } from '../services/response-object-factory';
export declare const exploreGlobalApiResponseMetadata: (schemas: Record<string, SchemaObject>, metatype: Type<unknown>, factories: FactoriesNeededByResponseFactory) => {
    responses: import("lodash").Dictionary<boolean>;
};
export declare const exploreApiResponseMetadata: (schemas: Record<string, SchemaObject>, factories: FactoriesNeededByResponseFactory, instance: object, prototype: Type<unknown>, method: Function) => import("lodash").Dictionary<boolean> | {
    [x: number]: {
        description: string;
    };
};
