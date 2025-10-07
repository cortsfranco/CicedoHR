import React, { useMemo } from 'react';
import { HRRecord, RecordType, Collaborator, CollaboratorStatus, SanctionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  records: HRRecord[];
  collaborators: Collaborator[];
}

const KPICard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-transform hover:scale-105">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
        <p className="text-slate-400 text-xs mt-1">{description}</p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ records, collaborators }) => {
    
    const kpiData = useMemo(() => {
        const hires = records.filter(r => r.type === RecordType.INGRESO);
        const terminations = records.filter(r => r.type === RecordType.EGRESO);
        const absences = records.filter(r => r.type === RecordType.AUSENCIA);
        const totalEmployees = collaborators.filter(c => c.status === CollaboratorStatus.ACTIVO).length;
        const totalCosts = records.reduce((sum, r) => sum + r.cost, 0);

        return {
            totalEmployees,
            hires: hires.length,
            terminations: terminations.length,
            absences: absences.length,
            totalCosts: `$${totalCosts.toLocaleString()}`,
        };
    }, [records, collaborators]);

    const monthlyActivityData = useMemo(() => {
        const monthlyMap: { [key: string]: { ingresos: number, egresos: number } } = {};
        records.forEach(record => {
            const month = new Date(record.date).toLocaleString('es-ES', { month: 'short', year: '2-digit' });
            if (!monthlyMap[month]) {
                monthlyMap[month] = { ingresos: 0, egresos: 0 };
            }
            if (record.type === RecordType.INGRESO) {
                monthlyMap[month].ingresos++;
            } else if (record.type === RecordType.EGRESO) {
                monthlyMap[month].egresos++;
            }
        });

        const sortedEntries = Object.entries(monthlyMap)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
        
        return sortedEntries.map(([name, values]) => ({ name, ...values }));

    }, [records]);

    const sanctionsData = useMemo(() => {
        const sanctionsMap: { [key: string]: number } = {};
        records
            .filter(r => r.type === RecordType.SANCION)
            .forEach(record => {
                const sanctionType = (record.details as { type: SanctionType }).type;
                sanctionsMap[sanctionType] = (sanctionsMap[sanctionType] || 0) + 1;
            });

        return Object.entries(sanctionsMap).map(([name, value]) => ({ name, value }));
    }, [records]);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <KPICard title="Total Empleados" value={kpiData.totalEmployees} description="Empleados activos actualmente" />
            <KPICard title="Ingresos" value={kpiData.hires} description="Nuevas contrataciones" />
            <KPICard title="Egresos" value={kpiData.terminations} description="Bajas de empleados" />
            <KPICard title="Ausencias" value={kpiData.absences} description="Total de ausencias registradas" />
            <KPICard title="Costos Totales" value={kpiData.totalCosts} description="Costos de operación de RRHH" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-lg text-slate-700 mb-4">Actividad Mensual</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyActivityData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                        <YAxis tick={{ fill: '#64748b' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                        <Legend />
                        <Bar dataKey="ingresos" fill="#4f46e5" name="Ingresos" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="egresos" fill="#ef4444" name="Egresos" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-lg text-slate-700 mb-4">Sanciones por Tipo</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={sanctionsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                            {sanctionsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                         <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;