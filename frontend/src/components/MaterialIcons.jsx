import React from 'react';
import {
  PlasticIcon,
  GlassIcon, 
  MetalIcon,
  PaperIcon,
  CardboardIcon,
  BioIcon,
} from './CustomIcons';

export const materialIcons = {
  plastic: { icon: <PlasticIcon />, color: '#007acc', name: 'Plástico' },
  glass: { icon: <GlassIcon />, color: '#00b894', name: 'Vidrio' },
  metal: { icon: <MetalIcon />, color: '#636e72', name: 'Metal' },
  paper: { icon: <PaperIcon />, color: '#fdcb6e', name: 'Papel' },
  cardboard: { icon: <CardboardIcon />, color: '#e17055', name: 'Cartón' },
  biological: { icon: <BioIcon />, color: '#00b894', name: 'Orgánico' },
  unknown: { icon: '❓', color: '#95a5a6', name: 'Desconocido' },
  error: { icon: '❌', color: '#d63031', name: 'Error' },
  no_detection: { icon: '👁️', color: '#74b9ff', name: 'Sin detección' },
};

export const getMaterialInfo = (material) => {
  return materialIcons[material] || materialIcons.unknown;
};