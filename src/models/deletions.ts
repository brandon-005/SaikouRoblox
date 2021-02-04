import { model, Schema } from 'mongoose';
import { DeletionTypes } from '../types/deletions';

const deletionSchema: Schema = new Schema({
  RobloxName: { type: String },
  RobloxID: { type: Number },
  Triggers: { type: Number },
});

export = model<DeletionTypes>('postDeletions', deletionSchema);
