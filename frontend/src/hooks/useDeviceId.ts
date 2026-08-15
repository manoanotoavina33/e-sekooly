import { useEffect, useState } from "react";
import { getMeta, setMeta } from "@/lib/offlineDb";

const DEVICE_ID_KEY = "deviceId";

export function useDeviceId(): string | null {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    getMeta(DEVICE_ID_KEY).then((id) => {
      if (id) {
        setDeviceId(id);
      } else {
        const newId = crypto.randomUUID();
        setMeta(DEVICE_ID_KEY, newId);
        setDeviceId(newId);
      }
    });
  }, []);

  return deviceId;
}
