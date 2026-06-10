import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const QUALITY_SUFFIX = { maj: '', min: 'm', dim: '°', aug: '+' };

export default function ChordNode({ node, isActive = false, isSelected = false, isSuggested = false, onClick }) {
  const suffix = QUALITY_SUFFIX[node.quality] ?? '';

  const nodeClass = [
    'chord-node',
    isActive          ? 'active'   : '',
    isSelected        ? 'selected' : '',
    node.degree === 0 ? 'tonic'    : '',
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className="chord-node-wrapper"
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      animate={{ scale: isActive ? [1, 1.12, 1] : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      data-testid={`chord-node-${node.roman}`}
    >
      <div
        className={nodeClass}
        onClick={onClick}
        style={node.degree === 0 ? { width: '68px', height: '68px' } : undefined}
      >
        <span className="chord-node-roman">{node.roman}</span>
        <span className="chord-node-name">{node.root}</span>
        <span className="chord-node-quality">{suffix}</span>
        <div className="chord-node-led" />
      </div>
    </motion.div>
  );
}

ChordNode.propTypes = {
  node:        PropTypes.object.isRequired,
  isActive:    PropTypes.bool,
  isSelected:  PropTypes.bool,
  isSuggested: PropTypes.bool,
  onClick:     PropTypes.func.isRequired,
};


