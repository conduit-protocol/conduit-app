import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ padded = true, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`card ${padded ? '' : '!p-0'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
