// src/components/Layout/index.jsx
import React, { useEffect, useState } from "react";
import { NavbarDashboard, SidebarDashboard } from "..";

// ---------------------------------------------------------------------------
// New LayoutDashboard
// - Coordinates sidebar (mobile drawer + desktop collapse)
// - Applies responsive left margin according to collapse state
// - Keeps scroll only in main content area
// - Persists collapse preference
// ---------------------------------------------------------------------------

export const LayoutDashboard = ({ children }) => {
  // Mobile drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Desktop collapse (persisted)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return JSON.parse(localStorage.getItem("sidebar:collapsed") || "false");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar:collapsed", JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (fixed) */}
      <SidebarDashboard
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((v) => !v)}
        collapsed={isCollapsed}
        onCollapseToggle={() => setIsCollapsed((c) => !c)}
      />

      {/* Main column */}
      <div
        className={`
          flex min-h-screen flex-1 flex-col
          transition-[margin] duration-300 ease-in-out
          ${isCollapsed ? "lg:ml-20" : "lg:ml-80"}
        `}
      >
        <NavbarDashboard onMenuClick={() => setIsSidebarOpen((v) => !v)} />
        {/* Scroll only here */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
