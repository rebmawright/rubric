import React, { useState, useEffect } from 'react';

export default function BookRatingRubric() {
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
  const [imageSource, setImageSource] = useState('google'); // 'google', 'openlibrary', 'upload', 'none'
  const [searchingCover, setSearchingCover] = useState(false);

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

  // Fetch book cover
  const fetchBookCover = async () => {
    if (!bookInfo.title) return;
    
    setSearchingCover(true);
    
    try {
      if (imageSource === 'google') {
        // Google Books API - build query with optional author
        let query = bookInfo.title;
        if (bookInfo.author.trim()) {
          query += `+inauthor:${bookInfo.author}`;
        }
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=5`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Google Books API response:', data);
        
        if (data.items && data.items.length > 0) {
          // Find first result with an image
          const itemWithImage = data.items.find(item => item.volumeInfo?.imageLinks);
          
          if (itemWithImage?.volumeInfo?.imageLinks) {
            let imageUrl = itemWithImage.volumeInfo.imageLinks.thumbnail || 
                           itemWithImage.volumeInfo.imageLinks.smallThumbnail;
            
            // Upgrade to larger image if available
            if (imageUrl) {
              imageUrl = imageUrl.replace('&zoom=1', '&zoom=2').replace('http:', 'https:');
              setBookInfo(prev => ({ ...prev, coverUrl: imageUrl }));
              
              // Auto-fill author if it was empty
              if (!bookInfo.author && itemWithImage.volumeInfo.authors) {
                setBookInfo(prev => ({ 
                  ...prev, 
                  author: itemWithImage.volumeInfo.authors[0],
                  coverUrl: imageUrl 
                }));
              }
            } else {
              alert('No cover image found for this book.');
            }
          } else {
            alert('No results found with cover images. Try a different search or upload an image.');
          }
        } else {
          alert('No results found. Try a different search or upload an image.');
        }
      } else if (imageSource === 'openlibrary') {
        // Open Library API - search with title and optional author
        let query = bookInfo.title;
        if (bookInfo.author.trim()) {
          query += ` ${bookInfo.author}`;
        }
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodedQuery}&limit=5`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Open Library API response:', data);
        
        if (data.docs && data.docs.length > 0) {
          // Find first result with a cover
          const docWithCover = data.docs.find(doc => doc.cover_i);
          
          if (docWithCover?.cover_i) {
            const coverId = docWithCover.cover_i;
            setBookInfo(prev => ({ ...prev, coverUrl: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` }));
            
            // Auto-fill author if it was empty
            if (!bookInfo.author && docWithCover.author_name) {
              setBookInfo(prev => ({ 
                ...prev, 
                author: docWithCover.author_name[0],
                coverUrl: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
              }));
            }
          } else {
            alert('No cover image found for this book. Try Google Books or upload an image.');
          }
        } else {
          alert('No results found. Try a different search or upload an image.');
        }
      }
    } catch (error) {
      console.error('Error fetching book cover:', error);
      alert(`Error fetching cover: ${error.message}. Try uploading an image instead.`);
    } finally {
      setSearchingCover(false);
    }
  };

  const handleScore = (categoryId, value) => {
    setScores(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleBonusToggle = () => {
    const newValue = !scores.bonus;
    setScores(prev => ({ ...prev, bonus: newValue }));
    
    if (newValue) {
      // Trigger sparkle animation
      const newSparkles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        angle: (360 / 12) * i
      }));
      setSparkles(newSparkles);
      
      setTimeout(() => setSparkles([]), 1000);
    }
  };

  // Calculate final rating
  const calculateRating = () => {
    const total = (scores.writing || 0) + (scores.emotional || 0) + 
                  (scores.plot || 0) + (scores.worldBuilding || 0) + 
                  (scores.pacing || 0) + (scores.bonus ? 1 : 0);
    const rating = total / 4;
    const stars = Math.round(rating);
    return { total, rating: rating.toFixed(1), stars };
  };

  // Trigger star animation on summary slide
  useEffect(() => {
    if (currentSlide === totalSlides - 1) {
      setShowStars(false);
      setTimeout(() => setShowStars(true), 300);
    }
  }, [currentSlide, totalSlides]);

  // Handle file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBookInfo(prev => ({ ...prev, coverUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const { total, rating, stars } = calculateRating();

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      minHeight: '100vh',
      background: '#f5f5f0',
      padding: '40px 20px',
      position: 'relative'
    }}>
      <style>{`
        @keyframes sparkleOut {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        @keyframes starReveal {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #a8e6a3;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(168, 230, 163, 0.6);
          transition: all 0.2s ease;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 16px rgba(168, 230, 163, 0.8);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #a8e6a3;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 12px rgba(168, 230, 163, 0.6);
          transition: all 0.2s ease;
        }
        
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 16px rgba(168, 230, 163, 0.8);
        }
      `}</style>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        animation: 'slideIn 0.4s ease-out'
      }}>
        {/* Header with Progress */}
        <div style={{
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            margin: 0
          }}>
            Book Rating Rubric
          </h1>
          
          {/* Simple Counter */}
          <div style={{
            fontSize: '14px',
            color: '#666',
            background: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '2px solid #e5e5e5'
          }}>
            <span style={{ color: '#a8e6a3', fontWeight: '600' }}>{currentSlide + 1}</span>
            <span style={{ margin: '0 4px' }}>/</span>
            <span>{totalSlides}</span>
          </div>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          minHeight: '600px'
        }}>
          {/* Book Info Slide */}
          {currentCategory.type === 'info' && (
            <div style={{
              background: 'radial-gradient(at 27% 37%, rgba(20, 30, 20, 1) 0px, transparent 50%), radial-gradient(at 97% 21%, rgba(15, 25, 15, 1) 0px, transparent 50%), radial-gradient(at 52% 99%, rgba(168, 230, 163, 0.05) 0px, transparent 50%), radial-gradient(at 10% 29%, rgba(10, 20, 10, 1) 0px, transparent 50%), radial-gradient(at 97% 96%, rgba(168, 230, 163, 0.03) 0px, transparent 50%), radial-gradient(at 33% 50%, rgba(15, 20, 15, 1) 0px, transparent 50%), radial-gradient(at 79% 53%, rgba(10, 15, 10, 1) 0px, transparent 50%)',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              padding: '50px 40px',
              color: 'white'
            }}>
              <h2 style={{ fontSize: '36px', fontWeight: '600', marginBottom: '40px', textAlign: 'center' }}>
                {currentCategory.title}
              </h2>

              <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={bookInfo.title}
                    onChange={(e) => setBookInfo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter book title"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #444',
                      background: '#2a2a2a',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>
                    Author <span style={{ fontSize: '12px', opacity: 0.6 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={bookInfo.author}
                    onChange={(e) => setBookInfo(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Enter author name (helps with search)"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #444',
                      background: '#2a2a2a',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>
                    Book Cover URL <span style={{ fontSize: '12px', opacity: 0.6 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={bookInfo.coverUrl}
                    onChange={(e) => setBookInfo(prev => ({ ...prev, coverUrl: e.target.value }))}
                    placeholder="Paste image URL (optional)"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #444',
                      background: '#2a2a2a',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                  
                  {bookInfo.coverUrl && (
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                      <img 
                        src={bookInfo.coverUrl} 
                        alt="Book cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          alert('Image failed to load. Check the URL.');
                        }}
                        style={{ 
                          maxWidth: '150px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setCurrentSlide(currentSlide + 1)}
                  disabled={!bookInfo.title}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: !bookInfo.title ? '#444' : '#a8e6a3',
                    color: !bookInfo.title ? '#999' : '#1a1a1a',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: !bookInfo.title ? 'not-allowed' : 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Start Rating →
                </button>
              </div>
            </div>
          )}

          {/* Rating Slides */}
          {currentCategory.type !== 'info' && currentCategory.type !== 'summary' && currentCategory.type !== 'bonus' && (
            <div style={{
              background: 'radial-gradient(at 27% 37%, rgba(20, 30, 20, 1) 0px, transparent 50%), radial-gradient(at 97% 21%, rgba(15, 25, 15, 1) 0px, transparent 50%), radial-gradient(at 52% 99%, rgba(168, 230, 163, 0.05) 0px, transparent 50%), radial-gradient(at 10% 29%, rgba(10, 20, 10, 1) 0px, transparent 50%), radial-gradient(at 97% 96%, rgba(168, 230, 163, 0.03) 0px, transparent 50%), radial-gradient(at 33% 50%, rgba(15, 20, 15, 1) 0px, transparent 50%), radial-gradient(at 79% 53%, rgba(10, 15, 10, 1) 0px, transparent 50%)',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              padding: '50px 40px',
              color: 'white'
            }}>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ 
                  fontSize: '13px', 
                  opacity: 0.6, 
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  0-{currentCategory.max} points
                </div>
                <h3 style={{ 
                  fontSize: '36px', 
                  marginBottom: '0',
                  fontWeight: '600',
                  letterSpacing: '-0.5px'
                }}>
                  {currentCategory.title}
                </h3>
              </div>

              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '40px'
              }}>
                <div style={{
                  fontSize: '80px',
                  fontWeight: '700',
                  color: '#a8e6a3',
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  textShadow: '0 2px 20px rgba(168, 230, 163, 0.3)',
                  transition: 'all 0.3s ease',
                  animation: scores[currentCategory.id] !== null ? 'blink 0.4s ease-out' : 'none'
                }}>
                  {scores[currentCategory.id] !== null ? scores[currentCategory.id] : '-'}
                </div>

                {scores[currentCategory.id] !== null && (
                  <div style={{
                    fontSize: '16px',
                    lineHeight: '1.6',
                    opacity: 0.9,
                    textAlign: 'center',
                    maxWidth: '600px',
                    minHeight: '60px',
                    padding: '0 20px',
                    transition: 'all 0.3s ease'
                  }}>
                    {currentCategory.explainers[scores[currentCategory.id]]}
                  </div>
                )}
              </div>

              <div style={{ 
                width: '100%', 
                maxWidth: '600px',
                margin: '0 auto',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  opacity: 0.5
                }}>
                  {Array.from({ length: currentCategory.max + 1 }, (_, i) => (
                    <span 
                      key={i}
                      style={{
                        opacity: scores[currentCategory.id] === i ? 1 : 0.5,
                        color: scores[currentCategory.id] === i ? '#a8e6a3' : 'inherit',
                        transition: 'all 0.3s ease',
                        fontSize: scores[currentCategory.id] === i ? '20px' : '18px'
                      }}
                    >
                      {i}
                    </span>
                  ))}
                </div>

                <input
                  type="range"
                  min="0"
                  max={currentCategory.max}
                  value={scores[currentCategory.id] ?? 0}
                  onChange={(e) => handleScore(currentCategory.id, Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '10px',
                    borderRadius: '5px',
                    background: `linear-gradient(to right, #a8e6a3 0%, #a8e6a3 ${((scores[currentCategory.id] ?? 0) / currentCategory.max) * 100}%, #444 ${((scores[currentCategory.id] ?? 0) / currentCategory.max) * 100}%, #444 100%)`,
                    outline: 'none',
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    transition: 'background 0.3s ease'
                  }}
                />
              </div>

              <div style={{ 
                marginTop: '30px', 
                fontSize: '13px', 
                opacity: 0.6,
                textAlign: 'center',
                letterSpacing: '0.3px'
              }}>
                Drag the slider or click to select your rating
              </div>
            </div>
          )}

          {/* Bonus Point Slide */}
          {currentCategory.type === 'bonus' && (
            <div style={{
              background: 'radial-gradient(at 27% 37%, rgba(20, 30, 20, 1) 0px, transparent 50%), radial-gradient(at 97% 21%, rgba(15, 25, 15, 1) 0px, transparent 50%), radial-gradient(at 52% 99%, rgba(168, 230, 163, 0.05) 0px, transparent 50%), radial-gradient(at 10% 29%, rgba(10, 20, 10, 1) 0px, transparent 50%), radial-gradient(at 97% 96%, rgba(168, 230, 163, 0.03) 0px, transparent 50%), radial-gradient(at 33% 50%, rgba(15, 20, 15, 1) 0px, transparent 50%), radial-gradient(at 79% 53%, rgba(10, 15, 10, 1) 0px, transparent 50%)',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              padding: '60px 40px',
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              overflow: 'visible'
            }}>
              <div style={{ fontSize: '13px', opacity: 0.6, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                BONUS POINT
              </div>
              <h3 style={{ fontSize: '36px', marginBottom: '20px', fontWeight: '600' }}>
                {currentCategory.title}
              </h3>
              
              <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                {currentCategory.description}
              </p>

              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={handleBonusToggle}
                  style={{
                    padding: '20px 40px',
                    borderRadius: '12px',
                    border: scores.bonus ? '2px solid #a8e6a3' : '2px solid #444',
                    background: scores.bonus ? '#a8e6a3' : '#2a2a2a',
                    color: scores.bonus ? '#1a1a1a' : 'white',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 2
                  }}
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
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        fontSize: '30px',
                        animation: 'sparkleOut 0.8s ease-out forwards',
                        pointerEvents: 'none',
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
          )}

          {/* Summary Slide */}
          {currentCategory.type === 'summary' && (
            <div style={{
              background: 'radial-gradient(at 27% 37%, rgba(20, 30, 20, 1) 0px, transparent 50%), radial-gradient(at 97% 21%, rgba(15, 25, 15, 1) 0px, transparent 50%), radial-gradient(at 52% 99%, rgba(168, 230, 163, 0.05) 0px, transparent 50%), radial-gradient(at 10% 29%, rgba(10, 20, 10, 1) 0px, transparent 50%), radial-gradient(at 97% 96%, rgba(168, 230, 163, 0.03) 0px, transparent 50%), radial-gradient(at 33% 50%, rgba(15, 20, 15, 1) 0px, transparent 50%), radial-gradient(at 79% 53%, rgba(10, 15, 10, 1) 0px, transparent 50%)',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              padding: '60px 40px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', opacity: 0.6, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {currentCategory.title}
              </div>
              
              {bookInfo.coverUrl && (
                <div style={{ marginBottom: '20px' }}>
                  <img 
                    src={bookInfo.coverUrl} 
                    alt="Book cover"
                    style={{ 
                      maxWidth: '120px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  />
                </div>
              )}
              
              <div style={{ fontSize: '28px', marginBottom: '10px', opacity: 0.9, fontWeight: '600' }}>
                {bookInfo.title}
              </div>
              <div style={{ fontSize: '18px', marginBottom: '40px', opacity: 0.6 }}>
                by {bookInfo.author}
              </div>

              <div style={{ fontSize: '100px', fontWeight: '700', color: '#a8e6a3', marginBottom: '20px' }}>
                {rating}
              </div>

              <div style={{ fontSize: '48px', marginBottom: '40px', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                {showStars && Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      animation: `starReveal 0.5s ease-out forwards`,
                      animationDelay: `${i * 0.15}s`,
                      opacity: 0
                    }}
                  >
                    {i < stars ? '⭐' : '☆'}
                  </span>
                ))}
              </div>

              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                fontSize: '14px',
                opacity: 0.7,
                maxWidth: '400px',
                margin: '0 auto 30px'
              }}>
                <div>Beautiful Writing: {scores.writing}</div>
                <div>Emotional Impact: {scores.emotional}</div>
                <div>Plot & Twists: {scores.plot}</div>
                <div>World Building: {scores.worldBuilding}</div>
                <div>Pacing: {scores.pacing}</div>
                <div>Bonus: {scores.bonus ? '✓' : '✗'}</div>
              </div>

              <div style={{
                background: 'rgba(168, 230, 163, 0.1)',
                border: '1px solid rgba(168, 230, 163, 0.3)',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '30px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#a8e6a3' }}>
                  Export to Notion
                </div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '15px', lineHeight: '1.6' }}>
                  Copy this data and paste into your Notion database:
                </div>
                <button
                  onClick={() => {
                    const notionData = `Title: ${bookInfo.title}\nAuthor: ${bookInfo.author}\nRating: ${rating}\nTotal: ${total}/21\nWriting: ${scores.writing}\nEmotional: ${scores.emotional}\nPlot: ${scores.plot}\nWorld Building: ${scores.worldBuilding}\nPacing: ${scores.pacing}\nBonus: ${scores.bonus ? 'Yes' : 'No'}`;
                    navigator.clipboard.writeText(notionData);
                    alert('Copied to clipboard!');
                  }}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#a8e6a3',
                    color: '#1a1a1a',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
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
                style={{
                  marginTop: '30px',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  border: '2px solid #444',
                  background: 'transparent',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Rate Another Book
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        {currentSlide > 0 && currentSlide < totalSlides - 1 && (
          <div style={{
            marginTop: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '15px'
          }}>
            <button
              onClick={() => setCurrentSlide(currentSlide - 1)}
              style={{
                padding: '12px 30px',
                borderRadius: '8px',
                border: 'none',
                background: 'white',
                color: '#1a1a1a',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              ← Previous
            </button>
            
            <button
              onClick={() => setCurrentSlide(currentSlide + 1)}
              disabled={currentCategory.type === 'bonus' ? false : scores[currentCategory.id] === null}
              style={{
                padding: '12px 30px',
                borderRadius: '8px',
                border: 'none',
                background: (currentCategory.type === 'bonus' || scores[currentCategory.id] !== null) ? '#a8e6a3' : '#ddd',
                color: (currentCategory.type === 'bonus' || scores[currentCategory.id] !== null) ? '#1a1a1a' : '#999',
                fontWeight: '600',
                cursor: (currentCategory.type === 'bonus' || scores[currentCategory.id] !== null) ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}