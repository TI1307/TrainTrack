// frontend/pages/Dashboard.tsx
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../src/components/common/StatCard';
import { ErrorMessage } from '../src/components/common/ErrorMessage';
import { useDashboardStats } from '../src/hooks/useDashboardStats';

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, isLoading, error , clearError} = useDashboardStats();

  const statItems = [
    { title: 'إجمالي المحطات', value: stats.stations, color: '#3B82F6', path: '/stations', subtitle: 'محطات السكك عبر الولايات' },
    { title: 'أسطول القطارات', value: stats.trains, color: '#10B981', path: '/trains', subtitle: 'القطارات الفعالة والقاطرات' },
    { title: 'الخطوط والمسارات', value: stats.lines, color: '#8B5CF6', path: '/lines', subtitle: 'خطوط السكك ومحطاتها' },
    { title: 'الولايات المخدومة', value: stats.wilayas, color: '#F59E0B', path: '/wilayas', subtitle: 'المناطق والولايات الإدارية' },
    { title: 'الإشعارات والتنبيهات', value: stats.notices, color: '#EF4444', path: '/notices', subtitle: 'إعلانات الخدمة والتنبيها' },
    { title: 'حسابات المشرفين', value: stats.admins, color: '#64748B', path: '/admin-users', subtitle: 'أدمن النظام والمسؤولين' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#F8FAFC' }}>
          نظرة عامة والإحصائيات
        </h1>
        <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.95rem' }}>
          مرحباً بك في لوحة تحكم شبكة القطارات الوطنية TrainTrack
        </p>
      </div>

      <ErrorMessage error={error} onClear={clearError} />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8' }}>
          <span className="spinner" style={{ width: '32px', height: '32px', marginBottom: '1rem' }}></span>
          <div>جاري تحميل الإحصائيات...</div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            {statItems.map((item) => (
              <StatCard
                key={item.title}
                title={item.title}
                value={item.value}
                color={item.color}
                subtitle={item.subtitle}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>

          {/* Quick Actions Panel */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#CBD5E1' }}>
              الوصول السريع
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/stations')}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                إضافة محطة
              </button>

              <button
                onClick={() => navigate('/lines')}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                إدارة الخطوط
              </button>

              <button
                onClick={() => navigate('/trips')}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                برمجة رحلة
              </button>

              <button
                onClick={() => navigate('/ticket-config')}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                حاسبة الأسعار
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
