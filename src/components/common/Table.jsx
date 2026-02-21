
import React from 'react';

const Table = ({ children, className = '' }) => {
    return (
        <div className={`w-full overflow-hidden rounded-2xl border border-neutral-200 ${className}`}>
            <table className="w-full text-left text-sm">
                {children}
            </table>
        </div>
    );
};

export const TableHead = ({ children }) => (
    <thead className="bg-neutral-50 text-neutral-900 font-bold border-b border-neutral-200">
        {children}
    </thead>
);

export const TableBody = ({ children }) => (
    <tbody className="divide-y divide-neutral-100 bg-white">
        {children}
    </tbody>
);

export const TableRow = ({ children, className = '' }) => (
    <tr className={`hover:bg-neutral-50 transition-colors ${className}`}>
        {children}
    </tr>
);

export const TableHeader = ({ children, className = '' }) => (
    <th className={`px-6 py-4 font-bold tracking-wider ${className}`}>
        {children}
    </th>
);

export const TableCell = ({ children, className = '' }) => (
    <td className={`px-6 py-4 text-neutral-600 ${className}`}>
        {children}
    </td>
);

export default Table;
