import type { ButtonHTMLAttributes } from 'react'
import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles'

// 1. INTERSECTION TYPE (&): "all normal <button> attributes PLUS our own props".
//    So <Button onClick={...} disabled aria-label="..."> all work without listing them.
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

// 2. REST PROPS: `...rest` collects every prop we didn't name, then {...rest} passes
//    them on to the real <button>. type="button" is the default so a button inside
//    a <form> doesn't submit the form by accident (the browser default is "submit").
function Button({ variant, size, className, type = 'button', ...rest }: Props) {
  return <button type={type} className={buttonStyles(variant, size, className)} {...rest} />
}

export default Button
