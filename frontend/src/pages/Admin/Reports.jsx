import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, XCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import './Reports.scss';

// Cores originais (vibrantes e sem parecer transparentes)
const PIE_COLORS = ['#30e3a7', '#3b82f6', '#ef4444']; // Verde(Concluida), Azul(Agendada), Vermelho(Cancelada)

const Reports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/consultas');
        setData(response.data);
      } catch (error) {
        console.error("Erro na API. Usando mock data.", error);
        // Fallback visual para caso o Java esteja desligado
        setData([
          { id: 1, medicoNome: 'dr_roberto', status: 'CONCLUIDA' },
          { id: 2, medicoNome: 'dr_roberto', status: 'AGENDADA' },
          { id: 3, medicoNome: 'dr_roberto', status: 'AGENDADA' },
          { id: 4, medicoNome: 'dr_roberto', status: 'CANCELADA' },
          { id: 5, medicoNome: 'dra_ana', status: 'CONCLUIDA' },
          { id: 6, medicoNome: 'dra_ana', status: 'CONCLUIDA' },
          { id: 7, medicoNome: 'dra_ana', status: 'AGENDADA' },
          { id: 8, medicoNome: 'dr_lucas', status: 'CANCELADA' },
          { id: 9, medicoNome: 'dr_lucas', status: 'CANCELADA' },
          { id: 10, medicoNome: 'dr_lucas', status: 'AGENDADA' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- MATEMÁTICA / CÁLCULOS FEITOS PELO REACT ---
  const total = data.length;
  const concluidas = data.filter(c => c.status === 'CONCLUIDA').length;
  const canceladas = data.filter(c => c.status === 'CANCELADA').length;
  const agendadas = data.filter(c => c.status === 'AGENDADA').length;

  const taxaCancelamento = total > 0 ? Math.round((canceladas / total) * 100) : 0;

  // Dados formatados para o Gráfico de Pizza (Status)
  const pieData = [
    { name: 'Concluídas', value: concluidas },
    { name: 'Agendadas', value: agendadas },
    { name: 'Canceladas', value: canceladas },
  ];

  // Dados formatados para o Gráfico de Barras (Volume por Médico)
  const medicosMap = {};
  data.forEach(c => {
    const nome = c.medicoNome || 'Desconhecido';
    if (!medicosMap[nome]) {
      medicosMap[nome] = { nome, Concluídas: 0, Agendadas: 0, Canceladas: 0 };
    }
    
    if (c.status === 'CONCLUIDA') medicosMap[nome].Concluídas++;
    else if (c.status === 'AGENDADA') medicosMap[nome].Agendadas++;
    else if (c.status === 'CANCELADA') medicosMap[nome].Canceladas++;
  });
  const barData = Object.values(medicosMap);

  return (
    <div className="reports-container">
      <h1 className="reports-title">Dashboard Analítico</h1>
      <p className="reports-desc">Visão geral do desempenho e métricas da clínica.</p>

      {/* Cards Superiores (KPIs) */}
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
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Consultas`, 'Quantidade']} />
                <Legend />
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="nome" tick={{ fill: '#666' }} axisLine={false} />
                <YAxis tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="Concluídas" stackId="a" fill="#30e3a7" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Agendadas" stackId="a" fill="#3b82f6" />
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
