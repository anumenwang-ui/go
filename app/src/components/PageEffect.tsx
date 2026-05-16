import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

export function PageEffect({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((k) => k + 1);
  }, [location.pathname]);

  return (
    <div key={key} className="page-enter">
      {children}
    </div>
  );
}
