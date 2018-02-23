import { Client } from '../client/Client';
/**
 * Handles dispatching commands
 * @private
 */
export declare class CommandDispatcher {
    private readonly _logger;
    private readonly _client;
    private _ready;
    constructor(client: Client);
    /**
     * Set the dispatcher as ready to receive and dispatch commands
     */
    setReady(): void;
    /**
     * Handle received messages
     */
    private handleMessage(message);
    /**
     * Check if the calling user is blacklisted
     */
    private isBlacklisted(user, message, dm);
    /**
     * Return whether or not the command is allowed to be called based
     * on whatever circumstances are present at call-time, throwing
     * appropriate errors as necessary for unsatisfied conditions
     */
    private canCallCommand(res, command, message, dm);
    /**
     * Return whether or not the message author passed global
     * and command-specific ratelimits for the given command
     */
    private passedRateLimiters(res, message, command);
    /**
     * Check global or command-specific ratelimits for the given message
     * author, notify them if they exceed ratelimits, and return whether
     * or not the user is ratelimited
     */
    private isRateLimited(res, message, command, global?);
    /**
     * Return permissions the client is missing to execute the given command
     */
    private checkClientPermissions(command, message, dm);
    /**
     * Return the permissions the caller is missing to call the given command
     */
    private checkCallerPermissions(command, message, dm);
    /**
     * Return whether or not the message author passes the role limiter
     */
    private passedRoleLimiter(command, message, dm);
    /**
     * Return whether or not the user has one of the roles specified
     * in the command's requisite roles
     */
    private hasRoles(command, message, dm);
    /**
     * Return an error for unknown commands in DMs
     */
    private unknownCommandError(res);
    /**
     * Return an error for guild only commands
     */
    private guildOnlyError(res);
    /**
     * Return an error for missing caller permissions
     */
    private missingClientPermissionsError(res, missing);
    /**
     * Return an error for missing caller permissions
     */
    private missingCallerPermissionsError(res, missing);
    /**
     * Return an error for failing a command limiter
     */
    private failedLimiterError(res, command, message);
    /**
     * Return an error for missing roles
     */
    private missingRolesError(res, command);
}
