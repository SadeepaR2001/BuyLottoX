// import type { InputHTMLAttributes } from 'react'
// import { cn } from '../../utils/cn'

// export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
//   const { className, ...rest } = props
//   return (
//     <input
//       className={cn(
//         'w-full rounded-xl border border-blx-border bg-black/30 px-3 py-2 text-sm text-blx-text outline-none placeholder:text-white/30 focus:ring-2 focus:ring-blx-purple/40',
//         className
//       )}
//       {...rest}
//     />
//   )
// }

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white outline-none ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';