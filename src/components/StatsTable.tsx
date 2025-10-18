'use client';
import React, { useMemo, useState } from 'react';

/*
  StatsTable (Bootstrap)
  - rows: array of objects to render; expected fields: category, amount, note (but generic)
  - Provides: sortable columns, basic pagination, responsive bootstrap table
  - Usage: <StatsTable rows={expenseRows} pageSize={5} />
*/

type Row = { [key: string]: any };

type Props = {
  rows?: Row[];
  pageSize?: number;
};

export default function StatsTable({ rows = [], pageSize = 5 }: Props) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // derive columns from first row (fallback to known columns)
  const columns = useMemo(() => {
    if (rows.length === 0) return ['category', 'amount', 'note'];
    return Object.keys(rows[0]);
  }, [rows]);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-light sticky-top">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort(col)}
              >
                {col.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                {sortKey === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {current.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-muted small p-3">
                No data available
              </td>
            </tr>
          ) : (
            current.map((r, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col}>
                    {/* simple formatting for currency-like values */}
                    {typeof r[col] === 'number'
                      ? r[col].toLocaleString()
                      : String(r[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="d-flex justify-content-between align-items-center mt-2">
        <div className="small text-muted">
          Showing {sorted.length === 0 ? 0 : (page - 1) * pageSize + 1} -
          {Math.min(page * pageSize, sorted.length)} of {sorted.length}
        </div>

        <div>
          <button
            className="btn btn-sm btn-outline-secondary me-1"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            First
          </button>
          <button
            className="btn btn-sm btn-outline-secondary me-1"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="mx-1">{page} / {totalPages}</span>
          <button
            className="btn btn-sm btn-outline-secondary ms-1"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
          <button
            className="btn btn-sm btn-outline-secondary ms-1"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}