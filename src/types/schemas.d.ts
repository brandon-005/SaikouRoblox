import { Document } from 'mongoose';

// --- WordOrPhrase Schema ---

export interface BlacklistTypes extends Document {
	content: string;
	Warnable: boolean;
}

// --- Deletion Schema ---
export interface DeletionTypes extends Document {
	RobloxName: string;
	RobloxID: number;
	Triggers: number;
}

// --- Exile Schema ---
export interface ExileTypes extends Document {
	Moderator: String;
	Reason: String;
	RobloxUsername: String;
	RobloxID: Number;
}

// --- Suspend Schema ---
export interface TimeTypes extends Document {
	RobloxName: string;
	RobloxID: number;
	timestamp: Date;
	Role: string;
	Duration: number;
	Moderator: string;
	Reason: string;
}
