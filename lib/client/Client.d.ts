import Manager from "../core/Manager";
import Server from "../server/Server";
import Grant from "../common/Grant";
import SocketIO from "socket.io";

declare class Client {
    /**
     * Creates a new Quota Client. The client is responsible
     * to communicate with different servers: remote and local.
     *  
     * @param uri The URI of the server's socket.io
     */
    constructor(uri: string);

    /**
     * Creates a new Quota Client. The client is responsible
     * to communicate with different servers: remote and local.
     * 
     * @param server The instance of a Server to be used.
     */
    constructor(server: Server);

    constructor(servers: (string | Server)[]);

    /**
     * Adds a server to be used by this client.
     */
    addServer(server: Server): void;
    addServer(uri: string): void;

    /**
     * Disposes of resources such as open connections
     */
    dispose(): Promise<void>;

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

export = Client;