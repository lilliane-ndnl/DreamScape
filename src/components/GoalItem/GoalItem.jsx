import React, { useState } from 'react';
import styles from './GoalItem.module.css';

function GoalItem({ goal, onUpdate, onDelete, snapshot }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(goal.title);
    const [editedDescription, setEditedDescription] = useState(goal.description);
    const [editedDeadline, setEditedDeadline] = useState(goal.deadline);
    const [newStep, setNewStep] = useState('');

    const handleSave = () => {
        onUpdate({
            ...goal,
            title: editedTitle,
            description: editedDescription,
            deadline: editedDeadline
        });
        setIsEditing(false);
    };

    const handleAddStep = () => {
        if (newStep.trim() !== '') {
            onUpdate({
                ...goal,
                steps: [...goal.steps, { id: Date.now(), text: newStep, completed: false }]
            });
            setNewStep('');
        }
    };

    const handleToggleStep = (stepId) => {
        onUpdate({
            ...goal,
            steps: goal.steps.map(step =>
                step.id === stepId ? { ...step, completed: !step.completed } : step
            )
        });
    };

    const handleDeleteStep = (stepId) => {
        onUpdate({
            ...goal,
            steps: goal.steps.filter(step => step.id !== stepId)
        });
    };

    const calculateProgress = () => {
        if (goal.steps.length === 0) return 0;
        const completedSteps = goal.steps.filter(step => step.completed).length;
        return (completedSteps / goal.steps.length) * 100;
    };

    return (
        <div className={`${styles.container} ${snapshot?.isDragging ? styles.dragging : ''}`}>
            {isEditing ? (
                <div className={styles.editMode}>
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className={styles.title}
                        placeholder="Goal title"
                    />
                    <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className={styles.description}
                        placeholder="Goal description"
                    />
                    <input
                        type="date"
                        value={editedDeadline}
                        onChange={(e) => setEditedDeadline(e.target.value)}
                        className={styles.deadline}
                    />
                    <div className={styles.buttonGroup}>
                        <button onClick={handleSave} className={styles.editButton}>
                            Save
                        </button>
                        <button onClick={() => setIsEditing(false)} className={styles.deleteButton}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <h3 className={styles.title}>{goal.title}</h3>
                    {goal.description && (
                        <p className={styles.description}>{goal.description}</p>
                    )}
                    {goal.deadline && (
                        <p className={styles.deadline}>Deadline: {goal.deadline}</p>
                    )}
                    <div className={styles.progressContainer}>
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill}
                                style={{ width: `${calculateProgress()}%` }}
                            />
                        </div>
                        <span className={styles.progressText}>
                            {Math.round(calculateProgress())}% Complete
                        </span>
                    </div>
                    <div className={styles.stepsContainer}>
                        <h4 className={styles.stepsTitle}>Steps</h4>
                        <input
                            type="text"
                            value={newStep}
                            onChange={(e) => setNewStep(e.target.value)}
                            className={styles.stepInput}
                            placeholder="Add a new step"
                        />
                        <button onClick={handleAddStep} className={styles.addStepButton}>
                            Add Step
                        </button>
                        <ul className={styles.stepsList}>
                            {goal.steps.map(step => (
                                <li key={step.id} className={styles.stepItem}>
                                    <input
                                        type="checkbox"
                                        checked={step.completed}
                                        onChange={() => handleToggleStep(step.id)}
                                        className={styles.checkbox}
                                    />
                                    <span style={{ textDecoration: step.completed ? 'line-through' : 'none' }}>
                                        {step.text}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteStep(step.id)}
                                        className={styles.deleteButton}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={styles.buttonGroup}>
                        <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                            Edit
                        </button>
                        <button onClick={() => onDelete(goal.id)} className={styles.deleteButton}>
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default GoalItem;