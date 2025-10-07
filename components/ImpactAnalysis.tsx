import React, { useMemo, useState } from 'react';
import { HRRecord, Collaborator, RecordType, ContractType, IngresoDetails, AusenciaDetails, EgresoDetails, SanctionType, SancionDetails } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';

interface ImpactAnalysisProps {
  records: HRRecord[];
  collaborators: Collaborator[];
}

type TerminationReasonData = {
    name: string;
    count: number;
    cost: number;
};

type SortConfig = {
  key: keyof TerminationReasonData;
  direction: 'asc' | 'desc';
};

const EmptyState: React.FC<{ message?: string }> = ({ message = 'No hay datos para el período seleccionado.' }) => (
    <div className="flex items-center justify-center h-full min-h-[300px] bg-slate-50 rounded-lg p-4">
        <p className="text-slate-500 text-center italic">{message}</p>
    </div>
);


const KPICard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-transform hover:scale-105">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
        <p className="text-slate-400 text-xs mt-1">{description}</p>
    </div>
);

const dateRangeOptions = {
    this_year: 'Este Año',
    last_year: 'Año Anterior',
    this_month: 'Este Mes',
    last_month: 'Mes Anterior',
    last_7_days: 'Últimos 7 días',
    custom: 'Personalizado'
};
type DateRangeKey = keyof typeof dateRangeOptions;


