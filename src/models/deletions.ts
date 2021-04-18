import { model, Schema } from 'mongoose';
import { DeletionTypes } from '../types/schemas';

const deletionSchema: Schema = new Schema({
	RobloxName: { type: String },
	RobloxID: { type: Number },
	Triggers: { type: Number },
});

export = model<DeletionTypes>('postDeletions', deletionSchema);
