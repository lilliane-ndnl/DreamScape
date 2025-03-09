import React, { useState, useEffect } from 'react';
import BookItem from '../BookItem/BookItem';
import AddBookForm from '../AddBookForm/AddBookForm';
import styles from './ReadingList.module.css';
import '../../styles/shared.css';

function ReadingList() {
    const [books, setBooks] = useState([]);
    const [showBackground, setShowBackground] = useState(false);

    // Load books from localStorage
    useEffect(() => {
        const savedBooks = localStorage.getItem('readingList');
        if (savedBooks) {
            setBooks(JSON.parse(savedBooks));
        }
        // Show background with delay
        setTimeout(() => setShowBackground(true), 500);
    }, []);

    // Save books to localStorage
    useEffect(() => {
        localStorage.setItem('readingList', JSON.stringify(books));
    }, [books]);

    const handleAddBook = (newBook) => {
        setBooks([...books, newBook]);
    };

    const handleUpdateBook = (updatedBook) => {
        setBooks(books.map(book => (book.id === updatedBook.id ? updatedBook : book)));
    };

    const handleDeleteBook = (bookId) => {
        setBooks(books.filter(book => book.id !== bookId));
    };

    const handleMoveBook = (bookId, newStatus) => {
      setBooks(
        books.map((book) => {
          if (book.id === bookId) {
            return { ...book, status: newStatus };
          }
          return book;
        })
      );
    };

    const booksWantToRead = books.filter((book) => book.status === "Want to Read");
    const booksCurrentlyReading = books.filter((book) => book.status === "Currently Reading");
    const booksFinished = books.filter((book) => book.status === "Finished");

    return (
        <div className={`pageContainer ${showBackground ? 'showBackground' : ''}`}>
            <div className="floatingShapes">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`shape shape${i + 1}`} />
                ))}
            </div>

            <h1 className="pageTitle">My Reading List</h1>

            <div className="wideContainer">
                <div className="gradientCard" style={{ padding: '2rem', borderRadius: '20px', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                    <AddBookForm onAddBook={handleAddBook} />
                </div>

                <div className="gridLayout">
                    {/* Want to Read Section */}
                    <div className="gradientCard" style={{ padding: '2rem', borderRadius: '20px', position: 'relative', zIndex: 1 }}>
                        <h3 style={{ 
                            fontSize: '1.8rem', 
                            color: '#532e3b', 
                            marginBottom: '1.5rem',
                            fontFamily: 'Playfair Display, serif',
                            borderBottom: '2px solid #ffd6e0',
                            paddingBottom: '0.5rem'
                        }}>Want to Read</h3>
                        
                        {booksWantToRead.length === 0 ? 
                            <p className={styles.noBooks}>No books in "Want to Read"</p>
                            :
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {booksWantToRead.map(book => (
                                    <BookItem
                                        key={book.id}
                                        book={book}
                                        onUpdate={handleUpdateBook}
                                        onDelete={handleDeleteBook}
                                        onMove={handleMoveBook}
                                    />
                                ))}
                            </div>
                        }
                    </div>

                    {/* Currently Reading Section */}
                    <div className="gradientCard" style={{ padding: '2rem', borderRadius: '20px', position: 'relative', zIndex: 1 }}>
                        <h3 style={{ 
                            fontSize: '1.8rem', 
                            color: '#532e3b', 
                            marginBottom: '1.5rem',
                            fontFamily: 'Playfair Display, serif',
                            borderBottom: '2px solid #ffd6e0',
                            paddingBottom: '0.5rem'
                        }}>Currently Reading</h3>
                        
                        {booksCurrentlyReading.length === 0 ? 
                            <p className={styles.noBooks}>No books in "Currently Reading"</p> 
                            :
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {booksCurrentlyReading.map(book => (
                                    <BookItem
                                        key={book.id}
                                        book={book}
                                        onUpdate={handleUpdateBook}
                                        onDelete={handleDeleteBook}
                                        onMove={handleMoveBook}
                                    />
                                ))}
                            </div>
                        }
                    </div>

                    {/* Finished Section */}
                    <div className="gradientCard" style={{ padding: '2rem', borderRadius: '20px', position: 'relative', zIndex: 1 }}>
                        <h3 style={{ 
                            fontSize: '1.8rem', 
                            color: '#532e3b', 
                            marginBottom: '1.5rem',
                            fontFamily: 'Playfair Display, serif',
                            borderBottom: '2px solid #ffd6e0',
                            paddingBottom: '0.5rem'
                        }}>Finished</h3>
                        
                        {booksFinished.length === 0 ? 
                            <p className={styles.noBooks}>No books in "Finished"</p> 
                            :
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {booksFinished.map(book => (
                                    <BookItem
                                        key={book.id}
                                        book={book}
                                        onUpdate={handleUpdateBook}
                                        onDelete={handleDeleteBook}
                                        onMove={handleMoveBook}
                                    />
                                ))}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReadingList;
