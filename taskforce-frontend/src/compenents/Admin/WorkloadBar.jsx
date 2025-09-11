import React from 'react';

const WorkloadBar = ({ currentHours, maxHours, user }) => {
    const percentage = maxHours > 0 ? (currentHours / maxHours) * 100 : 0;
    
    let barColor = '#10B981';
    
    if (percentage >= 90) {
        barColor = '#EF4444';
    } else if (percentage >= 75) {
        barColor = '#F59E0B';
    } else if (percentage >= 50) {
        barColor = '#3B82F6';
    }
    
    return (
        <div className="workload-bar-container">
            <div className="workload-info">
                <span className="user-name">{user.firstname} {user.lastname}</span>
                <span className="workload-hours">
                    {currentHours}h / {maxHours}h
                </span>
            </div>
            <div className="workload-bar">
                <div 
                    className="workload-fill"
                    style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: barColor
                    }}
                />
            </div>
            <div className="workload-percentage">
                {percentage.toFixed(1)}%
            </div>
        </div>
    );
};

export default WorkloadBar;
