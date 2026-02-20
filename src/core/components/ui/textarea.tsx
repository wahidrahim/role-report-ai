import * as React from 'react';

import { cn } from '@/core/lib/utils';
import { ComponentProps } from "react";

function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground outline-none transition-colors selection:bg-primary selection:text-primary-foreground focus-visible:border-primary/50 focus-visible:ring-primary/50 focus-visible:ring-[2px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
