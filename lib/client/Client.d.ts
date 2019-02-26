import Manager from "../core/Manager";
import Server from "../server/Server";
import SocketIO from "socket.io";

declare class Client {
    constructor(uri: string);
    constructor(server: Server);
    constructor(servers: (string | Server)[]);

    /**
     * Adds a server to be used by this client.
     */
    addServer(server: Server): void;
    addServer(uri: string): void;

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
     * Disposes of resources such as open connections
     */
    dispose(): Promise<void>;
}

export = Client;