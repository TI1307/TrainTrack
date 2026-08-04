// frontend/src/components/common/DataTable.tsx
import React, { useState } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  searchValue?: (item: T) => string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T | ((item: T) => string | number);
  isLoading?: boolean;
  searchPlaceholder?: string;
  actions?: (item: T) => React.ReactNode;
  headerActions?: React.ReactNode;
  emptyText?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  isLoading = false,
  searchPlaceholder = 'بحث...',
  actions,
  headerActions,
  emptyText = 'لا توجد بيانات متاحة حالياً',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const getKey = (item: T): string | number => {
    if (typeof keyField === 'function') {
      return keyField(item);
    }
    return String(item[keyField]);
  };

  const filteredData = data.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return columns.some((col) => {
      if (col.searchValue) {
        return col.searchValue(item).toLowerCase().includes(query);
      }
      const val = (item as Record<string, unknown>)[col.key];
      if (val !== undefined && val !== null) {
        return String(val).toLowerCase().includes(query);
      }
      return false;
    });
  });

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
      }}
    >
      {/* Table Toolbar */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        }}
      >
        <div style={{ flex: 1, minWidth: '220px', maxWidth: '380px' }}>
          <input
            type="text"
            className="tt-input"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.875rem',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: '#F8FAFC',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </div>
        {headerActions && <div>{headerActions}</div>}
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '0.875rem 1.25rem',
                    color: '#94A3B8',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th
                  style={{
                    padding: '0.875rem 1.25rem',
                    color: '#94A3B8',
                    fontWeight: 600,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  الإجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}
                >
                  <div style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                    <span className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></span>
                  </div>
                  <div>جاري تحميل البيانات...</div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={getKey(item)}
                  style={{
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: '0.875rem 1.25rem',
                        color: '#E2E8F0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '-')}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
