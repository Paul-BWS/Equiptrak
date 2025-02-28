import React from 'react';

export default function StandaloneTest() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Standalone Test Page</h1>
      <p>This is a completely standalone test page with no dependencies.</p>
      <p>If you can see this, the basic routing is working.</p>
      
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <p><strong>Debug Info:</strong></p>
        <p>Current URL: {window.location.href}</p>
        <p>Pathname: {window.location.pathname}</p>
      </div>
      
      <button 
        style={{ 
          marginTop: '20px', 
          padding: '8px 16px', 
          background: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => window.location.href = '/admin'}
      >
        Return to Admin
      </button>
    </div>
  );
} 