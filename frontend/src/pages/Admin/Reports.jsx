import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, XCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import './Reports.scss';

// Cores dos dados do gráfico — vibrantes para ficarem visíveis em light e dark
const PIE_COLORS = ['#30e3a7', '#3b82f6', '#ef4444']; // Verde(Concluída), Azul(Agendada), Vermelho(Cancelada)

// Lê CSS variables do tema atual para usar nos elementos SVG do Recharts
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const Reports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/agendamentos');
        setData(response.data);
      } catch (error) {
        console.error("Erro na API. Usando mock data.", error);
        setData([
          { id: 1, medicoNome: 'Dr. Roberto', status: 'realizado' },
          { id: 2, medicoNome: 'Dr. Roberto', status: 'agendado' },
          { id: 3, medicoNome: 'Dr. Roberto', status: 'agendado' },
          { id: 4, medicoNome: 'Dr. Roberto', status: 'cancelado' },
          { id: 5, medicoNome: 'Dra. Ana', status: 'realizado' },
          { id: 6, medicoNome: 'Dra. Ana', status: 'realizado' },
          { id: 7, medicoNome: 'Dra. Ana', status: 'agendado' },
          { id: 8, medicoNome: 'Dr. Lucas', status: 'cancelado' },
          { id: 9, medicoNome: 'Dr. Lucas', status: 'cancelado' },
          { id: 10, medicoNome: 'Dr. Lucas', status: 'agendado' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const total      = data.length;
  const concluidas = data.filter(c => c.status === 'realizado').length;
  const canceladas = data.filter(c => c.status === 'cancelado').length;
  const agendadas  = data.filter(c => c.status === 'agendado').length;

  const taxaCancelamento = total > 0 ? Math.round((canceladas / total) * 100) : 0;

  const pieData = [
    { name: 'Concluídas', value: concluidas },
    { name: 'Agendadas',  value: agendadas  },
    { name: 'Canceladas', value: canceladas },
  ];

  const medicosMap = {};
  data.forEach(c => {
    const nome = c.medicoNome || 'Desconhecido';
    if (!medicosMap[nome]) {
      medicosMap[nome] = { nome, Concluídas: 0, Agendadas: 0, Canceladas: 0 };
    }
    if (c.status === 'realizado') medicosMap[nome].Concluídas++;
    else if (c.status === 'agendado') medicosMap[nome].Agendadas++;
    else if (c.status === 'cancelado') medicosMap[nome].Canceladas++;
  });
  const barData = Object.values(medicosMap);

  // Cores do tema lidas em tempo de render para os elementos SVG do Recharts
  const tickColor    = getCSSVar('--text-neutral')  || '#888';
  const gridColor    = getCSSVar('--border-color')  || '#eee';
  const tooltipBg    = getCSSVar('--surface-card')  || '#fff';
  const tooltipBorder = getCSSVar('--border-color') || '#eee';
  const tooltipText  = getCSSVar('--text-main')     || '#333';

  return (
    <div className="reports-container">
      <h1 className="reports-title">Relatório de Desempenho</h1>
      <p className="reports-desc">Visão geral do desempenho e métricas da clínica.</p>

      {/* Cards KPIs */}
      <div className="reports-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue"><Activity size={24}/></div>
          <div className="kpi-info">
            <h3>Total de Consultas</h3>
            <p>{total}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><CheckCircle size={24}/></div>
          <div className="kpi-info">
            <h3>Consultas Concluídas</h3>
            <p>{concluidas}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><XCircle size={24}/></div>
          <div className="kpi-info">
            <h3>Taxa de Cancelamento</h3>
            <p>{taxaCancelamento}%</p>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="reports-charts-grid">

        {/* Gráfico 1: Pizza */}
        <div className="chart-card">
          <h3>Status Geral das Consultas</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} Consultas`, 'Quantidade']}
                  contentStyle={{
                    background: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: tooltipText,
                  }}
                />
                <Legend wrapperStyle={{ color: tooltipText }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Barras */}
        <div className="chart-card">
          <h3>Demanda por Médico (Volume)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="nome" tick={{ fill: tickColor }} axisLine={false} />
                <YAxis tick={{ fill: tickColor }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    background: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: tooltipText,
                  }}
                />
                <Legend wrapperStyle={{ color: tooltipText }} />
                <Bar dataKey="Concluídas" stackId="a" fill="#30e3a7" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Agendadas"  stackId="a" fill="#3b82f6" />
                <Bar dataKey="Canceladas" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
