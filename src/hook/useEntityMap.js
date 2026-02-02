import { useState, useEffect } from "react";

export function useEntityMap(ids = [], fetchById) {
  const [map, setMap] = useState({});

  useEffect(() => {
    const missingIds = ids.filter(
      id => id && !map[id]
    );

    if (!missingIds.length) return;

    let cancelled = false;

    async function load() {
      const results = await Promise.all(
        missingIds.map(id =>
          fetchById(id)
            .then(res => [id, res])
            .catch(() => [id, null])
        )
      );

      if (!cancelled) {
        setMap(prev => ({
          ...prev,
          ...Object.fromEntries(results)
        }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ids, fetchById, map]);

  return map;
}