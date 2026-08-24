import type { AnchorHTMLAttributes, ReactNode } from "react"

function isPdf(href?: string) {
  return typeof href === "string" && href.toLowerCase().includes(".pdf")
}

export function MdLink({
  href,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
  const pdf = isPdf(href)
  return (
    <a
      href={href}
      {...rest}
      {...(pdf ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  )
}

export const mdxComponents = { a: MdLink }
