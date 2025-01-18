'use client';

import { motion } from 'framer-motion';
import { variants, motionConfig } from '@/utils/motion';

export const fadeIn = variants.fadeIn;
export const slideUp = variants.slideUp;

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const FadeInView = motion.div;
export const SlideUpView = motion.div; 