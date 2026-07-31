import React from 'react';
import { Loader, type LoaderProps } from './Loader';

export interface FullScreenLoaderProps extends Omit<LoaderProps, 'variant'> {
  message?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message, label, ...props }) => {
  return <Loader variant="overlay" label={message || label} {...props} />;
};

export default FullScreenLoader;
