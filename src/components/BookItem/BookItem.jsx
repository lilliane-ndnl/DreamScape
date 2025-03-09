import React, { useState } from 'react';
import styles from './BookItem.module.css';

function BookItem({ book, onUpdate, onDelete, onMove }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(book.title);
    const [editedAuthor, setEditedAuthor] = useState(book.author);
    const [editedImageUrl, setEditedImageUrl] = useState(book.imageUrl || '');
    const [editedGoodreadsUrl, setEditedGoodreadsUrl] = useState(book.goodreadsUrl || '');
    const [editedRating, setEditedRating] = useState(book.rating || 0);
    const [editedReview, setEditedReview] = useState(book.review || '');
    const [showReview, setShowReview] = useState(false);
    const [newQuote, setNewQuote] = useState(''); // For adding new quotes
    const [editedCoverImageUrl, setEditedCoverImageUrl] = useState(book.coverImageUrl || '');
    const [editedGoodreadsLink, setEditedGoodreadsLink] = useState(book.goodreadsLink || '');

    const handleSave = () => {
        onUpdate({
            ...book,
            title: editedTitle,
            author: editedAuthor,
            imageUrl: editedImageUrl,
            goodreadsUrl: editedGoodreadsUrl,
            rating: editedRating,
            review: editedReview,
            coverImageUrl: editedCoverImageUrl,
            goodreadsLink: editedGoodreadsLink,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedTitle(book.title);
        setEditedAuthor(book.author);
        setEditedImageUrl(book.imageUrl || '');
        setEditedGoodreadsUrl(book.goodreadsUrl || '');
        setEditedRating(book.rating || 0);
        setEditedReview(book.review || '');
        setEditedCoverImageUrl(book.coverImageUrl || '');
        setEditedGoodreadsLink(book.goodreadsLink || '');
    };

    const handleMove = (newStatus) => {
        onMove(book.id, newStatus);
    };

    const handleDelete = () => {
        onDelete(book.id);
    };

    const handleAddQuote = () => {
        if (newQuote.trim() !== '') {
            onUpdate({
                ...book,
                quotes: [...book.quotes, { id: Date.now() + Math.random(), text: newQuote }],
            });
            setNewQuote(''); // Clear input after adding
        }
    };

    const handleDeleteQuote = (quoteId) => {
        onUpdate({
            ...book,
            quotes: book.quotes.filter(quote => quote.id !== quoteId),
        });
    };

    const handleSaveReview = () => {
        onUpdate({
            ...book,
            rating: editedRating,
            review: editedReview,
        });
        setIsEditing(false);
    };

    const renderStars = () => {
        return [...Array(5)].map((_, index) => (
            <span
                key={index}
                className={`${styles.star} ${index < editedRating ? styles.filled : ''} ${isEditing ? styles.clickable : ''}`}
                onClick={() => isEditing && setEditedRating(index + 1)}
            >
                ★
            </span>
        ));
    };

    return (
        <div className={styles.bookItem}>
            <div className={styles.bookContent}>
                {editedImageUrl ? (
                    <img src={editedImageUrl} alt={editedTitle} className={styles.bookCover} />
                ) : (
                    <div className={styles.defaultCover}>
                        <h3>{editedTitle}</h3>
                        <p>{editedAuthor}</p>
                    </div>
                )}
                
                <div className={styles.bookInfo}>
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className={styles.input}
                                placeholder="Book Title"
                            />
                            <input
                                type="text"
                                value={editedAuthor}
                                onChange={(e) => setEditedAuthor(e.target.value)}
                                className={styles.input}
                                placeholder="Author"
                            />
                            <input
                                type="url"
                                value={editedImageUrl}
                                onChange={(e) => setEditedImageUrl(e.target.value)}
                                className={styles.input}
                                placeholder="Cover Image URL"
                            />
                            <input
                                type="url"
                                value={editedGoodreadsUrl}
                                onChange={(e) => setEditedGoodreadsUrl(e.target.value)}
                                className={styles.input}
                                placeholder="Goodreads URL"
                            />
                        </>
                    ) : (
                        <>
                            <h3 className={styles.bookTitle}>{book.title}</h3>
                            <p className={styles.bookAuthor}>by {book.author}</p>
                        </>
                    )}

                    <p style={{ 
                        display: 'inline-block',
                        backgroundColor: 'rgba(255, 179, 193, 0.2)',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '15px',
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                        color: '#532e3b',
                    }}>Status: {book.status}</p>
                    
                    {book.coverImageUrl && (
                        <img 
                            src={book.coverImageUrl} 
                            alt={`Cover of ${book.title}`} 
                            style={{ 
                                maxWidth: '100%', 
                                height: 'auto', 
                                borderRadius: '8px', 
                                marginBottom: '1rem',
                                boxShadow: '0 4px 10px rgba(83, 46, 59, 0.15)'
                            }} 
                        />
                    )}
                    
                    {book.goodreadsLink && (
                        <a 
                            href={book.goodreadsLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                                color: '#532e3b',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                marginBottom: '1rem',
                                display: 'inline-block',
                                borderBottom: '2px solid #ffd6e0'
                            }}
                        >
                            Goodreads Page
                        </a>
                    )}

                    {(book.status === "Currently Reading" || book.status === "Finished") && (
                        <div className={styles.reviewSection}>
                            <div className={styles.rating}>
                                {renderStars()}
                            </div>
                            
                            {isEditing ? (
                                <textarea
                                    value={editedReview}
                                    onChange={(e) => setEditedReview(e.target.value)}
                                    className={styles.reviewInput}
                                    placeholder="Write your review..."
                                />
                            ) : (
                                <>
                                    {book.review && (
                                        <>
                                            <button 
                                                className={styles.reviewToggle}
                                                onClick={() => setShowReview(!showReview)}
                                            >
                                                {showReview ? 'Hide Review' : 'Show Review'}
                                            </button>
                                            {showReview && (
                                                <p className={styles.reviewText}>{book.review}</p>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Quotes Section */}
            <div className={styles.quotesSection}>
                <h4>Memorable Quotes</h4>
                {book.quotes && book.quotes.map(quote => (
                    <div key={quote.id} className={styles.quote}>
                        <p>{quote.text}</p>
                        <button 
                            onClick={() => handleDeleteQuote(quote.id)}
                            className={styles.deleteQuoteButton}
                        >
                            Delete
                        </button>
                    </div>
                ))}
                <div className={styles.addQuote}>
                    <input
                        type="text"
                        value={newQuote}
                        onChange={(e) => setNewQuote(e.target.value)}
                        placeholder="Add a new quote..."
                        className={styles.quoteInput}
                    />
                    <button 
                        onClick={handleAddQuote}
                        className={styles.addQuoteButton}
                    >
                        Add Quote
                    </button>
                </div>
            </div>

            <div className={styles.bookActions}>
                {isEditing ? (
                    <div className={styles.editActions}>
                        <button 
                            onClick={book.status === "Finished" ? handleSaveReview : handleSave} 
                            className={styles.saveButton}
                        >
                            Save
                        </button>
                        <button onClick={handleCancel} className={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                        Edit
                    </button>
                )}

                <div className={styles.moveButtons}>
                    {book.status !== "Want to Read" && (
                        <button onClick={() => handleMove("Want to Read")}>
                            Want to Read
                        </button>
                    )}
                    {book.status !== "Currently Reading" && (
                        <button onClick={() => handleMove("Currently Reading")}>
                            Currently Reading
                        </button>
                    )}
                    {book.status !== "Finished" && (
                        <button onClick={() => handleMove("Finished")}>
                            Finished
                        </button>
                    )}
                </div>

                <button className={styles.deleteButton} onClick={handleDelete}>
                    Delete
                </button>
            </div>
        </div>
    );
}

export default BookItem;
