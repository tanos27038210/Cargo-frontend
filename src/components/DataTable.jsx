import { useLanguage } from '../context/LanguageContext';

function DataTable({
                       columns,
                       rows,
                       loading,
                       sortBy,
                       sortDir,
                       onSort,
                       page,
                       totalPages,
                       onPageChange,
                       emptyText,
                   }) {
    const { t } = useLanguage();

    return (
        <div>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={col.sortable ? 'sortable' : ''}
                                onClick={col.sortable ? () => onSort(col.key) : undefined}
                            >
                                {col.title}
                                {sortBy === col.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={columns.length} className="table-message">{t('table.loading')}</td>
                        </tr>
                    )}
                    {!loading && rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="table-message">
                                {emptyText ?? t('table.empty')}
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        rows.map((row) => (
                            <tr key={row.id}>
                                {columns.map((col) => (
                                    <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button onClick={() => onPageChange(page - 1)} disabled={page === 0 || loading}>
                    {t('table.back')}
                </button>
                <span>
          {t('table.page', { page: page + 1, total: Math.max(totalPages, 1) })}
        </span>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page + 1 >= totalPages || loading}
                >
                    {t('table.next')}
                </button>
            </div>
        </div>
    );
}

export default DataTable;