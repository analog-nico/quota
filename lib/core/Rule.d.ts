import Grant from "../common/Grant";
import Rule from "./Rule";

declare class Rule {
    constructor(options: {
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
    });

    getName(): string;
    getResource(): string;
    limitsResource(resource: string): boolean;

    isAvailable(managerName, scope, resources, options, queuedRequest): boolean;
    enqueue(managerName, scope, resources, options, queuedRequest);
    reserve(managerName, scope, resources, options);
    formatScope(scope);
    getBundleForScope(managerName, scope);
    getResourceAmount(resources);
}

export = Rule;