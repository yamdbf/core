import { Client } from '../client/Client';
/**
 * Handles dispatching commands
 * @private
 */
export declare class CommandDispatcher {
    private readonly _logger;
    private readonly _client;
    private _locks;
    private _ready;
    constructor(client: Client);
    /**
     * Set the dispatcher as ready to receive and dispatch commands
     */
    setReady(): void;
    /**
     * Handle received messages
     */
    private handleMessage;
    /**
     * Return whether or not the given command is locked, either directly
     * or as a sibling of another command
     */
    private isLocked;
    /**
     * Return the lock that is preventing the command from being called.
     * This can be the command's own lock, or the lock of another command
     * that the given command is a sibling of
     */
    private getCurrentLock;
    /**
     * Check if the calling user is blacklisted
     */
    private isBlacklisted;
    /**
     * Return whether or not the command is allowed to be called based
     * on whatever circumstances are present at call-time, throwing
     * appropriate errors as necessary for unsatisfied conditions
     */
    private canCallCommand;
    /**
     * Return whether or not the message author passed global
     * and command-specific ratelimits for the given command
     */
    private passedRateLimiters;
    /**
     * Check global or command-specific ratelimits for the given message
     * author, notify them if they exceed ratelimits, and return whether
     * or not the user is ratelimited
     */
    private isRateLimited;
    /**
     * Return permissions the client is missing to execute the given command
     */
    private checkClientPermissions;
    /**
     * Return the permissions the caller is missing to call the given command
     */
    private checkCallerPermissions;
    /**
     * Return whether or not the message author passes the role limiter
     */
    private passedRoleLimiter;
    /**
     * Return whether or not the user has one of the roles specified
     * in the command's requisite roles
     */
    private hasRoles;
    /**
     * Return an error for unknown commands in DMs
     */
    private unknownCommandError;
    /**
     * Return an error for guild only commands
     */
    private guildOnlyError;
    /**
     * Return an error for missing caller permissions
     */
    private missingClientPermissionsError;
    /**
     * Return an error for missing caller permissions
     */
    private missingCallerPermissionsError;
    /**
     * Return an error for failing a command limiter
     */
    private failedLimiterError;
    /**
     * Return an error for missing roles
     */
    private missingRolesError;
}
