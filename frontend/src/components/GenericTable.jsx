import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import './GenericTable.scss';

const GenericTable = ({ columns, data }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const visibleColumns = columns.filter(col => {
    if (!col.hideWhenEmpty || data.length === 0) return true;
    return data.some(row => {
      const val = col.accessor ? row[col.accessor] : null;
      return val != null && val !== '';
    });
  });

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (col) => {
    if (!col.accessor) return;
    if (sortKey === col.accessor) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(col.accessor);
      setSortDir('asc');
    }
  };

  return (
    <div className="generic-table-container">
      <table className="generic-table">
        <thead>
          <tr>
            {visibleColumns.map((col, index) => {
              const isSortable = !!col.accessor;
              const isActive = sortKey === col.accessor;
              return (
                <th
                  key={index}
                  className={isSortable ? 'sortable' : ''}
                  onClick={() => handleSort(col)}
                >
                  <span className="th-content">
                    {col.header}
                    {isSortable && (
                      <span className={`sort-icon${isActive ? ' sort-icon--active' : ''}`}>
                        {isActive
                          ? sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                          : <ChevronsUpDown size={13} />
                        }
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length > 0 ? (
            sortedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {visibleColumns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhum dado encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default GenericTable;
