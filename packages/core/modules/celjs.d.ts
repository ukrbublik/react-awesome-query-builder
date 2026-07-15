// Minimal type shim for `cel-js`, mapped via tsconfig `paths`.
// The published cel-js ships a broken declaration (dist/helper.d.ts imports a
// missing ./cst-definitions.js), which fails `tsc` with skipLibCheck:false.
// Only `parse` is used by the CEL importer (via a lazy dynamic import).
export function parse(expression: string): {
  isSuccess?: boolean;
  cst?: unknown;
  errors?: Array<{ message?: string } | string>;
};
