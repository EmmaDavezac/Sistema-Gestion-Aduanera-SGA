import React from 'react';

const SkeletonTable = ({ rows = 5 }) => {
    const styles = {
        cardSkeleton: {
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '15px',
            border: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: 'pulse 1.5s infinite ease-in-out'
        },
        leftSection: { display: 'flex', alignItems: 'center', gap: '15px' },
        circle: {
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            backgroundColor: '#e2e8f0'
        },
        lineShort: {
            width: '80px',
            height: '12px',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            marginBottom: '8px'
        },
        lineLong: {
            width: '180px',
            height: '10px',
            backgroundColor: '#edf2f7',
            borderRadius: '4px'
        },
        buttonPlaceholder: {
            width: '40px',
            height: '35px',
            backgroundColor: '#edf2f7',
            borderRadius: '6px'
        }
    };

    return (
        <div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} style={styles.cardSkeleton}>
                    <div style={styles.leftSection}>
                        <div style={styles.circle}></div>
                        <div>
                            <div style={styles.lineShort}></div>
                            <div style={styles.lineLong}></div>
                        </div>
                    </div>
                    <div style={styles.buttonPlaceholder}></div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonTable;