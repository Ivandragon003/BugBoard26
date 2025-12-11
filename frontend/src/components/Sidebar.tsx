import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const isAdmin = authService.isAdmin();
  const currentPath = location.pathname;

  // Rileva se siamo su mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Su desktop apri sidebar, su mobile chiudi
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [setSidebarOpen]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path: string) => currentPath === path;
  const showIndicator = (itemName: string) => isActive(`/${itemName}`) || hoveredItem === itemName;

  // Chiudi sidebar dopo click su mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* PULSANTE HAMBURGER (solo mobile) */}
      {isMobile && (
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={styles.hamburgerBtn}
          aria-label="Menu"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      )}

      {/* OVERLAY SCURO (solo mobile quando aperto) */}
      {isMobile && sidebarOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarClosed : ''}`}>
        <div className={styles.divider} />
        
        <div className={styles.header}>
          <div className={styles.brandContainer}>
            <div className={styles.logo}>BB</div>
            <div className={styles.brandInfo}>
              <div className={styles.brandName}>BugBoard</div>
              <div className={styles.brandSubtitle}>Dashboard</div>
            </div>
          </div>
          
          <nav className={styles.nav}>
            <a 
              href="/home" 
              className={`${styles.navItem} ${isActive('/home') ? styles.navItemActive : ''}`}
              onMouseEnter={() => setHoveredItem('home')}
              onMouseLeave={() => setHoveredItem('')}
              onClick={handleLinkClick}
            >
              {showIndicator('home') && <div className={styles.navItemIndicator} />}
              <span className={styles.navItemIcon}>📊</span>
              <span>Dashboard</span>
            </a>

            <a 
              href="/issues" 
              className={`${styles.navItem} ${isActive('/issues') ? styles.navItemActive : ''}`}
              onMouseEnter={() => setHoveredItem('issues')}
              onMouseLeave={() => setHoveredItem('')}
              onClick={handleLinkClick}
            >
              {showIndicator('issues') && <div className={styles.navItemIndicator} />}
              <span className={styles.navItemIcon}>📋</span>
              <span>Lista Issue</span>
            </a>

            <a 
              href="/issues/nuova" 
              className={`${styles.navItem} ${isActive('/issues/nuova') ? styles.navItemActive : ''}`}
              onMouseEnter={() => setHoveredItem('nuova')}
              onMouseLeave={() => setHoveredItem('')}
              onClick={handleLinkClick}
            >
              {showIndicator('nuova') && <div className={styles.navItemIndicator} />}
              <span className={styles.navItemIcon}>➕</span>
              <span>Nuova Issue</span>
            </a>

            {isAdmin && (
              <a 
                href="/issues/archiviate" 
                className={`${styles.navItem} ${isActive('/issues/archiviate') ? styles.navItemActive : ''}`}
                onMouseEnter={() => setHoveredItem('archiviate')}
                onMouseLeave={() => setHoveredItem('')}
                onClick={handleLinkClick}
              >
                {showIndicator('archiviate') && <div className={styles.navItemIndicator} />}
                <span className={styles.navItemIcon}>📦</span>
                <span>Archiviate</span>
              </a>
            )}

            {isAdmin && (
              <a 
                href="/crea-utenza" 
                className={`${styles.navItem} ${isActive('/crea-utenza') ? styles.navItemActive : ''}`}
                onMouseEnter={() => setHoveredItem('crea-utenza')}
                onMouseLeave={() => setHoveredItem('')}
                onClick={handleLinkClick}
              >
                {showIndicator('crea-utenza') && <div className={styles.navItemIndicator} />}
                <span className={styles.navItemIcon}>👥</span>
                <span>Crea Utenza</span>
              </a>
            )}

            {isAdmin && (
              <a 
                href="/utenti" 
                className={`${styles.navItem} ${isActive('/utenti') ? styles.navItemActive : ''}`}
                onMouseEnter={() => setHoveredItem('utenti')}
                onMouseLeave={() => setHoveredItem('')}
                onClick={handleLinkClick}
              >
                {showIndicator('utenti') && <div className={styles.navItemIndicator} />}
                <span className={styles.navItemIcon}>👨‍💼</span>
                <span>Gestione Utenti</span>
              </a>
            )}
          </nav>
        </div>
        
        <div className={styles.spacer} />
        
        <div className={styles.footer}>
          <a 
            href="/profilo" 
            className={`${styles.profileItem} ${isActive('/profilo') ? styles.profileItemActive : ''}`}
            onMouseEnter={() => setHoveredItem('profilo')}
            onMouseLeave={() => setHoveredItem('')}
            onClick={handleLinkClick}
          >
            {showIndicator('profilo') && <div className={styles.navItemIndicator} />}
            <span className={styles.navItemIcon}>👤</span>
            <span>Profilo</span>
          </a>

          <button 
            onClick={handleLogout}
            className={styles.logoutButton}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem('')}
          >
            {hoveredItem === 'logout' && <div className={styles.navItemIndicator} />}
            <span className={styles.navItemIcon}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
