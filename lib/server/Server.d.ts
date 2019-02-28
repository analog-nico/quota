import Manager from "../core/Manager";
import Grant from "../common/Grant";
import SocketIO from "socket.io";

declare class Server {
    /**
     * Adds the selected manager to the Server. If a preset is set
     * or options is not specified, a preset is loaded.
     */
    addManager(managerName: string, manager: Manager): void;

    /**
     * Adds the selected manager to the Server. If a preset is set
     * or options is not specified, a preset is loaded.
     */
    addManager(managerName: string, options: {
        preset: 'google-analytics',
        dailyRequests?: number,
        dailyWrites?: number,
        queriesPerSecond?: number,
        qpsPerUser?: boolean,
        sharedIPAddress?: boolean
    }): void;

    /**
     * Gets the name of the managers in this server.
     */
    getManagers(): Promise<string[]>;

    /**
     * Request quota
     * @private
     */
    requestQuota(managerName: string, scope?: {
        [scopeName: string]: any
    }, resources?: {
        [resourceName: string]: number
    }, options?: {
        maxWait?: number
    }): Promise<Grant>;

    /**
     * Exposes the server to the io server for use
     * on network.
     */
    attachIo(io: SocketIO.Server): void;
}

export = Server;