import { useEffect, useState } from "react";
import { createTrackingConnection } from "../services/websocketService";

export default function useLiveTracking() {
  const [buses, setBuses] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [error, setError] = useState("");

  useEffect(() => {
    const connection = createTrackingConnection({
      onMessage(message) {
        if (message.type === "fleet:update") {
          setBuses(message.data);
          setError("");
        }
      },
      onStatus: setConnectionStatus,
      onError(error) {
        setError(error.message);
      },
    });
    connection.connect();
    return () => connection.disconnect();
  }, []);

  return {
    buses,
    connectionStatus,
    error,
    lastUpdated: buses[0]?.updatedAt || null,
  };
}
