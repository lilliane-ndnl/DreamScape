import React from 'react';
import PropTypes from 'prop-types';
import styles from './DefaultBookCover.module.css';

function DefaultBookCover({ title, author }) {
    return (
        <div className={styles.defaultCover}>
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.author}>by {author}</p>
            </div>
        </div>
    );
}

DefaultBookCover.propTypes = {
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired
};

export default DefaultBookCover; 