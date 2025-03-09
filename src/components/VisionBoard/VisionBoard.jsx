import React, { useState, useEffect, useRef } from 'react';
import styles from './VisionBoard.module.css';
import '../../styles/shared.css';

const VisionBoard = () => {
    const [items, setItems] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const [text, setText] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const fileInputRef = useRef(null);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    const [showBackground, setShowBackground] = useState(false);

    // Load items from localStorage on component mount
    useEffect(() => {
        const savedItems = localStorage.getItem('visionBoardItems');
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }
    }, []);

    // Save items to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem('visionBoardItems', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        // Show background with delay
        setTimeout(() => setShowBackground(true), 500);
    }, []);

    const handleAddImage = () => {
        if (imageUrl.trim()) {
            if (editingItem !== null) {
                // Edit existing item
                const updatedItems = [...items];
                updatedItems[editingItem] = {
                    ...updatedItems[editingItem],
                    type: 'image',
                    content: imageUrl,
                };
                setItems(updatedItems);
                setEditingItem(null);
            } else {
                // Add new item
                setItems([...items, { 
                    id: Date.now(), 
                    type: 'image', 
                    content: imageUrl 
                }]);
            }
            setImageUrl('');
        }
    };

    const handleAddText = () => {
        if (text.trim()) {
            if (editingItem !== null) {
                // Edit existing item
                const updatedItems = [...items];
                updatedItems[editingItem] = {
                    ...updatedItems[editingItem],
                    type: 'text',
                    content: text,
                };
                setItems(updatedItems);
                setEditingItem(null);
            } else {
                // Add new item
                setItems([...items, { 
                    id: Date.now(), 
                    type: 'text', 
                    content: text 
                }]);
            }
            setText('');
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (editingItem !== null) {
                    // Edit existing item
                    const updatedItems = [...items];
                    updatedItems[editingItem] = {
                        ...updatedItems[editingItem],
                        type: 'image',
                        content: reader.result,
                    };
                    setItems(updatedItems);
                    setEditingItem(null);
                } else {
                    // Add new item
                    setItems([...items, { 
                        id: Date.now(), 
                        type: 'image', 
                        content: reader.result 
                    }]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (index) => {
        setEditingItem(index);
        const item = items[index];
        if (item.type === 'image') {
            setImageUrl(item.content);
            setText('');
        } else {
            setText(item.content);
            setImageUrl('');
        }
    };

    const handleDelete = (index) => {
        const updatedItems = [...items];
        updatedItems.splice(index, 1);
        setItems(updatedItems);
        
        if (editingItem === index) {
            setEditingItem(null);
            setImageUrl('');
            setText('');
        } else if (editingItem !== null && editingItem > index) {
            setEditingItem(editingItem - 1);
        }
    };

    const handleDragStart = (e, index) => {
        dragItem.current = index;
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const itemsCopy = [...items];
            const draggedItemContent = itemsCopy[dragItem.current];
            itemsCopy.splice(dragItem.current, 1);
            itemsCopy.splice(dragOverItem.current, 0, draggedItemContent);
            
            setItems(itemsCopy);
            
            // Reset the references
            dragItem.current = null;
            dragOverItem.current = null;
        }
    };

    const handleCancel = () => {
        setEditingItem(null);
        setImageUrl('');
        setText('');
    };

    return (
        <div className={`pageContainer ${showBackground ? 'showBackground' : ''}`}>
            <div className="floatingShapes">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`shape shape${i + 1}`} />
                ))}
            </div>

            <h1 className="pageTitle">My Vision Board</h1>
            
            <div className="wideContainer">
                <div className="gradientCard" style={{ padding: '2rem', borderRadius: '20px', position: 'relative', zIndex: 1 }}>
                    <div className={styles.visionBoardContainer}>
                        <div className="flexLayout" style={{ gap: '3rem' }}>
                            {/* Left Column - Input Area */}
                            <div style={{ flex: '1 1 40%' }}>
                                <div className={styles.inputArea}>
                                    <h3 className={styles.inputTitle}>
                                        {editingItem !== null ? 'Edit Item' : 'Add New Item'}
                                    </h3>
                                    
                                    <div className={styles.twoColumnLayout}>
                                        {/* Image Input */}
                                        <div className={styles.column}>
                                            <h4 className={styles.sectionSubtitle}>Add Image</h4>
                                            <input
                                                type="text"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                placeholder="Enter image URL..."
                                                className={styles.urlInput}
                                                style={{ width: '100%' }}
                                            />
                                            <div className={styles.orDivider}>OR</div>
                                            <button 
                                                onClick={() => fileInputRef.current.click()} 
                                                className={styles.fileButton}
                                                style={{ width: '100%' }}
                                            >
                                                Choose File
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                            />
                                            <button 
                                                onClick={handleAddImage} 
                                                className={styles.addButton}
                                                disabled={!imageUrl.trim()}
                                                style={{ width: '100%' }}
                                            >
                                                {editingItem !== null ? 'Update Image' : 'Add Image'}
                                            </button>
                                        </div>
                                        
                                        {/* Text Input */}
                                        <div className={styles.column}>
                                            <h4 className={styles.sectionSubtitle}>Add Text</h4>
                                            <textarea
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                placeholder="Enter text for your vision board..."
                                                className={styles.textArea}
                                                style={{ width: '100%', minHeight: '150px' }}
                                            />
                                            <button 
                                                onClick={handleAddText} 
                                                className={styles.addButton}
                                                disabled={!text.trim()}
                                                style={{ width: '100%' }}
                                            >
                                                {editingItem !== null ? 'Update Text' : 'Add Text'}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {editingItem !== null && (
                                        <button onClick={handleCancel} className={styles.cancelButton}>
                                            Cancel Editing
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Board Area */}
                            <div style={{ flex: '1 1 60%' }}>
                                <div className={styles.boardArea}>
                                    {items.length === 0 ? (
                                        <div className={styles.emptyBoard}>
                                            <p>Your vision board is empty. Add images and text to get started!</p>
                                        </div>
                                    ) : (
                                        <div className={styles.board}>
                                            {items.map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className={`${styles.item} ${editingItem === index ? styles.editing : ''}`}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, index)}
                                                    onDragEnter={(e) => handleDragEnter(e, index)}
                                                    onDragEnd={handleDragEnd}
                                                    onDragOver={(e) => e.preventDefault()}
                                                >
                                                    {item.type === 'image' ? (
                                                        <img src={item.content} alt="Vision" className={styles.itemImage} />
                                                    ) : (
                                                        <p className={styles.itemText}>{item.content}</p>
                                                    )}
                                                    <div className={styles.itemControls}>
                                                        <button
                                                            onClick={() => handleEdit(index)}
                                                            className={styles.editButton}
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(index)}
                                                            className={styles.deleteButton}
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisionBoard;
