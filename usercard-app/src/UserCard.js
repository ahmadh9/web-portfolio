import React from 'react';
import './UserCard.css';

const UserCard = () => {
  return (
    <div className="user-card">
      <img
        className="user-card__image"
        src="https://randomuser.me/api/portraits/men/75.jpg"
        alt="Profile"
      />
      <h2 className="user-card__name">Ahmad Hammad</h2>
      <p className="user-card__bio">
        Web developer passionate about building beautiful and functional user experiences. Loves React, JavaScript, and learning new technologies.
      </p>
    </div>
  );
};

export default UserCard; 