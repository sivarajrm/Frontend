import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function useRouteLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(15);

    const t1 = setTimeout(() => setProgress(45), 150);
    const t2 = setTimeout(() => setProgress(75), 300);
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setLoading(false), 200);
    }, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname]);

  return { loading, progress };
}
