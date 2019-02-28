import Grant from "../common/Grant";
import Rule from "./Rule";

declare class Manager {
    /**
     * Creates a new manager and if supplied, inherits the rules
     * of another manager.
     */
    constructor(options?: {
        backoff?: string
    }, manager?: Manager);

    /**
     * Adds the rule to this manager.
     */
    addRule(options: {
        window: number,
        limit: number,
        throttling: string | {
            type: string,
            getStartOfNextWindow: () => number
        },
        queueing: string | {
            type: string
        },
        name?: string,
        scope?: string | string[],
        resource?: number
    }): Rule;

    /**
     * Adds the rule to this manager.
     */
    addRule(rule: Rule): Rule;

    /**
     * Request quota
     */
    requestQuota(managerName: string, scope?: {
        [scopeName: string]: any
    }, resources?: {
        [resourceName: string]: number
    }, options?: {
        maxWait?: number
    }): Promise<Grant>;
}

export = Manager;