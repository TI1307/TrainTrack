// frontend/src/components/common/Layout.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import appIcon from '../../assets/icon.png';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const allNavItems = [
  { path: '/', label: 'الرئيسية والإحصائيات' },
  { path: '/stations', label: 'المحطات' },
  { path: '/trains', label: 'أسطول القطارات' },
  { path: '/wilayas', label: 'الولايات' },
  { path: '/admin-users', label: 'حسابات الأدمن', superAdminOnly: true },
  { path: '/lines', label: 'الخطوط والمسارات' },
  { path: '/trips', label: 'الرحلات المُبرمجة' },
  { path: '/scheduler', label: 'جدول مواعيد الرحلات' },
  { path: '/notices', label: 'الإشعارات والتنبيهات' },
  { path: '/ticket-config', label: 'أسعار التذاكر والحاسبة' },
];

const navItems = allNavItems.filter((item) => !item.superAdminOnly || user?.role === 'super_admin');
  const getCurrentTitle = () => {
    const item = navItems.find((n) => n.path === location.pathname);
    return item ? item.label : 'لوحة التحكم';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Tajawal', system-ui, -apple-system, sans-serif",
        background: 'radial-gradient(circle at 30% 20%, #101E3B 0%, #0A1428 55%, #060B18 100%)',
        color: '#F8FAFC',
        direction: 'rtl',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
        
        * {
          box-sizing: border-box;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner {
          display: inline-block;
          border: 3px solid rgba(255,255,255,0.25);
          border-radius: 50%;
          border-top-color: #3B82F6;
          animation: spin 0.6s linear infinite;
        }

        .tt-input, .tt-select, .tt-textarea {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .tt-input:focus, .tt-select:focus, .tt-textarea:focus {
          outline: none;
          border-color: #3B82F6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
        }
        .tt-input.error, .tt-select.error, .tt-textarea.error {
          border-color: #ef4444 !important;
        }

        .nav-link-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #94A3B8;
          text-decoration: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .nav-link-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #F8FAFC;
        }
        .nav-link-item.active {
          background: #2563EB;
          color: #FFFFFF;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
        }

        @media (max-width: 900px) {
          .tt-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 99;
            transform: translateX(${isSidebarOpen ? '0' : '100%'});
            transition: transform 0.3s ease;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>

      {/* Sidebar */}
      <aside
        className="tt-sidebar"
        style={{
          width: '260px',
          backgroundColor: 'rgba(10, 20, 40, 0.92)',
          borderLeft: '1px solid rgba(148, 163, 184, 0.15)',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.5rem 1.5rem 0.5rem',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            marginBottom: '1.25rem',
          }}
        >
          <img
            src={appIcon}
            alt="TrainTrack"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              display: 'block',
            }}
          />
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#F8FAFC', letterSpacing: '-0.5px' }}>
              TrainTrack
            </h1>
            <span style={{ fontSize: '0.725rem', color: '#60A5FA', fontWeight: 600 }}>لوحة إدارة القطارات</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link-item${isActive ? ' active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info / Logout Footer */}
        <div
          style={{
            paddingTop: '1rem',
            marginTop: '1rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60A5FA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                flexShrink: 0,
              }}
            >
              {user?.username ? user.username[0].toUpperCase() : 'A'}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E2E8F0' }}>
                {user?.username || 'المشرف'}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748B' }}>مسؤول النظام</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="تسجيل الخروج"
            style={{
              background: 'none',
              border: '1px solid rgba(248, 113, 113, 0.25)',
              color: '#F87171',
              cursor: 'pointer',
              fontSize: '0.75rem',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            خروج
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <header
          style={{
            height: '70px',
            padding: '0 2rem',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(10, 20, 40, 0.6)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#F8FAFC',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              ≡
            </button>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
              {getCurrentTitle()}
            </h2>
          </div>

        </header>

        {/* Main Body */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>{children}</main>
      </div>
    </div>
  );
};
