import { model, Schema } from 'mongoose';
import { BlacklistTypes } from '../types/wordOrPhrase';

const wordOrPhraseSchema: Schema = new Schema({
  content: { type: String },
});

export = model<BlacklistTypes>('BlacklistPosts', wordOrPhraseSchema);
