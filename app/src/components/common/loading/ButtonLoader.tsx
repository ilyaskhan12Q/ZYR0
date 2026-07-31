import React from 'react';
import { Loader, type LoaderProps } from './Loader';

export interface ButtonLoaderProps extends Omit<LoaderProps, 'variant'> {
  loading?: boolean;
  loadingText?: string;
  children?: React.ReactNode;
}

export const ButtonLoader: React.FC<ButtonLoaderProps> = ({
  loading = true,
  loadingText,
  label,
  text,
  children,
  ...props
}) => {
  if (!loading) {
    return <>{children}</>;
  }
  return <Loader variant="button" label={label ?? loadingText ?? text} {...props} />;
};

export default ButtonLoader;
