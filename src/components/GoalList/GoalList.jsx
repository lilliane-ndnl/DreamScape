import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import GoalItem from '../GoalItem/GoalItem';
import styles from './GoalList.module.css';
import '../../styles/shared.css';

function GoalList() {
    const [goals, setGoals] = useState([]);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState(null);
    const [showBackground, setShowBackground] = useState(false);

    // Load goals from localStorage on component mount
    useEffect(() => {
        const savedGoals = localStorage.getItem('goals');
        if (savedGoals) {
            setGoals(JSON.parse(savedGoals));
        }
        setIsReady(true);
    }, []);

    // Save goals to localStorage whenever goals change
    useEffect(() => {
        if (isReady) {
            localStorage.setItem('goals', JSON.stringify(goals));
        }
    }, [goals, isReady]);

    useEffect(() => {
        // Show background with delay
        setTimeout(() => setShowBackground(true), 500);
    }, []);

    const handleAddGoal = () => {
        if (newGoalTitle.trim() !== '') {
            const newGoal = {
                id: Date.now() + Math.random(),
                title: newGoalTitle,
                description: '',
                deadline: '',
                steps: [],
                completed: false,
                priority: goals.length
            };
            
            setGoals([...goals, newGoal]);
            setNewGoalTitle('');
        }
    };

    const handleUpdateGoal = (updatedGoal) => {
        setGoals(goals.map(goal => 
            goal.id === updatedGoal.id ? updatedGoal : goal
        ));
    };

    const handleDeleteGoal = (goalId) => {
        setGoals(goals.filter(goal => goal.id !== goalId));
        if (selectedGoalId === goalId) {
            setSelectedGoalId(null);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const newGoals = [...goals];
        const [movedGoal] = newGoals.splice(source.index, 1);
        newGoals.splice(destination.index, 0, movedGoal);

        // Update priorities
        updatePriorities(newGoals);
        setGoals(newGoals);
    };

    const updatePriorities = (goalsList) => {
        goalsList.forEach((goal, index) => {
            goal.priority = index;
        });
    };

    const calculateGoalProgress = (goal) => {
        if (!goal.steps || goal.steps.length === 0) return 0;
        const completedSteps = goal.steps.filter(step => step.completed).length;
        return (completedSteps / goal.steps.length) * 100;
    };

    return (
        <div className={`pageContainer ${showBackground ? 'showBackground' : ''}`}>
            <div className="floatingShapes">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`shape shape${i + 1}`} />
                ))}
            </div>

            <h1 className="pageTitle">My Goals</h1>
            
            <div className="wideContainer">
                <div className="gradientCard" style={{ 
                    padding: '2.5rem', 
                    borderRadius: '20px', 
                    position: 'relative', 
                    zIndex: 1,
                    maxWidth: '1600px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <div className={styles.goalListContainer}>
                        <div className="flexLayout" style={{ 
                            gap: '4rem',
                            width: '100%'
                        }}>
                            {/* Left Column - Goals List */}
                            <div style={{ 
                                flex: '1 1 45%',
                                width: '100%'
                            }}>
                                <div className={styles.inputArea} style={{ 
                                    marginBottom: '2rem',
                                    width: '100%'
                                }}>
                                    <input
                                        type="text"
                                        value={newGoalTitle}
                                        onChange={(e) => setNewGoalTitle(e.target.value)}
                                        placeholder="Enter goal title"
                                        className={styles.input}
                                        style={{ 
                                            width: '100%',
                                            padding: '1rem',
                                            fontSize: '1.1rem'
                                        }}
                                    />
                                    <button 
                                        onClick={handleAddGoal} 
                                        className={styles.addButton}
                                        style={{
                                            padding: '1rem 2rem',
                                            fontSize: '1.1rem',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Add Goal
                                    </button>
                                </div>

                                {isReady && (
                                    <div className={styles.goalListWrapper} style={{ 
                                        marginTop: '1rem',
                                        width: '100%'
                                    }}>
                                        <DragDropContext onDragEnd={onDragEnd}>
                                            <Droppable droppableId="goals">
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className={styles.goalCardsContainer}
                                                        style={{ 
                                                            gap: '1rem',
                                                            width: '100%'
                                                        }}
                                                    >
                                                        {goals.map((goal, index) => (
                                                            <Draggable
                                                                key={goal.id}
                                                                draggableId={goal.id.toString()}
                                                                index={index}
                                                            >
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className={`${styles.goalCard} ${snapshot.isDragging ? styles.dragging : ''} ${selectedGoalId === goal.id ? styles.selected : ''}`}
                                                                        onClick={() => setSelectedGoalId(goal.id)}
                                                                        style={{
                                                                            padding: '1.2rem',
                                                                            marginBottom: '0.5rem',
                                                                            width: '100%'
                                                                        }}
                                                                    >
                                                                        <div className={styles.goalCardContent}>
                                                                            <span className={styles.priorityNumber} style={{ fontSize: '1.2rem' }}>{index + 1}</span>
                                                                            <h3 className={styles.goalCardTitle} style={{ fontSize: '1.2rem' }}>{goal.title}</h3>
                                                                        </div>
                                                                        <div className={styles.goalCardProgress} style={{ fontSize: '1.1rem' }}>
                                                                            {Math.round(calculateGoalProgress(goal))}%
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Goal Details */}
                            <div style={{ 
                                flex: '1 1 55%',
                                width: '100%'
                            }}>
                                <div className={styles.goalDetailsContainer} style={{ 
                                    padding: '2rem',
                                    width: '100%'
                                }}>
                                    {selectedGoalId ? (
                                        <GoalItem
                                            goal={goals.find(g => g.id === selectedGoalId)}
                                            onUpdate={handleUpdateGoal}
                                            onDelete={handleDeleteGoal}
                                        />
                                    ) : (
                                        <div className={styles.emptyState} style={{ 
                                            fontSize: '1.2rem',
                                            padding: '2rem',
                                            textAlign: 'center',
                                            width: '100%'
                                        }}>
                                            Select a goal to view its details
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
}

export default GoalList;
