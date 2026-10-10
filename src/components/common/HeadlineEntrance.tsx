import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface HeadlineEntranceProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'span';
  className?: string;
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}

/**
 * HeadlineEntrance — Premium, subtle entrance motion for headlines across landing and product pages.
 * 
 * Features:
 * - Subtle fade-and-rise (8px vertical travel) with high-end cubic easing.
 * - Animates once upon mount; complete text is semantic and accessible.
 * - Automatically respects `prefers-reduced-motion` and disables transforms when active.
 * - Stable typography bounding box preventing layout shifts.
 */
export const HeadlineEntrance: React.FC<HeadlineEntranceProps> = ({
  as = 'h1',
  className = '',
  children,
  delay = 0,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, render clean static semantic markup without movement
  if (shouldReduceMotion) {
    return React.createElement(as, { className, style }, children);
  }

  const MotionComponent = (motion as any)[as] || motion.h1;

  return (
    <MotionComponent
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.16, 1, 0.3, 1], // Smooth luxury deceleration curve
      }}
      className={className}
      style={style}
    >
      {children}
    </MotionComponent>
  );
};

export default HeadlineEntrance;
