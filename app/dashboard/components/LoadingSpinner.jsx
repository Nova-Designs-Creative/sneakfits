"use client";

import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="loader">
      {/* Customize the loader style as needed */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default LoadingSpinner;
