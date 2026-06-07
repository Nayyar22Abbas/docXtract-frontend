'use client';

import { motion } from 'framer-motion';
import { FileText, Brain, Cpu, Database, Cloud, Lock, Layers, Search, BarChart3, GitBranch } from 'lucide-react';

const icons = [
  { Icon: FileText, delay: 0 },
  { Icon: Brain, delay: 0.5 },
  { Icon: Cpu, delay: 1 },
  { Icon: Database, delay: 1.5 },
  { Icon: Cloud, delay: 2 },
  { Icon: Lock, delay: 2.5 },
  { Icon: Layers, delay: 3 },
  { Icon: Search, delay: 3.5 },
  { Icon: BarChart3, delay: 4 },
  { Icon: GitBranch, delay: 4.5 },
];

const positions = [
  { left: '5%', top: '20%' },
  { left: '90%', top: '15%' },
  { left: '8%', top: '70%' },
  { left: '85%', top: '75%' },
  { left: '15%', top: '45%' },
  { left: '88%', top: '45%' },
  { left: '3%', top: '90%' },
  { left: '92%', top: '90%' },
  { left: '12%', top: '10%' },
  { left: '82%', top: '60%' },
];

export function FloatingIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, delay }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={positions[index]}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.4, 0.2, 0.4],
            scale: 1,
            y: [0, -20, 0, 20, 0],
          }}
          transition={{
            opacity: {
              delay: delay,
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
            },
            scale: {
              delay: delay,
              duration: 0.5,
              ease: 'backOut',
            },
            y: {
              delay: delay,
              duration: 6 + index * 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{
              duration: 8 + index,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary/30" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export default FloatingIcons;
