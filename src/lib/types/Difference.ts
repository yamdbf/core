/**
 * Represents a difference between two given valid Unix time signatures
 */
export type Difference = {
	ms?: number;
	days?: number;
	hours?: number;
	mins?: number;
	secs?: number;
	toString(): string;
	toSimplifiedString?(): string;
};
