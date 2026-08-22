import { subscribeToTracking } from "./trackingService.js";

export function createTrackingConnection({ onMessage, onStatus, onError } = {}) {
  let unsubscribe = null;

  return {
    connect() {
      onStatus?.("connecting");
      unsubscribe = subscribeToTracking(
        (buses) => {
          onMessage?.({ type: "fleet:update", data: buses });
          onStatus?.("connected");
        },
        (error) => {
          onStatus?.("error");
          onError?.(error);
        }
      );
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
