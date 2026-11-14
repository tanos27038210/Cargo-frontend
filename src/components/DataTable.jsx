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
                       emptyText = 'No data',
                   }) {
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
                            <td colSpan={columns.length} className="table-message">Loading...</td>
                        </tr>
                    )}
                    {!loading && rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="table-message">{emptyText}</td>
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
                    Back
                </button>
                <span>
          Page {page + 1} из {Math.max(totalPages, 1)}
        </span>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page + 1 >= totalPages || loading}
                >
                    Forward
                </button>
            </div>
        </div>
    );
}

export default DataTable;