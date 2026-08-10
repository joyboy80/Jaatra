import { useEffect, useState } from "react";
import { createTrackingConnection } from "../services/websocketService";
import { getTrackingSnapshot } from "../services/trackingService";

export default function useLiveTracking() {
  const [buses, setBuses] = useState(() => getTrackingSnapshot());
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  useEffect(() => {
    const connection = createTrackingConnection({
      onMessage(message) {
        if (message.type === "fleet:update") setBuses(message.data);
      },
      onStatus: setConnectionStatus,
    });
    connection.connect();
    return () => connection.disconnect();
  }, []);

  return {
    buses,
    connectionStatus,
    lastUpdated: buses[0]?.updatedAt || null,
  };
}
