import { SingleProviderStorage } from './SingleProviderStorage';
import { deprecatedClass } from '../util/DeprecatedClassDecorator';

/**
 * Compat for renamed KeyedStorage class
 * @deprecated Use {@link SingleProviderStorage} instead
 */
@deprecatedClass('Class `KeyedStorage` is deprecated. Use `SingleProviderStorage` instead')
export class KeyedStorage extends SingleProviderStorage {}
