import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js auto for React-Chartjs-2 compatibility

// Function to generate dummy fault data
const generateDummyFaultData = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
        day,
        faults: Math.floor(Math.random() * 10) // Random number of faults (0-10)
    }));
};

const FaultVisualization = () => {
    const [faultData, setFaultData] = useState(generateDummyFaultData());

    // Simulate live updates every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setFaultData(generateDummyFaultData());
        },300000); // Update every 5 minutes
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    // Prepare data for the chart
    const chartData = {
        labels: faultData.map(data => data.day),
        datasets: [
            {
                label: 'Faults',
                data: faultData.map(data => data.faults),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Fault Visualization (Past 7 Days)',
            },
        },
    };

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <Bar data={chartData} options={chartOptions} />
        </div>
    );
};

export default FaultVisualization;