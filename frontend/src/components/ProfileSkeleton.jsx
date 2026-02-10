import React from 'react';

const ProfileSkeleton = () => {
    // Definimos los estilos base para que no den error de "undefined"
    const baseStyles = {
        container: { display: 'flex', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' },
        card: { width: '100%', maxWidth: '500px', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }
    };

    const skeletonStyles = {
        circle: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e2e8f0', margin: '0 auto 20px', animation: 'pulse 1.5s infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' },
        lineTitle: { width: '150px', height: '20px', backgroundColor: '#e2e8f0', margin: '0 auto 30px', borderRadius: '4px', animation: 'pulse 1.5s infinite' },
        field: { marginBottom: '20px' },
        label: { width: '60px', height: '10px', backgroundColor: '#edf2f7', marginBottom: '8px', borderRadius: '2px' },
        input: { width: '100%', height: '40px', backgroundColor: '#f7fafc', borderRadius: '8px', border: '1px solid #edf2f7' }
    };

    return (
        <div style={baseStyles.container}>
            <div style={baseStyles.card}>
                {/* Agregamos el icono de usuario para que se vea más real */}
                <div style={skeletonStyles.circle}>
                    <i className="fa-solid fa-user" style={{ color: '#cbd5e0', fontSize: '30px' }}></i>
                </div>
                <div style={skeletonStyles.lineTitle}></div>
                
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={skeletonStyles.field}>
                        <div style={skeletonStyles.label}></div>
                        <div style={skeletonStyles.input}></div>
                    </div>
                ))}
                
                {/* Simulacro del botón de abajo */}
                <div style={{...skeletonStyles.input, marginTop: '20px', backgroundColor: '#e2e8f0', height: '45px'}}></div>
            </div>
        </div>
    );
};

export default ProfileSkeleton;