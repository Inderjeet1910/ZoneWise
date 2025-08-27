import React from 'react';

const RatingBar = ({ icon, label, value }) => {
  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <div className="text-lg mr-2">{icon}</div>
        <span className="font-medium text-blue-800">{label}</span>
      </div>
      
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(value / 10) * 100}%` }}
          ></div>
        </div>
        <span className="text-sm font-bold text-blue-800">{value}/10</span>
      </div>
    </div>
  );
};

export default RatingBar;