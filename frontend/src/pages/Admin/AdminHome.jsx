import React, { useState, useEffect } from 'react';
import { Users, FileText, TrendingUp, ClipboardPlus } from 'lucide-react';
import api from '../../services/api';
import './AdminHome.scss';

const AdminHome = () => {
  const [stats, setStats] = useState({
    pacientes: { count: 0, percentage: 0, label: 'ativos' },
    doutores: { count: 0, percentage: 0, label: 'ocupados' },
    prontuarios: { count: 0, percentage: 0, label: 'concluídos' }
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usuariosRes, consultasRes] = await Promise.all([
          api.get('/usuarios'),
          api.get('/consultas')
        ]);

        const usuarios = usuariosRes.data || [];
        const consultas = consultasRes.data || [];

        // 1. Contagem de Pacientes
        let pacientesList = usuarios.filter(u => !u.role || u.role.toUpperCase() === 'PACIENTE');
        let totalPacientes = pacientesList.length;

        let doutoresList = usuarios.filter(u => u.role && (u.role.toUpperCase() === 'MEDICO' || u.role.toUpperCase() === 'DOCTOR' || u.role.toUpperCase() === 'DOUTOR'));
        let totalDoutores = doutoresList.length;

        if (totalPacientes === 0 && totalDoutores === 0 && usuarios.length > 0) {
          totalPacientes = usuarios.length;
        }

        // 3. Contagem de Prontuários (Consultas)
        let totalProntuarios = consultas.length;

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
          setErrorMsg(`Erro do servidor (${error.response.status}): Não foi possível obter os dados. Verifique se os endpoints /usuarios e /consultas estão acessíveis.`);
        } else if (error.request) {
          setErrorMsg('Erro de conexão: Não foi possível conectar ao servidor Java. O backend está rodando na porta correta?');
        } else {
          setErrorMsg(`Erro: ${error.message}`);
        }
      }
    };

    fetchStats();
  }, []);


  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

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
      <h1 className="admin-dashboard__title">
        Dashboard Administrativo
      </h1>

      <h2 className="admin-dashboard__subtitle">
        Acompanhe exames e prontuários dos pacientes
      </h2>

      <p className="admin-dashboard__desc">
        Aqui você poderá gerenciar usuários, funcionários, visualizar
        <br />
        todas as consultas marcadas na clínica e acessar relatórios
        <br />
        gerenciais.
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

      {errorMsg && (
        <div className="admin-dashboard__error">
          <h4>Aviso de Conexão com o Backend</h4>
          <p>{errorMsg}</p>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
