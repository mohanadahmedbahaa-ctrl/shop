import type { ButtonHTMLAttributes } from 'react'
import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

function Button({ variant, size, className, type = 'button', ...rest }: Props) {
  return <button type={type} className={buttonStyles(variant, size, className)} {...rest} />
}

export default Button
