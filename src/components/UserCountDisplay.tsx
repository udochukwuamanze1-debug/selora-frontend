import { useState, useEffect } from "react";

interface UserCountDisplayProps {
  count: number;
}

const formatUserCount = (count: number): string => {
  if (count >= 10000) return "10k+";
  if (count >= 5000) return "5k+";
  if (count >= 1000) return "1000+";
  if (count >= 500) return "500+";
  if (count >= 100) return `${count}+`;
  return "hundreds of";
};

export const UserCountDisplay = ({ count }: UserCountDisplayProps) => {
  const displayText = formatUserCount(count);
  
  // Mock avatars for display
  const avatarColors = [
    "bg-primary",
    "bg-secondary", 
    "bg-accent",
  ];

  return (
    <div className="flex items-center gap-3 mt-8">
      {/* Overlapping circles */}
      <div className="flex -space-x-3">
        {avatarColors.map((color, index) => (
          <div
            key={index}
            className={`w-10 h-10 rounded-full ${color} border-2 border-background flex items-center justify-center`}
            style={{ zIndex: avatarColors.length - index }}
          >
            <span className="text-xs font-medium text-white">
              {String.fromCharCode(65 + index)}
            </span>
          </div>
        ))}
        <div
          className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <span className="text-xs font-medium text-muted-foreground">+</span>
        </div>
      </div>
      
      {/* User count text */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{displayText}</span> others
      </p>
    </div>
  );
};
