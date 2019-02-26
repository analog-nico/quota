import Grant from "../common/Grant";
import Rule from "./Rule";

declare class Manager {
    /**
     * Adds the rule to this manager.
     */
    addRule(options: {
        window: number,
        throttling: string | {
            type: string,
            getStartOfNextWindow: () => number
        },
        queueing: string | {
            type: string
        },
        name?: string,
        limit: number,
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