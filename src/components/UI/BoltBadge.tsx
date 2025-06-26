import React, { useState } from 'react';

const BADGE_IMG = "https://storage.bolt.army/white_circle_360x360.png";

export const BoltBadge: React.FC = () => {
  const [animated, setAnimated] = useState(false);

  const handleAnimationEnd = () => setAnimated(true);

  return (
    <div className="fixed top-4 right-4 z-[60]">
      <a
        href="https://bolt.new/?rid=os72mi"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-all duration-300 hover:shadow-2xl"
      >
        <img
          src={BADGE_IMG}
          alt="Built with Bolt.new badge"
          className={`w-20 h-20 md:w-28 md:h-28 rounded-full shadow-lg bolt-badge bolt-badge-intro${animated ? " animated" : ""}`}
          onAnimationEnd={handleAnimationEnd}
        />
      </a>
    </div>
  );
};

export default BoltBadge;