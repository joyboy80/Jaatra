import { subscribeToTracking } from "./trackingService.js";

export function createTrackingConnection({ onMessage, onStatus } = {}) {
  let unsubscribe = null;

  return {
    connect() {
      onStatus?.("connecting");
      unsubscribe = subscribeToTracking((buses) => onMessage?.({ type: "fleet:update", data: buses }));
      onStatus?.("connected");
    },
    disconnect() {
      unsubscribe?.();
      unsubscribe = null;
      onStatus?.("disconnected");
    },
  };
}

export function createSocketIOConnection(options) {
  return createTrackingConnection(options);
}
