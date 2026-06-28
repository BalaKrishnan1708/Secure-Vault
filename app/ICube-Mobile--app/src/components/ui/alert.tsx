import React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Alert({ className = '', ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-lg border p-4 ${className}`}
      {...props}
    />
  );
}

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertDescription({
  className = '',
  ...props
}: AlertDescriptionProps) {
  return (
    <div
      className={`text-sm [&_p]:leading-relaxed ${className}`}
      {...props}
    />
  );
}