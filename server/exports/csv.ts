/**
 * CSV export: the shopping list, one row per item, properly quoted.
 * Columns: Department,Item,Quantity,Spec,Est Cost Low,Est Cost High,Required,Notes
 */
import type { BuildPlan } from "../../shared/types";

function csvField(value: string | number | boolean | undefined): string {
  const s = value === undefined || value === null ? "" : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(fields: (string | number | boolean | undefined)[]): string {
  return fields.map(csvField).join(",");
}

export function shoppingListCsv(plan: BuildPlan): string {
  const rows: string[] = [
    csvRow(["Department", "Item", "Quantity", "Spec", "Est Cost Low", "Est Cost High", "Required", "Notes"]),
  ];
  for (const dept of plan.shoppingListByDepartment) {
    const deptLabel = dept.store ? `${dept.store} - ${dept.department}` : dept.department;
    for (const item of dept.items) {
      rows.push(
        csvRow([
          deptLabel,
          item.name,
          item.quantity,
          item.spec,
          item.estimatedCostLow,
          item.estimatedCostHigh,
          item.required ? "Yes" : "No",
          item.notes ?? "",
        ])
      );
    }
  }
  return rows.join("\r\n") + "\r\n";
}
