import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './AddBookForm.module.css';

function AddBookForm({ onAddBook }) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [goodreadsUrl, setGoodreadsUrl] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isValidUrl = (url) => {
        if (!url) return true; // Empty URL is valid (optional field)
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        const trimmedTitle = title.trim();
        const trimmedAuthor = author.trim();

        // Validation
        if (!trimmedTitle || !trimmedAuthor) {
            setError('Title and author are required');
            return;
        }

        if (!isValidUrl(imageUrl)) {
            setError('Invalid image URL');
            return;
        }

        if (!isValidUrl(goodreadsUrl)) {
            setError('Invalid Goodreads URL');
            return;
        }

        setIsSubmitting(true);
        try {
            const newBook = {
                id: Date.now(),
                title: trimmedTitle,
                author: trimmedAuthor,
                imageUrl,
                goodreadsUrl,
                status: "Want to Read",
                progress: 0,
                rating: 0,
                review: '',
                quotes: []
            };
            onAddBook(newBook);
            setTitle('');
            setAuthor('');
            setImageUrl('');
            setGoodreadsUrl('');
            setShowForm(false);
        } catch (err) {
            setError('Failed to add book. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.addBookForm}>
            {!showForm ? (
                <button 
                    className={styles.addButton}
                    onClick={() => setShowForm(true)}
                >
                    + Add New Book
                </button>
            ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Book Title *"
                                required
                                maxLength={200}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="Author *"
                                required
                                maxLength={100}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Cover Image URL (optional)"
                                maxLength={500}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <input
                                type="url"
                                value={goodreadsUrl}
                                onChange={(e) => setGoodreadsUrl(e.target.value)}
                                placeholder="Goodreads URL (optional)"
                                maxLength={500}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Book'}
                        </button>
                        <button 
                            type="button" 
                            className={styles.cancelButton}
                            onClick={() => setShowForm(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

AddBookForm.propTypes = {
    onAddBook: PropTypes.func.isRequired
};

export default React.memo(AddBookForm);