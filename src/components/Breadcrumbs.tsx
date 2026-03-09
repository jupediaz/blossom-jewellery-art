import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-warm-gray">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="flex-shrink-0 opacity-50" />}
              {isLast || !item.href ? (
                <span className={isLast ? "text-charcoal font-medium" : undefined}>
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-charcoal transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
