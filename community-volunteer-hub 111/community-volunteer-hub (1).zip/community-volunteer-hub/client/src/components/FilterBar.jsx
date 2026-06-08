function FilterBar({ filters, onFilterChange }) {
  return (
    <div className="filters-bar">
      
      
      <div className="search-wrap">
        <span className="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Search requests..."
          value={filters.search}
          onChange={e => onFilterChange("search", e.target.value)}
        />
      </div>

      
      <select
        className="filter-select"
        value={filters.category}
        onChange={e => onFilterChange("category", e.target.value)}>
        <option value="">All Categories</option>
        <option value="Home Tasks">Home Tasks</option>
        <option value="IT Repair">IT Repair</option>
        <option value="Gardening">Gardening</option>
        <option value="Tutoring">Tutoring</option>
        <option value="Pet Care">Pet Care</option>
        <option value="Transportation">Transportation</option>
        <option value="Other">Other</option>
      </select>

      
      <select
        className="filter-select"
        value={filters.status}
        onChange={e => onFilterChange("status", e.target.value)}>
        <option value="">All Statuses</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
      </select>

     
      <select
        className="filter-select"
        value={filters.requestType}
        onChange={e => onFilterChange("requestType", e.target.value)}>
        <option value="">All Types</option>
        <option value="online">🌐 Online</option>
        <option value="in-person">📍 In-Person</option>
      </select>

    </div>
  );
}

export default FilterBar;