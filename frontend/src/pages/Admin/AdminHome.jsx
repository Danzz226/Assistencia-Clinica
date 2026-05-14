import React, { useState, useEffect } from 'react';
import { Users, FileText, TrendingUp, ClipboardPlus } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './AdminHome.scss';

const AdminHome = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    pacientes: { count: 0, percentage: 0, label: 'ativos' },
    doutores: { count: 0, percentage: 0, label: 'ocupados' },
    prontuarios: { count: 0, percentage: 0, label: 'concluídos' }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usuariosRes, agendamentosRes] = await Promise.all([
          api.get('/usuarios'),
          api.get('/agendamentos')
        ]);

        const usuarios = usuariosRes.data || [];
        const agendamentos = agendamentosRes.data || [];

        let totalPacientes = usuarios.filter(u => u.tipo === 'paciente').length;
        let totalDoutores = usuarios.filter(u => u.tipo === 'medico').length;

        let totalProntuarios = agendamentos.length;

        // Simulando um crescimento em relação ao mês passado (já que o back ainda não tem histórico)
        setStats({
          pacientes: { count: totalPacientes, percentage: "8,4", label: 'no último mês' },
          doutores: { count: totalDoutores, percentage: "3,0", label: 'no último mês' },
          prontuarios: { count: totalProntuarios, percentage: "12,5", label: 'no último mês' }
        });

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setStats({
          pacientes: { count: 0, percentage: 0, label: '' },
          doutores: { count: 0, percentage: 0, label: '' },
          prontuarios: { count: 0, percentage: 0, label: '' }
        });

        if (error.response) {
          toast.error(`Erro do servidor (${error.response.status}): não foi possível obter os dados.`);
        } else if (error.request) {
          toast.error('Sem conexão com o servidor. O backend está rodando?');
        } else {
          toast.error(`Erro: ${error.message}`);
        }
      }
    };

    fetchStats();
  }, []);


  const renderPill = (statObj) => {
    if (statObj.count > 0) {
      return (
        <div className="admin-dashboard__card-pill admin-dashboard__card-pill--green">
          <TrendingUp size={14} /> +{statObj.percentage}% {statObj.label}
        </div>
      );
    }

    return (
      <div className="admin-dashboard__card-pill admin-dashboard__card-pill--neutral">
        0%
      </div>
    );
  };

  const formatNumber = (num) => {
    return num.toLocaleString('pt-BR');
  };

  return (
    <div className="admin-dashboard">
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
        Dashboard Administrativo
      </h1>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Gerencie usuários, visualize consultas e acesse relatórios gerenciais da clínica.
      </p>

      <div className="admin-dashboard__section-label">LIFIUM · VISÃO GERAL</div>
      <h3 className="admin-dashboard__section-title">Estatísticas</h3>

      <div className="admin-dashboard__cards">
        {/* Card: Total de Pacientes */}
        <div className="admin-dashboard__card">
          <div className="admin-dashboard__card-icon-wrapper">
            <Users size={24} />
          </div>
          <div className="admin-dashboard__card-title">TOTAL DE PACIENTES</div>
          <div className="admin-dashboard__card-subtitle">Total acumulado</div>
          <div className="admin-dashboard__card-number">{formatNumber(stats.pacientes.count)}</div>
          {renderPill(stats.pacientes)}
        </div>

        {/* Card: Total de Doutores */}
        <div className="admin-dashboard__card">
          <div className="admin-dashboard__card-icon-wrapper">
            <ClipboardPlus size={24} />
          </div>
          <div className="admin-dashboard__card-title">TOTAL DE DOUTORES</div>
          <div className="admin-dashboard__card-subtitle">Ativos no sistema</div>
          <div className="admin-dashboard__card-number">{formatNumber(stats.doutores.count)}</div>
          {renderPill(stats.doutores)}
        </div>

        {/* Card: Totais Prontuários */}
        <div className="admin-dashboard__card">
          <div className="admin-dashboard__card-icon-wrapper">
            <FileText size={24} />
          </div>
          <div className="admin-dashboard__card-title">TOTAIS PRONTUÁRIOS</div>
          <div className="admin-dashboard__card-subtitle">Registros médicos</div>
          <div className="admin-dashboard__card-number">{formatNumber(stats.prontuarios.count)}</div>
          {renderPill(stats.prontuarios)}
        </div>
      </div>

    </div>
  );
};

export default AdminHome;
