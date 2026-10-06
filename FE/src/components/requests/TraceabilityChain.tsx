import React from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon, FileTextIcon, PackageCheckIcon, PackageIcon, ScaleIcon, BoxIcon } from "lucide-react";
export interface TraceNode {
  label: string;
  value: string;
  sub?: string;
  to?: string;
  done: boolean;
}
const ICONS: BoxIcon[] = [FileTextIcon, ScaleIcon, PackageIcon, PackageCheckIcon];
export function TraceabilityChain({
  nodes


}: {nodes: TraceNode[];}) {
  return <ol className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0" aria-label="Truy vết PR ↔ Quotation ↔ PO ↔ Receiving">
      {nodes.map((n, i) => {
      const Icon = ICONS[i] ?? FileTextIcon;
      const body = <div className={`flex h-full items-start gap-3 rounded-lg border px-3 py-3 ${n.done ? 'border-hairline bg-white' : 'border-dashed border-line bg-canvas'}`}>
            <Icon className={`mt-0.5 h-4 w-4 flex-none ${n.done ? 'text-primary-600' : 'text-ink-300'}`} aria-hidden />
            <div className="min-w-0">
              <p className="text-xs text-ink-500">{n.label}</p>
              <p className={`truncate text-sm font-semibold ${n.done ? 'text-ink-900' : 'text-ink-500'}`}>{n.value}</p>
              {n.sub && <p className="truncate text-xs text-ink-500">{n.sub}</p>}
            </div>
          </div>;
      return <li key={n.label} className="flex flex-1 items-center md:min-w-0">
            <div className="min-w-0 flex-1">
              {n.to && n.done ? <Link to={n.to} className="block rounded-lg transition-colors duration-150 hover:bg-canvas">
                  {body}
                </Link> : body}
            </div>
            {i < nodes.length - 1 && <ChevronRightIcon className="mx-1 hidden h-4 w-4 flex-none text-ink-300 md:block" aria-hidden />}
          </li>;
    })}
    </ol>;
}