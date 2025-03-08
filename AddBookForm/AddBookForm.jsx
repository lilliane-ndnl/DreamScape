import React, { useState } from 'react';
import styles from './AddBookForm.module.css';

function AddBookForm({ onAddBook }) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [goodreadsUrl, setGoodreadsUrl] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title && author) {
            const newBook = {
                id: Date.now(),
                title,
                author,
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
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Book Title *"
                                required
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
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Cover Image URL (optional)"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <input
                                type="url"
                                value={goodreadsUrl}
                                onChange={(e) => setGoodreadsUrl(e.target.value)}
                                placeholder="Goodreads URL (optional)"
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.submitButton}>
                            Add Book
                        </button>
                        <button 
                            type="button" 
                            className={styles.cancelButton}
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default AddBookForm;
