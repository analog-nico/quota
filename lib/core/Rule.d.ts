import Grant from "../common/Grant";
import Rule from "./Rule";

declare class Rule {
    constructor(options: {
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
}

export = Rule;