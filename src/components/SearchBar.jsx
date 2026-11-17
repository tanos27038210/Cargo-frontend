import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

function SearchBar({ onSearch, placeholder }) {
    const { t } = useLanguage();
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
                placeholder={placeholder ?? t('search.placeholder')}
                onChange={(e) => setText(e.target.value)}
            />
            <button type="submit">{t('search.submit')}</button>
            <button type="button" className="secondary" onClick={handleReset}>
                {t('search.reset')}
            </button>
        </form>
    );
}

export default SearchBar;