const ImpactAnalysis: React.FC<ImpactAnalysisProps> = ({ records, collaborators }) => {
    
    const initialDateRange = useMemo(() => {
        if (!records || records.length === 0) {
            const today = new Date();
            const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));
            return {
                start: oneYearAgo.toISOString().split('T')[0],
                end: today.toISOString().split('T')[0],
            };
        }

        const dates = records.map(r => new Date(r.date).getTime());
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        return {
            start: minDate.toISOString().split('T')[0],
            end: maxDate.toISOString().split('T')[0],
        };
    }, [records]);

    const [dateRange, setDateRange] = useState<DateRangeKey>('custom');
    const [customStartDate, setCustomStartDate] = useState(initialDateRange.start);
    const [customEndDate, setCustomEndDate] = useState(initialDateRange.end);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'cost', direction: 'desc' });
    const [manualDailySalary, setManualDailySalary] = useState<number | string>('');


    const [filters, setFilters] = useState({
        ug: 'all',
        contractType: 'all'
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const { startDate, endDate } = useMemo(() => {
        const now = new Date();
        let start, end;

        switch (dateRange) {
            case 'last_7_days':
                end = new Date(now);
                start = new Date(now);
                start.setDate(now.getDate() - 7);
                break;
            case 'this_month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'last_month':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'this_year':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
            case 'last_year':
                start = new Date(now.getFullYear() - 1, 0, 1);
                end = new Date(now.getFullYear() - 1, 11, 31);
                break;
            case 'custom':
            default:
                start = new Date(customStartDate);
                end = new Date(customEndDate);
                break;
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return { startDate: start, endDate: end };
    }, [dateRange, customStartDate, customEndDate]);


    const uniqueUGs = useMemo(() => [...new Set(collaborators.map(c => c.ug))], [collaborators]);

    const filteredRecords = useMemo(() => {
        const start = startDate.getTime();
        const end = endDate.getTime();

        return records.filter(r => {
            const recordDate = new Date(r.date).getTime();
            const collaborator = collaborators.find(c => c.id === r.collaboratorId);
            if (!collaborator) return false;

            const matchesUG = filters.ug === 'all' || r.ug === filters.ug;
            const matchesContract = filters.contractType === 'all' || collaborator.contractType === filters.contractType;

            return recordDate >= start && recordDate <= end && matchesUG && matchesContract;
        });

    }, [startDate, endDate, filters.ug, filters.contractType, records, collaborators]);


    const analysisData = useMemo(() => {
        const terminations = filteredRecords.filter(r => r.type === RecordType.EGRESO);
        
        const getEmployeesAtDate = (date: Date) => {
            const dateTs = date.getTime();
            const terminationMap = records
                .filter(r => r.type === RecordType.EGRESO)
                .reduce((map, r) => {
                    map[r.collaboratorId] = new Date(r.date).getTime();
                    return map;
                }, {} as Record<string, number>);

            return collaborators.filter(c => {
                const hiredBefore = new Date(c.hireDate).getTime() <= dateTs;
                const termDate = terminationMap[c.id];
                const notTerminated = !termDate || termDate > dateTs;
                return hiredBefore && notTerminated;
            }).length;
        };

        const employeesAtStart = getEmployeesAtDate(startDate);
        const employeesAtEnd = getEmployeesAtDate(endDate);
        const avgEmployees = (employeesAtStart + employeesAtEnd) / 2;

        const turnoverRate = avgEmployees > 0 ? (terminations.length / avgEmployees) * 100 : 0;
        const turnoverCost = terminations.reduce((sum, r) => sum + r.cost, 0);

        const absences = filteredRecords.filter(r => r.type === RecordType.AUSENCIA);
        const totalAbsenceDays = absences.reduce((sum, r) => sum + (r.details as AusenciaDetails).days, 0);

        const salaryMap = records
            .filter(r => r.type === RecordType.INGRESO)
            .reduce((map, r) => {
                map[r.collaboratorId] = (r.details as IngresoDetails).salary;
                return map;
            }, {} as Record<string, number>);

        const avgMonthlySalary = Object.values(salaryMap).reduce((sum, s) => sum + s, 0) / (Object.keys(salaryMap).length || 1);
        
        const dailySalary = Number(manualDailySalary);
        const effectiveDailySalary = dailySalary > 0 ? dailySalary : (avgMonthlySalary / 22); // Assuming 22 work days/month
        const costOfAbsenteeism = totalAbsenceDays * effectiveDailySalary;

        return {
            turnoverRate: `${turnoverRate.toFixed(1)}%`,
            turnoverCost: turnoverCost,
            costOfAbsenteeism: `$${costOfAbsenteeism.toLocaleString(undefined, {maximumFractionDigits: 0})}`,
        };
    }, [filteredRecords, collaborators, records, startDate, endDate, manualDailySalary]);

    const chartData = useMemo(() => {
         const monthlyMap: { [key: string]: { egresos: number, sanciones: number, costoEgresos: number } } = {};
        
        filteredRecords.forEach(record => {
            const month = new Date(record.date).toLocaleString('es-ES', { month: 'short', year: '2-digit' });
            if (!monthlyMap[month]) {
                monthlyMap[month] = { egresos: 0, sanciones: 0, costoEgresos: 0 };
            }
            if (record.type === RecordType.EGRESO) {
                monthlyMap[month].egresos++;
                monthlyMap[month].costoEgresos += record.cost;
            } else if (record.type === RecordType.SANCION) {
                monthlyMap[month].sanciones++;
            }
        });
        
        const sortedEntries = Object.entries(monthlyMap)
          .map(([name, values]) => ({ name, ...values }));
          // Ensure chronological order
          sortedEntries.sort((a,b) => {
              const [aMonth, aYear] = a.name.split(' ');
              const [bMonth, bYear] = b.name.split(' ');
              const monthMap: Record<string, number> = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
              const dateA = new Date(parseInt(aYear, 10) + 2000, monthMap[aMonth.replace('.','').toLowerCase()]);
              const dateB = new Date(parseInt(bYear, 10) + 2000, monthMap[bMonth.replace('.','').toLowerCase()]);
              return dateA.getTime() - dateB.getTime();
          });
        return sortedEntries;

    }, [filteredRecords]);

    const terminationReasonData: TerminationReasonData[] = useMemo(() => {
        const reasonMap: { [key: string]: { count: number, cost: number } } = {};
        filteredRecords
            .filter(r => r.type === RecordType.EGRESO)
            .forEach(r => {
                const reason = (r.details as EgresoDetails).reason;
                if (!reasonMap[reason]) {
                    reasonMap[reason] = { count: 0, cost: 0 };
                }
                reasonMap[reason].count++;
                reasonMap[reason].cost += r.cost;
            });
        return Object.entries(reasonMap).map(([name, value]) => ({ name, ...value }));
    }, [filteredRecords]);

    const sortedTerminationReasonData = useMemo(() => {
        let sortableItems = [...terminationReasonData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [terminationReasonData, sortConfig]);

     const sanctionCostData = useMemo(() => {
        const monthlyMap: { [month: string]: { [sanctionType: string]: number } } = {};
        
        filteredRecords
            .filter(r => r.type === RecordType.SANCION)
            .forEach(record => {
                const month = new Date(record.date).toLocaleString('es-ES', { month: 'short', year: '2-digit' });
                if (!monthlyMap[month]) {
                    monthlyMap[month] = {};
                }
                const sanctionType = (record.details as SancionDetails).type;
                const currentCost = monthlyMap[month][sanctionType] || 0;
                monthlyMap[month][sanctionType] = currentCost + record.cost;
            });

        const sortedEntries = Object.entries(monthlyMap)
            .map(([name, values]) => ({ name, ...values }));
            
        sortedEntries.sort((a,b) => {
            const [aMonthStr, aYear] = a.name.split(' ');
            const [bMonthStr, bYear] = b.name.split(' ');
            const monthMap: Record<string, number> = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
            const aMonth = monthMap[aMonthStr.replace('.','').toLowerCase()];
            const bMonth = monthMap[bMonthStr.replace('.','').toLowerCase()];
            const dateA = new Date(parseInt(aYear, 10) + 2000, aMonth);
            const dateB = new Date(parseInt(bYear, 10) + 2000, bMonth);
            return dateA.getTime() - dateB.getTime();
        });
        return sortedEntries;

    }, [filteredRecords]);

    const requestSort = (key: keyof TerminationReasonData) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof TerminationReasonData) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    };

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

    return (
        <div className="space-y-6">
             <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="text-sm font-medium text-slate-600">Rango de Fechas</label>
                        <select 
                            name="dateRange" 
                            value={dateRange} 
                            onChange={(e) => setDateRange(e.target.value as DateRangeKey)} 
                            className="mt-1 w-full p-2 border border-slate-300 rounded-md"
                        >
                            {Object.entries(dateRangeOptions).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600">Unidad de Gestión</label>
                        <select name="ug" value={filters.ug} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md">
                            <option value="all">Todas</option>
                            {uniqueUGs.map(ug => <option key={ug} value={ug}>{ug}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600">Tipo de Contrato</label>
                        <select name="contractType" value={filters.contractType} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md">
                            <option value="all">Todos</option>
                            {Object.values(ContractType).map(ct => <option key={ct} value={ct}>{ct}</option>)}
                        </select>
                    </div>
                </div>
                 {dateRange === 'custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 lg:w-1/2">
                         <div>
                            <label className="text-sm font-medium text-slate-600">Fecha Inicio</label>
                            <input type="date" name="startDate" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md" />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-600">Fecha Fin</label>
                            <input type="date" name="endDate" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md" />
                        </div>
                    </div>
                 )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Tasa de Rotación" value={analysisData.turnoverRate} description="En el período seleccionado" />
                
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Costo Directo de Rotación</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-2">${analysisData.turnoverCost.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs mt-1">Desglose por motivo principal:</p>
                    <ul className="text-xs text-slate-600 mt-2 space-y-1">
                        {sortedTerminationReasonData.slice(0, 3).map(reason => (
                            <li key={reason.name} className="flex justify-between">
                                <span>{reason.name}</span>
                                <span className="font-semibold">${reason.cost.toLocaleString()}</span>
                            </li>
                        ))}
                         {sortedTerminationReasonData.length === 0 && <li className="text-slate-400">Sin egresos en el período.</li>}
                    </ul>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Costo Estimado de Ausentismo</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{analysisData.costOfAbsenteeism}</p>
                    <p className="text-slate-400 text-xs mt-1">Basado en salario promedio diario.</p>
                     <div className="mt-2">
                        <label htmlFor="daily-salary" className="text-xs font-medium text-slate-500">Ajustar Salario Diario ($):</label>
                        <input
                            id="daily-salary"
                            type="number"
                            value={manualDailySalary}
                            onChange={(e) => setManualDailySalary(e.target.value)}
                            placeholder="Ej: 15000"
                            className="mt-1 w-full p-1.5 text-sm border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="font-bold text-lg text-slate-700 mb-4">Correlación: Egresos vs. Sanciones</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                                <YAxis yAxisId="left" orientation="left" stroke="#ef4444" tick={{ fill: '#ef4444' }} label={{ value: 'N° de Egresos', angle: -90, position: 'insideLeft', fill: '#ef4444' }}/>
                                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fill: '#f59e0b' }} label={{ value: 'N° de Sanciones', angle: 90, position: 'insideRight', fill: '#f59e0b' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="egresos" fill="#ef4444" name="Egresos" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="sanciones" stroke="#f59e0b" name="Sanciones" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState />
                    )}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
                    <h3 className="font-bold text-lg text-slate-700 mb-4">Costo por Motivo de Egreso</h3>
                    {terminationReasonData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={terminationReasonData} dataKey="cost" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                                        {terminationReasonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number, name: string, props) => {
                                        const { count } = props.payload;
                                        const formattedCost = `$${value.toLocaleString()}`;
                                        return [`${formattedCost} (${count} ${count === 1 ? 'caso' : 'casos'})`, name];
                                    }} />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '10px' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 border-t pt-4 overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-2">Motivo</th>
                                            <th scope="col" className="px-4 py-2 cursor-pointer" onClick={() => requestSort('count')}>
                                                Cantidad {getSortIndicator('count')}
                                            </th>
                                            <th scope="col" className="px-4 py-2 cursor-pointer text-right" onClick={() => requestSort('cost')}>
                                                Costo Total {getSortIndicator('cost')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedTerminationReasonData.map((item) => (
                                        <tr key={item.name} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-4 py-2 font-medium text-slate-900">{item.name}</td>
                                            <td className="px-4 py-2">{item.count}</td>
                                            <td className="px-4 py-2 text-right">${item.cost.toLocaleString()}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <EmptyState message="No hay egresos en el período seleccionado." />
                    )}
                </div>
            </div>

             <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-lg text-slate-700 mb-4">Costo por Sanción</h3>
                {sanctionCostData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sanctionCostData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                            <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} tick={{ fill: '#64748b' }} />
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                            <Legend />
                            {Object.values(SanctionType).map((type, index) => (
                                <Bar 
                                    key={type} 
                                    dataKey={type} 
                                    stackId="costs" 
                                    fill={COLORS[(index + 2) % COLORS.length]} 
                                    name={type} 
                                    radius={[4, 4, 0, 0]} 
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyState message="No hay sanciones con costo en el período seleccionado." />
                )}
            </div>

        </div>
    );
};

export default ImpactAnalysis;