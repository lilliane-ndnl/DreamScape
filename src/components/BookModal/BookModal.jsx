import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../ReadingList/ReadingList.module.css';

function StarRating({ rating, onRate }) {
    return (
        <div className={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
                    onClick={() => onRate(star)}
                >
                    ★
                </span>
            ))}
        </div>
    );
}

function BookModal({ book, onClose, onUpdate, onMove, onDelete }) {
    const [editedBook, setEditedBook] = useState(book);
    const [isEditing, setIsEditing] = useState(false);
    const [showMoveOptions, setShowMoveOptions] = useState(false);
    const moveButtonRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (moveButtonRef.current && !moveButtonRef.current.contains(event.target)) {
                setShowMoveOptions(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(editedBook);
        onClose();
    };

    const handleMove = (newStatus) => {
        onMove(book.id, newStatus);
        setShowMoveOptions(false);
    };

    return (
        <div className={styles.modal} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                {!isEditing ? (
                    <>
                        <div className={styles.modalHeader}>
                            <img 
                                src={book.imageUrl || '/images/BlankBookCover.png'} 
                                alt={book.title}
                                className={styles.modalImage}
                            />
                            <div className={styles.modalInfo}>
                                <h2 className={styles.modalTitle}>{book.title}</h2>
                                
                                <div className={styles.modalRow}>
                                    <div>
                                        <span className={styles.modalLabel}>Author: </span>
                                        <span className={styles.modalValue}>{book.author}</span>
                                    </div>
                                    <div>
                                        <span className={styles.modalLabel}>Rating: </span>
                                        <StarRating rating={book.rating} onRate={() => {}} />
                                    </div>
                                </div>

                                <div className={styles.modalRow}>
                                    <div>
                                        <span className={styles.modalLabel}>Status: </span>
                                        <span className={styles.modalValue}>{book.status}</span>
                                    </div>
                                </div>

                                {book.quotes.length > 0 && (
                                    <div className={styles.modalQuotes}>
                                        <h3 className={styles.modalLabel}>Favorite Quotes:</h3>
                                        {book.quotes.map((quote, index) => (
                                            <p key={index} className={styles.modalValue}>"{quote}"</p>
                                        ))}
                                    </div>
                                )}

                                {book.review && (
                                    <div className={styles.modalReview}>
                                        <h3 className={styles.modalLabel}>Review:</h3>
                                        <p className={styles.modalValue}>{book.review}</p>
                                    </div>
                                )}

                                <div className={styles.buttonGroup}>
                                    <button 
                                        className={styles.editButton}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Details
                                    </button>
                                    <div className={styles.moveButton} ref={moveButtonRef}>
                                        <button onClick={() => setShowMoveOptions(!showMoveOptions)}>
                                            Move to...
                                        </button>
                                        {showMoveOptions && (
                                            <div className={styles.moveOptions}>
                                                <div 
                                                    className={styles.moveOption}
                                                    onClick={() => handleMove('Want to Read')}
                                                >
                                                    Want to Read
                                                </div>
                                                <div 
                                                    className={styles.moveOption}
                                                    onClick={() => handleMove('Currently Reading')}
                                                >
                                                    Currently Reading
                                                </div>
                                                <div 
                                                    className={styles.moveOption}
                                                    onClick={() => handleMove('Finished')}
                                                >
                                                    Finished
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        className={styles.deleteButton}
                                        onClick={() => onDelete(book.id)}
                                    >
                                        Delete Book
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.editForm}>
                        <input
                            type="text"
                            value={editedBook.title}
                            onChange={e => setEditedBook({...editedBook, title: e.target.value})}
                            placeholder="Book Title"
                        />
                        <input
                            type="text"
                            value={editedBook.author}
                            onChange={e => setEditedBook({...editedBook, author: e.target.value})}
                            placeholder="Author Name"
                        />
                        <input
                            type="url"
                            value={editedBook.imageUrl}
                            onChange={e => setEditedBook({...editedBook, imageUrl: e.target.value})}
                            placeholder="Cover Image URL"
                        />
                        <input
                            type="url"
                            value={editedBook.goodreadsUrl}
                            onChange={e => setEditedBook({...editedBook, goodreadsUrl: e.target.value})}
                            placeholder="Goodreads URL"
                        />
                        <div>
                            <label className={styles.modalLabel}>Rating:</label>
                            <StarRating 
                                rating={editedBook.rating} 
                                onRate={(rating) => setEditedBook({...editedBook, rating})}
                            />
                        </div>
                        <textarea
                            value={editedBook.review}
                            onChange={e => setEditedBook({...editedBook, review: e.target.value})}
                            placeholder="Write your review..."
                        />
                        <textarea
                            value={editedBook.quotes.join('\n')}
                            onChange={e => setEditedBook({
                                ...editedBook, 
                                quotes: e.target.value.split('\n').filter(q => q.trim())
                            })}
                            placeholder="Add favorite quotes (one per line)"
                        />
                        <div className={styles.buttonGroup}>
                            <button type="submit" className={styles.editButton}>
                                Save Changes
                            </button>
                            <button 
                                type="button" 
                                className={styles.moveButton}
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

StarRating.propTypes = {
    rating: PropTypes.number.isRequired,
    onRate: PropTypes.func.isRequired
};

BookModal.propTypes = {
    book: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default BookModal; 