import { model, Schema } from 'mongoose';
import { TimeTypes } from '../types/suspendTimes';

const suspendTimeSchema: Schema = new Schema({
  RobloxName: { type: String },
  RobloxID: { type: Number },
  timestamp: { type: Date, default: new Date(0) },
  Role: { type: String },
  Duration: { type: Number },
  Moderator: { type: String },
  Reason: { type: String },
});

export = model<TimeTypes>('SuspendTimes', suspendTimeSchema);
