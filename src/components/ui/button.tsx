import * as React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'secondary' }

export function Button({ className='', variant='default', ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium shadow transition active:scale-[0.98]'
  const variants: Record<string,string> = {
    default: 'bg-neutral-900 text-white hover:bg-neutral-800',
    secondary: 'bg-white text-neutral-900 border border-black/10 hover:bg-neutral-50'
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
