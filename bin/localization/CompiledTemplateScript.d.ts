/**
 * A compiled localization template script, including an implicit
 * return coercion if it was syntactically possible to create one
 * @private
 */
export declare class CompiledTemplateScript {
    readonly raw: string;
    readonly func: Function;
    readonly implicitReturnFunc: Function | undefined;
    constructor(raw: string);
    /**
     * Wrap the given code in a function body to prevent vm.Script
     * throwing errors on top-level returns which are valid in the
     * context of a template script
     */
    private static _functionWrap;
}
