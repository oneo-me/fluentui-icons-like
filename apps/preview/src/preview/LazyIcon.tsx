import { useEffect, useState } from 'react';
import type {
  PreviewIconComponent,
  PreviewIconEntry,
  PreviewIconStyle,
} from './registry';

interface LazyIconProps {
  icon: PreviewIconEntry;
  size: number;
  variant: PreviewIconStyle;
  title?: string | null;
}

export function LazyIcon({ icon, size, variant, title = null }: LazyIconProps) {
  const [Component, setComponent] = useState<PreviewIconComponent | null>(null);

  useEffect(() => {
    let active = true;
    setComponent(null);
    void icon.load().then((module) => {
      if (active) setComponent(() => module.default);
    });
    return () => {
      active = false;
    };
  }, [icon]);

  if (!Component) {
    return (
      <span className="icon-skeleton" style={{ width: size, height: size }} />
    );
  }

  return <Component size={size} variant={variant} title={title} />;
}
