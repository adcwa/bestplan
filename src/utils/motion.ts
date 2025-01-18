import { HTMLMotionProps } from 'framer-motion';

// 检查是否支持动画
const canUseDOM = typeof window !== 'undefined';
const prefersReducedMotion = canUseDOM
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// 动画配置
export const motionConfig = {
  initial: prefersReducedMotion ? false : true,
  animate: true,
  exit: prefersReducedMotion ? false : true,
};

// 基础动画属性
export const baseTransition = {
  type: 'spring',
  duration: 0.3,
  bounce: 0.2,
};

// 动画变体
export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: baseTransition,
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: baseTransition,
  },
}; 