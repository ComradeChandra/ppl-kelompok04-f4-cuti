import { Link, type LinkProps } from 'react-router'
import { buttonClass, type ButtonSize, type ButtonVariant } from '../../lib/button-style'

type LinkButtonProps = LinkProps & {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** Tautan berupa tombol, untuk perpindahan halaman yang rupanya tombol board. */
export function LinkButton({ variant, size, className = '', ...props }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />
}
