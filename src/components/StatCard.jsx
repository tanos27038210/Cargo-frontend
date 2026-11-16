function StatCard({title, value, tone = 'default'}) {
    return (
        <div className={`stat-card stat-${tone}`}>
            <div className="status-title">{title}</div>
            <div className="stat-value">{value}</div>
        </div>
    );
}

export default StatCard;