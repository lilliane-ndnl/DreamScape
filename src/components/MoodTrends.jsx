import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import styles from './MoodTrends.module.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function MoodTrends({ entries }) {
    const [timeRange, setTimeRange] = useState('7'); // Default to 7 days

    const filteredEntries = useMemo(() => {
        const now = new Date();
        const daysAgo = parseInt(timeRange);
        const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
        
        return entries
            .filter(entry => new Date(entry.date) >= cutoffDate)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [entries, timeRange]);

    const chartData = {
        labels: filteredEntries.map(() => ''), // Empty labels to hide dates
        datasets: [
            {
                label: 'Mood Rating',
                data: filteredEntries.map(entry => entry.mood?.rating || null),
                borderColor: '#ff8da1',
                backgroundColor: 'rgba(255, 141, 161, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#ff8da1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const entry = filteredEntries[context.dataIndex];
                        let label = `Rating: ${context.parsed.y}/10`;
                        if (entry.mood?.description) {
                            label += `\n${entry.mood.description}`;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                min: 0,
                max: 10,
                ticks: {
                    stepSize: 1
                },
                grid: {
                    color: 'rgba(255, 141, 161, 0.1)'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    display: false // Hide x-axis labels
                }
            }
        }
    };

    return (
        <div className={styles.moodTrendsContainer}>
            <div className={styles.moodTrendsHeader}>
                <h3>Mood Trends</h3>
                <div className={styles.timeRangeSelector}>
                    <button 
                        className={`${styles.timeRangeButton} ${timeRange === '7' ? styles.active : ''}`}
                        onClick={() => setTimeRange('7')}
                    >
                        7 Days
                    </button>
                    <button 
                        className={`${styles.timeRangeButton} ${timeRange === '30' ? styles.active : ''}`}
                        onClick={() => setTimeRange('30')}
                    >
                        30 Days
                    </button>
                    <button 
                        className={`${styles.timeRangeButton} ${timeRange === '90' ? styles.active : ''}`}
                        onClick={() => setTimeRange('90')}
                    >
                        90 Days
                    </button>
                </div>
            </div>
            <div className={styles.chartContainer}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}

export default MoodTrends; 
