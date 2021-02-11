import { model, Schema } from 'mongoose';
import { BlacklistTypes } from '../types/wordOrPhrase';

const wordOrPhraseSchema: Schema = new Schema({
  content: { type: String },
  Warnable: { type: Boolean },
});

export = model<BlacklistTypes>('BlacklistPosts', wordOrPhraseSchema);
