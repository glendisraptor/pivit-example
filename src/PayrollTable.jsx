import { useState, useEffect } from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import data from './attempt-1-semi-unpivot.json';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Select,
    MenuItem,
    Box,
} from '@mui/material';

const columnHelper = createColumnHelper();

const PayrollTable = () => {
    const [adviser, setAdviser] = useState("Adam Deane");
    const [tableData, setTableData] = useState([]);
    const [monthHeaders, setMonthHeaders] = useState([]);
    const highlightedItems = ["Commission Income", "Other Income", "Commission Expense"];

    const processData = (adviser) => {
        const groupedData = {};

        data.forEach((record) => {
            if (record.adviser_full_name === adviser) {
                const month = new Date(record.payroll_month).toLocaleString('default', { month: 'long' });
                const item = record.item;

                if (!groupedData[month]) {
                    groupedData[month] = {};
                }

                if (!groupedData[month][item]) {
                    groupedData[month][item] = 0;
                }

                groupedData[month][item] += record.amount;
            }
        });

        const newMonthHeaders = Object.keys(groupedData);
        const items = new Set();

        newMonthHeaders.forEach(month => {
            Object.keys(groupedData[month] || {}).forEach(item => {
                items.add(item);
            });
        });

        const newTableData = [];
        items.forEach(item => {
            const row = { item };
            let fy_total = 0;

            newMonthHeaders.forEach(month => {
                const amount = groupedData[month][item] || 0;
                row[month] = amount;
                fy_total += amount;
            });

            row['FY2024 Total'] = fy_total;
            newTableData.push(row);
        });

        setMonthHeaders(newMonthHeaders);
        return newTableData;
    };

    useEffect(() => {
        const newData = processData(adviser);
        setTableData(newData);
    }, [adviser]);

    const columns = [
        columnHelper.accessor('item', {
            header: () => <span>Com Item</span>,
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        ...monthHeaders.map(month =>
            columnHelper.accessor(month, {
                header: () => <span>{month}</span>,
                cell: info => (info.getValue() !== undefined ? info.getValue().toFixed(2) : '0.00'),
                footer: info => info.column.id,
            })
        ),
        columnHelper.accessor('FY2024 Total', {
            header: () => <span>FY2024 Total</span>,
            cell: info => (info.getValue() !== undefined ? info.getValue().toFixed(2) : '0.00'),
            footer: info => info.column.id,
        }),
    ];

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="body1" color="white" align="left">
                    SALARY & COMMISSION STATEMENT FY 2024 <br />
                    <small>{adviser}</small>
                </Typography>
                <Select
                    value={adviser}
                    size="small"
                    onChange={(e) => setAdviser(e.target.value)}
                    variant="outlined"
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: 1,
                    }}
                >
                    <MenuItem value="Adam Deane">Adam Deane</MenuItem>
                    <MenuItem value="Craig French">Craig French</MenuItem>
                    <MenuItem value="Greg Etherstone">Greg Etherstone</MenuItem>
                    <MenuItem value="Ian Black">Ian Black</MenuItem>
                    <MenuItem value="Jack Kwong">Jack Kwong</MenuItem>
                    <MenuItem value="Jarrod Wong">Jarrod Wong</MenuItem>
                </Select>
            </Box>

            <TableContainer component={Paper} sx={{ backgroundColor: '#424242' }} size='small'>
                <Table size='small'>
                    <TableHead size='small'>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableCell key={header.id} sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#616161' }} size='small'>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>

                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow
                                key={row.id}
                                sx={{
                                    backgroundColor: highlightedItems.includes(row.original.item) ? "#607d8b" : "",
                                    '&:last-child td, &:last-child th': {
                                        border: 0,
                                    },
                                }}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <TableCell
                                        key={cell.id}
                                        sx={{
                                            color: 'white',
                                            fontWeight: highlightedItems.includes(row.original.item) ? 'bold' : 'normal',
                                            fontSize: highlightedItems.includes(row.original.item) ? '1.1rem' : '1rem',
                                            padding: '16px',
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </TableContainer>
        </div>
    );
};

export default PayrollTable;
