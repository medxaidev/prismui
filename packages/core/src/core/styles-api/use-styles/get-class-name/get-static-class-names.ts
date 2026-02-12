const CLASS_PREFIX = 'prismui';

/** Returns static component classes, e.g. `prismui-Button-root` */
export function getStaticClassNames(
  themeName: string[],
  selector: string,
  withStaticClass?: boolean,
): string[] {
  if (withStaticClass === false) {
    return [];
  }
  return themeName.map((n) => `${CLASS_PREFIX}-${n}-${selector}`);
}
