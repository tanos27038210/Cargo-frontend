import { useState } from 'react';

function SearchBar({ onSearch, placeholder = 'Search...' }) {
    const [text, setText] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        onSearch(text.trim());
    };

    const handleReset = () => {
        setText('');
        onSearch('');
    };

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <input
                type="text"
                value={text}
                placeholder={placeholder}
                onChange={(e) => setText(e.target.value)}
            />
            <button type="submit">Find</button>
            <button type="button" className="secondary" onClick={handleReset}>
                Reset
            </button>
        </form>
    );
}

export default SearchBar;