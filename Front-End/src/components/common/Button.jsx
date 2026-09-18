import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Button({
  children,
  href,
  onClick,
  type = "button",

  // Icon settings
  icon: Icon = ArrowRight,
  iconSize = 16,
  showIcon = true,
  iconPosition = "right",

  className = "",
  disabled = false,
}) {
  const classes = `
    btn-primary
    inline-flex
    items-center
    justify-center
    gap-2
    ${className}
  `;

  const content = (
    <>
      {showIcon && iconPosition === "left" && Icon && (
        <Icon size={iconSize} />
      )}

      {children}

      {showIcon && iconPosition === "right" && Icon && (
        <Icon size={iconSize} />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${classes} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {content}
    </button>
  );
}