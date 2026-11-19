import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

function AdminLayout() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return <Outlet />;
}

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});
