import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState("");
  const isAdmin = authService.isAdmin();
  const currentPath = location.pathname;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{
      width: sidebarOpen ? "200px" : "0",
      backgroundColor: "#0d9488",
      transition: "width 0.3s",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      position: "sticky",  // ← CAMBIATO: da relative a sticky
      top: 0,              // ← AGGIUNTO
      height: "100vh",     // ← AGGIUNTO: forza altezza 100% viewport
      overflowY: "auto"    // ← AGGIUNTO: scroll se contenuto troppo lungo
    }}>
      {/* Linea verticale di separazione sul bordo destro */}
      <div style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "2px",
        backgroundColor: "rgba(255,255,255,0.3)"
      }} />
      
      <div style={{ padding: "20px", color: "white" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "10px",
          marginBottom: "20px",
          paddingBottom: "20px",
          borderBottom: "2px solid rgba(255,255,255,0.25)"
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            backgroundColor: "white",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            color: "#0d9488",
            fontSize: "14px"
          }}>
            BB
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>BugBoard</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Dashboard</div>
          </div>
        </div>
        
        <nav>
          <a 
            href="/home" 
            style={{ 
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px", 
              color: currentPath === "/home" ? "white" : "rgba(255,255,255,0.7)",
              textDecoration: "none",
              borderRadius: "6px",
              backgroundColor: currentPath === "/home" ? "rgba(255,255,255,0.25)" : (hoveredItem === "dashboard" ? "rgba(255,255,255,0.1)" : "transparent"),
              marginBottom: "6px",
              fontSize: "13px",
              fontWeight: currentPath === "/home" ? 600 : 400,
              transition: "background-color 0.2s",
              position: "relative"
            }}
            onMouseEnter={() => setHoveredItem("dashboard")}
            onMouseLeave={() => setHoveredItem("")}
          >
            {(currentPath === "/home" || hoveredItem === "dashboard") && (
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                backgroundColor: "white",
                borderRadius: "0 3px 3px 0"
              }} />
            )}
            <span style={{ fontSize: "16px" }}>📊</span> Dashboard
          </a>
          <a 
            href="/issues" 
            style={{ 
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px", 
              color: currentPath === "/issues" ? "white" : "rgba(255,255,255,0.7)",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: currentPath === "/issues" ? 600 : 400,
              backgroundColor: currentPath === "/issues" ? "rgba(255,255,255,0.25)" : (hoveredItem === "lista" ? "rgba(255,255,255,0.1)" : "transparent"),
              transition: "all 0.2s",
              position: "relative",
              marginBottom: "6px"
            }}
            onMouseEnter={() => setHoveredItem("lista")}
            onMouseLeave={() => setHoveredItem("")}
          >
            {(currentPath === "/issues" || hoveredItem === "lista") && (
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                backgroundColor: "white",
                borderRadius: "0 3px 3px 0"
              }} />
            )}
            <span style={{ fontSize: "16px" }}>📋</span> Lista Issue
          </a>
          <a 
            href="/issues/nuova" 
            style={{ 
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px", 
              color: currentPath === "/issues/nuova" ? "white" : "rgba(255,255,255,0.7)",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: currentPath === "/issues/nuova" ? 600 : 400,
              backgroundColor: currentPath === "/issues/nuova" ? "rgba(255,255,255,0.25)" : (hoveredItem === "nuova" ? "rgba(255,255,255,0.1)" : "transparent"),
              transition: "all 0.2s",
              position: "relative",
              marginBottom: "6px"
            }}
            onMouseEnter={() => setHoveredItem("nuova")}
            onMouseLeave={() => setHoveredItem("")}
          >
            {(currentPath === "/issues/nuova" || hoveredItem === "nuova") && (
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                backgroundColor: "white",
                borderRadius: "0 3px 3px 0"
              }} />
            )}
            <span style={{ fontSize: "16px" }}>➕</span> Nuova Issue
          </a>

          {/* Link CreaUtenza - SOLO PER ADMIN */}
          {isAdmin && (
            <a 
              href="/crea-utenza" 
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px", 
                color: currentPath === "/crea-utenza" ? "white" : "rgba(255,255,255,0.7)",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: currentPath === "/crea-utenza" ? 600 : 400,
                backgroundColor: currentPath === "/crea-utenza" ? "rgba(255,255,255,0.25)" : (hoveredItem === "crea-utenza" ? "rgba(255,255,255,0.1)" : "transparent"),
                transition: "all 0.2s",
                position: "relative",
                marginBottom: "6px"
              }}
              onMouseEnter={() => setHoveredItem("crea-utenza")}
              onMouseLeave={() => setHoveredItem("")}
            >
              {(currentPath === "/crea-utenza" || hoveredItem === "crea-utenza") && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  backgroundColor: "white",
                  borderRadius: "0 3px 3px 0"
                }} />
              )}
              <span style={{ fontSize: "16px" }}>👥</span> Crea Utenza
            </a>
          )}
        </nav>
      </div>
      
      {/* Spacer per spingere profilo/logout in basso */}
      <div style={{ flex: 1 }} />
      
      <div style={{ 
        padding: "20px", 
        borderTop: "2px solid rgba(255,255,255,0.25)",
        color: "white"
      }}>
        <a 
          href="/profilo" 
          style={{ 
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: currentPath === "/profilo" ? "white" : "rgba(255,255,255,0.7)",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: currentPath === "/profilo" ? 600 : 400,
            marginBottom: "6px",
            padding: "8px 12px",
            borderRadius: "6px",
            backgroundColor: currentPath === "/profilo" ? "rgba(255,255,255,0.25)" : (hoveredItem === "profilo" ? "rgba(255,255,255,0.1)" : "transparent"),
            transition: "all 0.2s",
            position: "relative"
          }}
          onMouseEnter={() => setHoveredItem("profilo")}
          onMouseLeave={() => setHoveredItem("")}
        >
          {(currentPath === "/profilo" || hoveredItem === "profilo") && (
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              backgroundColor: "white",
              borderRadius: "0 3px 3px 0"
            }} />
          )}
          <span style={{ fontSize: "16px" }}>👤</span> Profilo
        </a>
        <button 
          onClick={handleLogout}
          style={{ 
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "rgba(255,255,255,0.7)",
            textDecoration: "none",
            fontSize: "13px",
            padding: "8px 12px",
            borderRadius: "6px",
            backgroundColor: hoveredItem === "logout" ? "rgba(255,255,255,0.1)" : "transparent",
            transition: "all 0.2s",
            position: "relative",
            cursor: "pointer",
            border: "none",
            width: "100%",
            textAlign: "left"
          }}
          onMouseEnter={() => setHoveredItem("logout")}
          onMouseLeave={() => setHoveredItem("")}
        >
          {hoveredItem === "logout" && (
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              backgroundColor: "white",
              borderRadius: "0 3px 3px 0"
            }} />
          )}
          <span style={{ fontSize: "16px" }}>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}
