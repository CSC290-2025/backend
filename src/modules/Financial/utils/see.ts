import { EventEmitter } from 'events';
// Shared EventEmitter for SCB payment events. Listeners can subscribe to unique
// events using a key like `scb:confirmed:${ref1}` where ref1 is the reference. to the transaction
export const ScbEventEmitter = new EventEmitter();
