import React from 'react';
import { Loader, type LoaderProps } from './Loader';

export const InlineLoader: React.FC<Omit<LoaderProps, 'variant'>> = (props) => {
  return <Loader variant="inline" {...props} />;
};

export default InlineLoader;
