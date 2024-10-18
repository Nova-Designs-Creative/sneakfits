"use client";
import { cn } from "@/lib/utils";
import React from "react";

const Loaders = () => {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <style jsx>{`
        .loader-container {
          display: flex;
          justify-content: center; /* Centers the loader horizontally */
          align-items: center; /* Centers the loader vertically */
          height: 100vh; /* Full height of the viewport */
        }

        .loader {
          width: 90px;
          height: 14px;
          --c: #fff 90deg, #0000 0;
          background: conic-gradient(from 135deg at top, var(--c)) 0 0,
            conic-gradient(from -45deg at bottom, var(--c)) 0 100%;
          background-size: calc(100% / 4) 50%;
          background-repeat: repeat-x;
          animation: l12 1s infinite;
        }

        @keyframes l12 {
          80%,
          100% {
            background-position: calc(100% / 3) 0, calc(100% / -3) 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Loaders;
