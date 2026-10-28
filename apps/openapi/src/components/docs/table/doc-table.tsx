import { memo } from "react";
import {
  DocTableCell,
  type DocTableCellVariant,
  DocTableContainer,
  DocTableHeadCell,
  DocTableRow,
} from "./doc-table-style";

export interface DocTableColumn {
  key: string;
  label: string;
  // 지정하지 않으면 남은 너비를 차지
  width?: number;
  variant?: DocTableCellVariant;
}

interface DocTableProps {
  columns: DocTableColumn[];
  rows: Record<string, string>[];
}

function DocTableComponent({ columns, rows }: DocTableProps) {
  return (
    <DocTableContainer role="table">
      <DocTableRow role="row">
        {columns.map((column) => (
          <DocTableHeadCell
            key={column.key}
            role="columnheader"
            cellWidth={column.width}
          >
            {column.label}
          </DocTableHeadCell>
        ))}
      </DocTableRow>
      {rows.map((row, index) => (
        <DocTableRow key={index} role="row">
          {columns.map((column) => (
            <DocTableCell
              key={column.key}
              role="cell"
              cellWidth={column.width}
              variant={column.variant ?? "default"}
            >
              {row[column.key]}
            </DocTableCell>
          ))}
        </DocTableRow>
      ))}
    </DocTableContainer>
  );
}

export const DocTable = memo(DocTableComponent);
