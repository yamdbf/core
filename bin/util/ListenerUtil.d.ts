/// <reference types="node" />
import 'reflect-metadata';
import { EventEmitter } from 'events';
/**
 * Contains static decorator methods for declaring class methods (within a class extending `EventEmitter`)
 * as listeners for events that will be emitted by the class or parent classes
 *
 * >**Note:** This is a TypeScript feature. Javascript users are limited to creating listeners
 * the old fashioned `<EventEmitter>on/once(...)` way
 * @module ListenerUtil
 */
export declare class ListenerUtil {
    /**
     * Attaches any listeners registered via the `on` or `once` decorators.
     * Must be called ***after*** `super()`, and only in classes extending `EventEmitter`
     * (which includes the Discord.js Client class and thus the YAMDBF Client class)
     *
     * If the `listenerSource` parameter is provided, the object passed will be used
     * as the source of methods to link with events from the given `EventEmitter`
     * @static
     * @method registerListeners
     * @param {EventEmitter} emitter EventEmitter to register listeners for
     * @param {object} [listenerSource] Object with registered methods to link events to
     * @returns {void}
     */
    static registerListeners(emitter: EventEmitter, listenerSource?: object): void;
    /**
     * Declares the decorated method as an event handler for the specified event.
     * Must be registered by calling {@link ListenerUtil.registerListeners()}
     *
     * > **Note:** `registerListeners()` is already called in the YAMDBF
     * {@link Client} constructor and does not need to be called in classes
     * extending it
     * @static
     * @method on
     * @param {string} event The name of the event to handle
     * @param {...any[]} args Additional static values to pass to the method.
     * 						  Will be passed after any args passed by the event
     * @returns {MethodDecorator}
     */
    static on(event: string, ...args: any[]): MethodDecorator;
    /**
     * Declares the decorated method as a single-use event handler for the
     * specified event. Must be registered by calling
     * {@link ListenerUtil.registerListeners()}
     *
     * > **Note:** `registerListeners()` is already called in the YAMDBF
     * {@link Client} constructor and does not need to be called in classes
     * extending it
     * @static
     * @method once
     * @param {string} event The name of the event to handle
     * @param {...any[]} args Additional static values to pass to the method.
     * 						  Will be passed after any args passed by the event
     * @returns {MethodDecorator}
     */
    static once(event: string, ...args: any[]): MethodDecorator;
    /**
     * Returns a MethodDecorator that handles setting the appropriate listener
     * metadata for a class method
     * @private
     */
    private static _setListenerMetadata;
}
