'use client';

import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from 'react';

type MenuPlacement = 'top' | 'bottom' | 'auto';
type MenuWidthClass = 'w-40' | 'w-56';
type MenuZClass = 'z-20' | 'z-30';

type MenuTrigger = {
  triggerRef: RefObject<HTMLButtonElement | null>;
  triggerProps: {
    type: 'button';
    'aria-expanded': boolean;
    'aria-controls': string;
    onClick: () => void;
  };
};

type MenuClose = (options?: { restoreFocus?: boolean }) => void;

const MenuCloseContext = createContext<MenuClose | null>(null);

export function useMenuClose(): MenuClose {
  const close = useContext(MenuCloseContext);

  if (!close) {
    throw new Error('useMenuClose must be used within Menu');
  }

  return close;
}

type MenuProps = {
  label: string;
  placement: MenuPlacement;
  widthClass: MenuWidthClass;
  zClass?: MenuZClass;
  autoFocusFirst?: boolean;
  className?: string;
  trigger: (props: MenuTrigger) => ReactNode;
  children: ReactNode;
};

export function Menu({
  label,
  placement,
  widthClass,
  zClass = 'z-20',
  autoFocusFirst = false,
  className,
  trigger,
  children,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'top' | 'bottom'>(placement === 'bottom' ? 'bottom' : 'top');
  const [panelLimit, setPanelLimit] = useState<number | null>(null);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(({ restoreFocus = true }: { restoreFocus?: boolean } = {}) => {
    setOpen(false);

    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  const measure = useCallback(() => {
    if (placement !== 'auto') {
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const above = rect.top;
    const below = window.innerHeight - rect.bottom;
    const nextSide = below >= above ? 'bottom' : 'top';

    setSide(nextSide);
    setPanelLimit(Math.max(0, (nextSide === 'top' ? above : below) - 16));
  }, [placement]);

  const handleResize = useEffectEvent(() => {
    measure();
  });

  const toggle = useCallback(() => {
    if (!open) {
      measure();
    }

    setOpen((value) => !value);
  }, [open, measure]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (autoFocusFirst) {
      panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        close({ restoreFocus: false });
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, autoFocusFirst, close]);

  useEffect(() => {
    if (!open || placement !== 'auto') {
      return;
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [open, placement]);

  const resolvedPlacement = placement === 'auto' ? side : placement;
  const positionClass = resolvedPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  const panelStyle: CSSProperties | undefined =
    placement === 'auto' && panelLimit !== null ? { maxHeight: panelLimit, overflowY: 'auto' } : undefined;

  return (
    <div ref={containerRef} className={className ? `relative ${className}` : 'relative'}>
      {trigger({
        triggerRef,
        triggerProps: {
          type: 'button',
          'aria-expanded': open,
          'aria-controls': menuId,
          onClick: toggle,
        },
      })}
      {open && (
        <div
          ref={panelRef}
          id={menuId}
          role="group"
          aria-label={label}
          style={panelStyle}
          className={`absolute right-0 ${positionClass} ${zClass} flex ${widthClass} flex-col gap-1 rounded-2xl border border-white/50 bg-white/50 p-2 shadow-xl backdrop-blur-sm dark:border-white/20 dark:bg-black/50`}
        >
          <MenuCloseContext.Provider value={close}>{children}</MenuCloseContext.Provider>
        </div>
      )}
    </div>
  );
}
