import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 背景圆形 */}
      <circle
        cx="50"
        cy="50"
        r="45"
        className="fill-primary/10 dark:fill-primary/20"
      />
      
      {/* 主要图形 - 抽象的 "B" 和 "P" 组合 */}
      <path
        d="M35 25C35 25 45 25 50 25C55 25 65 25 65 35C65 45 55 45 50 45C45 45 35 45 35 45V75"
        className="stroke-primary"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* 装饰性元素 - 动态线条 */}
      <path
        d="M50 45C55 45 65 45 65 55C65 65 55 65 50 65C45 65 35 65 35 65"
        className="stroke-primary"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* 点缀元素 */}
      <circle
        cx="65"
        cy="35"
        r="3"
        className="fill-primary"
      />
      <circle
        cx="65"
        cy="55"
        r="3"
        className="fill-primary"
      />
      
      {/* 动态效果装饰 */}
      <path
        d="M75 30C75 30 85 40 85 50C85 60 75 70 75 70"
        className="stroke-primary/30"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default Logo; 