import React from 'react';
import { SvgIcon } from '@mui/material';

export const PlasticIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
  </SvgIcon>
);

export const GlassIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"/>
  </SvgIcon>
);

export const MetalIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M12 2L6.5 11H10v8h4v-8h3.5z"/>
  </SvgIcon>
);

export const PaperIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </SvgIcon>
);

export const CardboardIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M20 6H4l8 4zM4 8v10h16V8l-8 5z"/>
  </SvgIcon>
);

export const BioIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
  </SvgIcon>
);