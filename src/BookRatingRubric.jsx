import React, { useState, useEffect } from 'react';
import './BookRatingRubric.css';

function BookRatingRubric() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bookInfo, setBookInfo] = useState({ title: '', author: '', coverUrl: '' });
  const [scores, setScores] = useState({
    writing: null,
    emotional: null,
    plot: null,
    worldBuilding: null,
    pacing: null,
    bonus: false
  });
  const [sparkles, setSparkles] = useState([]);
  const [showStars, setShowStars] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Search Open Library API (no API key needed!)
  const searchBooks = async (query) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodedQuery}&limit=5&fields=title,author_name,cover_i`
      );
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      if (data.docs && data.docs.length > 0) {
        const results = data.docs
          .filter(item => item.title) // Filter out items without titles
          .map(item => ({
            title: item.title,
            author: item.author_name ? item.author_name[0] : 'Unknown Author',
            coverUrl: item.cover_i ? 
              `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : 
              null
          }));
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    // Don't search if we just selected a book (check if title exactly matches a result)
    const matchesResult = searchResults.some(r => r.title === bookInfo.title);
    if (matchesResult) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      if (bookInfo.title) {
        searchBooks(bookInfo.title);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [bookInfo.title]);

  const selectBook = (book) => {
    setBookInfo({
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl || ''
    });
    setSearchResults([]);
    setShowDropdown(false);
  };

  const categories = [
    { 
      id: 'bookInfo', 
      title: 'Book Information', 
      max: null,
      type: 'info'
    },
    { 
      id: 'writing', 
      title: 'Beautiful Writing', 
      max: 5,
      explainers: [
        "The writing was poor, awkward, or hard to follow.",
        "Below average; the writing had issues like clunkiness or distracting style but wasn't terrible.",
        "Just fine; the writing was clear and serviceable but not notable.",
        "Good; the prose was smooth, competent, and effective, with some strong moments.",
        "Great; the writing was enjoyable and well-crafted, with passages of beauty or elegance.",
        "Exceptional; the writing was captivating, artful, & a pleasure to read."
      ]
    },
    { 
      id: 'emotional', 
      title: 'Emotional Impact', 
      max: 5,
      explainers: [
        "No impact; it didn't move me emotionally or stimulate my thoughts.",
        "Below average; slight moments of emotional or intellectual engagement, but largely forgettable.",
        "Somewhat impactful; it had moments that were thought-provoking or emotionally resonant.",
        "Good; it made me feel or think in a meaningful way.",
        "Great; it was emotionally or intellectually stimulating throughout, with strong moments.",
        "Exceptional; deeply affecting, thought-provoking, or moving—left a lasting impression."
      ]
    },
    { 
      id: 'plot', 
      title: 'Plot & Twists', 
      max: 4,
      explainers: [
        "The plot was unengaging, predictable, or flat.",
        "Below average; some interesting moments, but not consistently compelling.",
        "Solid; the plot was engaging with a few enjoyable twists or surprises.",
        "Very engaging; the story kept me hooked, with well-executed twists or turns.",
        "Outstanding; full of exciting twists, surprises, or intricacies that made the story stand out."
      ]
    },
    { 
      id: 'worldBuilding', 
      title: 'World Building & Setting', 
      max: 3,
      explainers: [
        "The world or setting was poorly developed, confusing, or unconvincing.",
        "Below average; the setting was functional but didn't add much to the story.",
        "Good; the setting was interesting, providing a nice backdrop to the story.",
        "Excellent; the world was immersive, detailed, and added significantly to the reading experience."
      ]
    },
    { 
      id: 'pacing', 
      title: 'Pacing', 
      max: 3,
      explainers: [
        "The pacing was frustrating—either too slow or rushed.",
        "The pacing was fine—neither a strength nor a weakness.",
        "The pacing was well-balanced and engaging throughout.",
        "Perfectly paced; kept the story engaging and maintained strong momentum throughout."
      ]
    },
    { 
      id: 'bonus', 
      title: 'Resonance Bonus', 
      max: 1,
      type: 'bonus',
      description: "This point is for books that resonate on a personal level, leave a lasting impression, or feel special in an important but sometimes immaterial way."
    },
    { 
      id: 'summary', 
      title: 'Rating Complete', 
      type: 'summary'
    }
  ];

  const currentCategory = categories[currentSlide];
  const totalSlides = categories.length;

  const handleScore = (categoryId, value) => {
    setScores(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleBonusToggle = () => {
    const newValue = !scores.bonus;
    setScores(prev => ({ ...prev, bonus: newValue }));
    
    if (newValue) {
      const newSparkles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        angle: (360 / 12) * i
      }));
      setSparkles(newSparkles);
      
      setTimeout(() => setSparkles([]), 1000);
    }
  };

  const calculateRating = () => {
    const total = (scores.writing || 0) + (scores.emotional || 0) + 
                  (scores.plot || 0) + (scores.worldBuilding || 0) + 
                  (scores.pacing || 0) + (scores.bonus ? 1 : 0);
    const rating = total / 4;
    const stars = Math.round(rating);
    return { total, rating: rating.toFixed(1), stars };
  };

  useEffect(() => {
    if (currentSlide === totalSlides - 1) {
      setShowStars(false);
      setTimeout(() => setShowStars(true), 300);
    }
  }, [currentSlide, totalSlides]);

  // Set slider to middle value when first entering a rating category
  useEffect(() => {
    if (currentCategory.type !== 'info' && 
        currentCategory.type !== 'summary' && 
        currentCategory.type !== 'bonus' && 
        scores[currentCategory.id] === null) {
      setScores(prev => ({ ...prev, [currentCategory.id]: Math.floor(currentCategory.max / 2) }));
    }
  }, [currentSlide]);

  const { total, rating, stars } = calculateRating();

  return (
    <div className="rubric-container">
      <div className="rubric-content">
        {/* Header with Progress */}
        <div className="rubric-header">
          <h1>Book Rating Rubric</h1>
          
          <div className="progress-counter">
            <span className="current">{currentSlide + 1}</span>
            <span className="separator">/</span>
            <span>{totalSlides}</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="main-card">
          {/* Book Info Slide */}
          {currentCategory.type === 'info' && (
            <div className="slide-content gradient-bg">
              <h2>{currentCategory.title}</h2>

              <div className="book-info-form">
                <div className="form-group search-group">
                  <label>Book Title & Author</label>
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      value={bookInfo.title}
                      onChange={(e) => setBookInfo(prev => ({ ...prev, title: e.target.value }))}
                      onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                      placeholder="e.g. 1984 George Orwell"
                    />
                    {isSearching && <span className="searching-indicator">Searching...</span>}
                  </div>
                  
                  {/* Dropdown Results */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="search-dropdown">
                      {searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectBook(result)}
                          className="search-result"
                          type="button"
                        >
                          {result.coverUrl && (
                            <img src={result.coverUrl} alt="" className="result-cover" />
                          )}
                          <div className="result-info">
                            <div className="result-title">{result.title}</div>
                            <div className="result-author">by {result.author}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Book Cover</label>
                  <div className="cover-preview">
                    <img 
                      src={bookInfo.coverUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="225" viewBox="0 0 150 225"%3E%3Crect fill="%23333" width="150" height="225"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="16" dy=".3em"%3ENo Cover%3C/text%3E%3C/svg%3E'} 
                      alt="Book cover" 
                    />
                  </div>
                  <input
                    type="text"
                    value={bookInfo.coverUrl}
                    onChange={(e) => setBookInfo(prev => ({ ...prev, coverUrl: e.target.value }))}
                    placeholder="Paste image URL (optional)"
                  />
                </div>

                <button
                  onClick={() => setCurrentSlide(currentSlide + 1)}
                  disabled={!bookInfo.title}
                  className="start-button"
                >
                  Start Rating →
                </button>
              </div>
            </div>
          )}

          {/* Rating Slides */}
          {currentCategory.type !== 'info' && currentCategory.type !== 'summary' && currentCategory.type !== 'bonus' && (
            <div className="slide-content gradient-bg">
              <div className="category-header">
                <div className="points-label">0-{currentCategory.max} points</div>
                <h3>{currentCategory.title}</h3>
              </div>

              <div className="score-display">
                <div className="score-number">{scores[currentCategory.id]}</div>
                <div className="score-explainer">
                  {currentCategory.explainers[scores[currentCategory.id]]}
                </div>
              </div>

              <div className="slider-container">
                <div className="slider-labels">
                  {Array.from({ length: currentCategory.max + 1 }, (_, i) => (
                    <span 
                      key={i}
                      className={scores[currentCategory.id] === i ? 'active' : ''}
                    >
                      {i}
                    </span>
                  ))}
                </div>

                <input
                  type="range"
                  min="0"
                  max={currentCategory.max}
                  value={scores[currentCategory.id]}
                  onChange={(e) => handleScore(currentCategory.id, Number(e.target.value))}
                  className="slider"
                  style={{
                    background: `linear-gradient(to right, #a8e6a3 0%, #a8e6a3 ${(scores[currentCategory.id] / currentCategory.max) * 100}%, #444 ${(scores[currentCategory.id] / currentCategory.max) * 100}%, #444 100%)`
                  }}
                />
              </div>

              <div className="helper-text">
                Drag the slider or click to select your rating
              </div>
            </div>
          )}

          {/* Bonus Point Slide */}
          {currentCategory.type === 'bonus' && (
            <div className="slide-content gradient-bg">
              <div className="category-header">
                <div className="points-label">BONUS POINT</div>
                <h3>{currentCategory.title}</h3>
              </div>

              <div className="bonus-content">
                <p className="bonus-description">{currentCategory.description}</p>

                <div className="bonus-button-container">
                  <button
                    onClick={() => {
                      handleBonusToggle();
                      setTimeout(() => setCurrentSlide(currentSlide + 1), 600);
                    }}
                    className={`bonus-button ${scores.bonus ? 'active' : ''}`}
                  >
                    {scores.bonus ? '✓ Bonus Added (+1)' : 'Add Bonus Point'}
                  </button>

                  {sparkles.map((sparkle) => {
                    const radians = (sparkle.angle * Math.PI) / 180;
                    const distance = 80;
                    const tx = Math.cos(radians) * distance;
                    const ty = Math.sin(radians) * distance;
                    
                    return (
                      <div
                        key={sparkle.id}
                        className="sparkle"
                        style={{
                          '--tx': `${tx}px`,
                          '--ty': `${ty}px`,
                        }}
                      >
                        ✨
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="helper-text">
                Click to add the bonus point
              </div>
            </div>
          )}

          {/* Summary Slide */}
          {currentCategory.type === 'summary' && (
            <div className="slide-content gradient-bg summary-slide">
              <div className="summary-label">{currentCategory.title}</div>
              
              {bookInfo.coverUrl && (
                <div className="summary-cover">
                  <img src={bookInfo.coverUrl} alt="Book cover" />
                </div>
              )}
              
              <div className="book-title">{bookInfo.title}</div>
              <div className="book-author">by {bookInfo.author}</div>

              <div className="final-rating">{rating}</div>

              <div className="star-rating">
                {showStars && Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className="star"
                    style={{
                      animationDelay: `${i * 0.15}s`
                    }}
                  >
                    {i < stars ? '⭐' : '☆'}
                  </span>
                ))}
              </div>

              <div className="score-breakdown">
                <div>Beautiful Writing: {scores.writing}</div>
                <div>Emotional Impact: {scores.emotional}</div>
                <div>Plot & Twists: {scores.plot}</div>
                <div>World Building: {scores.worldBuilding}</div>
                <div>Pacing: {scores.pacing}</div>
                <div>Bonus: {scores.bonus ? '✓' : '✗'}</div>
              </div>

              <div className="export-section">
                <div className="export-title">Export to Notion</div>
                <div className="export-description">
                  Copy this data and paste into your Notion database:
                </div>
                <button
                  onClick={() => {
                    const notionData = `Title: ${bookInfo.title}\nAuthor: ${bookInfo.author}\nRating: ${rating}\nTotal: ${total}/21\nWriting: ${scores.writing}\nEmotional: ${scores.emotional}\nPlot: ${scores.plot}\nWorld Building: ${scores.worldBuilding}\nPacing: ${scores.pacing}\nBonus: ${scores.bonus ? 'Yes' : 'No'}`;
                    navigator.clipboard.writeText(notionData);
                    alert('Copied to clipboard!');
                  }}
                  className="copy-button"
                >
                  📋 Copy to Clipboard
                </button>
              </div>

              <button
                onClick={() => {
                  setCurrentSlide(0);
                  setBookInfo({ title: '', author: '', coverUrl: '' });
                  setScores({
                    writing: null,
                    emotional: null,
                    plot: null,
                    worldBuilding: null,
                    pacing: null,
                    bonus: false
                  });
                }}
                className="reset-button"
              >
                Rate Another Book
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        {currentSlide > 0 && currentSlide < totalSlides - 1 && (
          <div className="navigation">
            <button
              onClick={() => setCurrentSlide(currentSlide - 1)}
              className="nav-button prev"
            >
              ← Previous
            </button>
            
            <button
              onClick={() => setCurrentSlide(currentSlide + 1)}
              className="nav-button next"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookRatingRubric;
