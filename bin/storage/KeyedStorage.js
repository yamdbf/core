"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const SingleProviderStorage_1 = require("./SingleProviderStorage");
const DeprecatedClassDecorator_1 = require("../util/DeprecatedClassDecorator");
/**
 * Compat for renamed KeyedStorage class
 * @deprecated Use {@link SingleProviderStorage} instead
 */
let KeyedStorage = class KeyedStorage extends SingleProviderStorage_1.SingleProviderStorage {
};
KeyedStorage = __decorate([
    DeprecatedClassDecorator_1.deprecatedClass('Class `KeyedStorage` is deprecated. Use `SingleProviderStorage` instead')
], KeyedStorage);
exports.KeyedStorage = KeyedStorage;

//# sourceMappingURL=KeyedStorage.js.map
