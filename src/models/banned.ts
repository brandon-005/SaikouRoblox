import { model, Schema } from 'mongoose';
import { BannedTypes } from '../types/banned';

const BannedSchema: Schema = new Schema({
  RobloxUsername: { type: String },
  RobloxID: { type: Number },
});

export = model<BannedTypes>('BannedPlayers', BannedSchema);
