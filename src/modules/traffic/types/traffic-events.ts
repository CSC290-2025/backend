import EventEmitter from 'events';

export type TrafficStatusEvent = {
  type: 'status_change';
  id: number;
  oldStatus: number | null;
  newStatus: number | null;
  timestamp: string;
};

class TrafficEmitter extends EventEmitter {}

export const trafficEmitter = new TrafficEmitter();

export const emitStatusChange = (
  id: number,
  oldStatus: number | null,
  newStatus: number | null
) => {
  const evt: TrafficStatusEvent = {
    type: 'status_change',
    id,
    oldStatus,
    newStatus,
    timestamp: new Date().toISOString(),
  };
  trafficEmitter.emit('status_change', evt);
};

export default trafficEmitter;
