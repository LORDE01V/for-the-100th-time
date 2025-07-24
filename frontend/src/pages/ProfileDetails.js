import React from 'react';
import supportBackground from '../assets/images/Support_page.png'; // Import the new background image

const ProfileDetails = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${supportBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
          zIndex: 1,
        }}
      ></div>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1>Profile Details</h1>
        <p>Update your personal information here.</p>
      </div>
    </div>
  );
};

export default ProfileDetails;

