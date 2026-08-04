interface FieldSectionProps {
  icon: React.ReactNode;
  title: string;
  /** The question this field answers, as posed in the document format. */
  hint?: string;
  items: string[];
  accent: string;
}

/**
 * The authors use short "Tactisch niveau:" lines to group the bullets that
 * follow. They arrive as ordinary list items, so they are promoted back to
 * sub-headings here rather than rendered as bullets of their own.
 */
function isSubHeading(item: string) {
  return item.endsWith(":") && item.length < 60;
}

interface Group {
  label: string | null;
  items: string[];
}

function group(items: string[]): Group[] {
  const groups: Group[] = [];
  for (const item of items) {
    if (isSubHeading(item)) {
      groups.push({ label: item.replace(/:$/, ""), items: [] });
    } else {
      if (groups.length === 0) groups.push({ label: null, items: [] });
      groups[groups.length - 1].items.push(item);
    }
  }
  return groups.filter((entry) => entry.items.length > 0 || entry.label);
}

export function FieldSection({ icon, title, hint, items, accent }: FieldSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="scroll-mt-20">
      <div className="mb-3 flex items-baseline gap-2 border-l-2 pl-3" style={{ borderColor: accent }}>
        <span style={{ color: accent }} className="shrink-0 translate-y-0.5">
          {icon}
        </span>
        <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
        {hint && (
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
            {hint}
          </span>
        )}
      </div>

      <div className="space-y-4 pl-3">
        {group(items).map((entry, groupIndex) => (
          <div key={groupIndex}>
            {entry.label && (
              <h3 className="mb-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold text-foreground/60">
                {entry.label}
              </h3>
            )}
            <ul className="space-y-2">
              {entry.items.map((item, index) => (
                <li
                  key={index}
                  className="flex gap-2.5 text-[15px] leading-7 text-foreground/75"
                >
                  <span
                    className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
