import React, { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('textarea, input, select, [data-autofocus]')?.focus();
    }, 60);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open]);


  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
          className="absolute inset-0 bg-ink-900/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          aria-hidden />
        
          <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`relative flex max-h-[90vh] w-full flex-col rounded-t-lg bg-white shadow-xl sm:rounded-lg ${size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
          
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold text-ink-900">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
              </div>
              <button
              type="button"
              onClick={onClose}
              className="-mr-2 rounded-md p-2 text-ink-500 transition-colors duration-150 hover:bg-canvas hover:text-ink-900"
              aria-label="Đóng">
              
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-hairline px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}