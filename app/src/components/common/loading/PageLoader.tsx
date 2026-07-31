import React from 'react';
import { Loader, type LoaderProps } from './Loader';

export interface PageLoaderProps extends Omit<LoaderProps, 'variant'> {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message, label, ...props }) => {
  return <Loader variant="page" label={message || label} {...props} />;
};

export default PageLoader;
