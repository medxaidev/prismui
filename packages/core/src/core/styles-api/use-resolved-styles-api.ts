import type { FactoryPayload } from '../factory';
import { useTheme } from '../PrismuiProvider/prismui-theme-context';
import type { ClassNames, Styles } from './styles-api.types';
import { resolveClassNames } from './use-styles/get-class-name/resolve-class-names';
import { resolveStyles } from './use-styles/get-style/resolve-styles';

export interface UseResolvedStylesApiInput<Payload extends FactoryPayload> {
  classNames: ClassNames<Payload> | undefined;
  styles: Styles<Payload> | undefined;
  props: Record<string, any>;
  stylesCtx?: Record<string, any>;
}

export function useResolvedStylesApi<Payload extends FactoryPayload>({
  classNames,
  styles,
  props,
  stylesCtx,
}: UseResolvedStylesApiInput<Payload>) {
  const theme = useTheme();

  return {
    resolvedClassNames: resolveClassNames(
      theme,
      classNames as any,
      props,
      stylesCtx || undefined,
    ),

    resolvedStyles: resolveStyles(
      theme,
      styles as any,
      props,
      stylesCtx || undefined,
    ),
  };
}
