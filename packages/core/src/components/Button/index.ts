import { Button as _Button } from './Button';
import { ButtonGroup } from './ButtonGroup';

// Attach ButtonGroup as Button.Group (Mantine pattern)
const Button = Object.assign(_Button, {
  Group: ButtonGroup,
});

export { Button };
export type {
  ButtonProps,
  ButtonFactory,
  ButtonStylesNames,
  ButtonVariant,
  ButtonCssVariables,
} from './Button';

export type {
  ButtonGroupProps,
  ButtonGroupFactory,
  ButtonGroupStylesNames,
} from './ButtonGroup';
