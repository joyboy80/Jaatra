export default function ResponsiveDataList({ columns, rows, rowKey = "id", renderMobile, emptyMessage = "No records found." }) {
  if (!rows.length) {
    return <div className="rounded-xl bg-white p-8 text-center text-sm font-semibold text-safar-gray shadow-sm ring-1 ring-slate-200">{emptyMessage}</div>;
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-safar-mint/60 text-xs font-bold uppercase tracking-wider text-safar-navy">
              <tr>{columns.map((column) => <th key={column.label} className="px-4 py-3">{column.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row[rowKey]} className="text-safar-ink transition hover:bg-safar-mint/70 hover:text-safar-ink">
                  {columns.map((column) => <td key={column.label} className="px-4 py-4 align-top">{column.render(row)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid gap-3 lg:hidden">{rows.map((row) => <div key={row[rowKey]}>{renderMobile(row)}</div>)}</div>
    </>
  );
}
