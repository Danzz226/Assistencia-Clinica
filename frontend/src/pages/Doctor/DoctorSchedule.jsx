import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, Moon, Plus, Filter } from 'lucide-react';
import api from '../../services/api';
import './DoctorSchedule.scss';

// O backend retorna status "realizado", mas o CSS usa a classe "finalizado"
const STATUS_MAP = { realizado: 'finalizado' };

const DoctorSchedule = () => {
  const { user } = useContext(AuthContext);

  
  const [currentDate, setCurrentDate] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
 const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  Promise.all([
    api.get('/agendamentos'),
    api.get('/exames'),
    api.get('/medicos/me'),
  ])
    .then(([agendRes, exameRes, medicoRes]) => {
      const medicoId = medicoRes.data.id;

      // --- Consultas ---
      const consultas = (agendRes.data || []).map(a => {
        const dt = new Date(a.data);
        const date = [
          dt.getFullYear(),
          String(dt.getMonth() + 1).padStart(2, '0'),
          String(dt.getDate()).padStart(2, '0'),
        ].join('-');
        const time = [
          String(dt.getHours()).padStart(2, '0'),
          String(dt.getMinutes()).padStart(2, '0'),
        ].join(':');
        return {
          id: `a-${a.id}`,
          date,
          time,
          label: a.pacienteNome || '—',
          status: STATUS_MAP[a.status] ?? a.status,
        };
      });

      // --- Exames ---
      // /exames retorna de todos os médicos, então filtramos pelo nosso id
      const exames = (exameRes.data || [])
        .filter(e => e.medicoId === medicoId)
        .map(e => ({
          id: `e-${e.id}`,
          date: e.dataExame,   // já vem como "2026-05-20" — sem hora
          time: '',
          label: e.tipo || 'Exame',
          status: 'exame',
        }));

      setEventos([...consultas, ...exames]);
    })
    .catch(() => setEventos([]))
    .finally(() => setLoading(false));
}, []);

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    // Dia da semana do primeiro dia do mês (0 = Domingo)
    const firstDay = date.getDay();
    
    // Dias do mês anterior para completar a primeira linha
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Dias do mês atual
    while (date.getMonth() === month) {
      days.push({
        date: new Date(date),
        isCurrentMonth: true,
      });
      date.setDate(date.getDate() + 1);
    }

    // Dias do próximo mês para completar a grade (sempre 35 ou 42 células)
    const remainingDays = days.length % 7;
    if (remainingDays !== 0) {
      const daysToAdd = 7 - remainingDays;
      for (let i = 1; i <= daysToAdd; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
        });
      }
    }

    return days;
  };

  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  // Função auxiliar para pegar as consultas de um dia específico
  const getAppointmentsForDate = (date) => {
    // Ajustar fuso horário local para bater exatamente a string
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return eventos.filter(a => a.date === dateString).sort((a, b) => a.time.localeCompare(b.time));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const hoje = new Date();
    setCurrentDate(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  };

  return (
      <>
    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
      Agenda do Médico
    </h1>
    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
      Gerencie seus horários, visualize consultas e acesse detalhes dos pacientes.
    </p>
    <div className="doctor-schedule">
     
      <div className="doctor-schedule__header">
       
        <div className="month-nav">
          <div className="arrows">
            <button onClick={prevMonth}><ChevronLeft size={16} /></button>
            <button onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>
          <button className="btn-today" onClick={goToToday}>Hoje</button>
          <h3>{monthNames[currentDate.getMonth()]} De {currentDate.getFullYear()}</h3>
        </div>

        <div className="controls">
          <div className="view-toggles">
            <button className="active">Mês</button>
            <button>Semana</button>
            <button>Dia</button>
          </div>
          <button className="theme-toggle" title="Alternar tema">
            <Moon size={16} />
          </button>
          <button className="btn-new">
            <Plus size={16} /> Nova consulta
          </button>
        </div>
      </div>


      <div className="doctor-schedule__subheader">
      

        <div className="legends">
          <Filter size={16} className="filter-icon" />
          <div className="legend-item agendado">
            <div className="dot"></div> Agendado
          </div>
          <div className="legend-item atendimento">
            <div className="dot"></div> Atendimento
          </div>
          <div className="legend-item finalizado">
            <div className="dot"></div> Finalizado
          </div>
          <div className="legend-item cancelado">
            <div className="dot"></div> Cancelado
          </div>
          <div className="legend-item disponivel">
            <div className="dot"></div> Disponível
          </div>
        </div>
      </div>

      {/* GRID DO CALENDÁRIO */}
      <div className="doctor-schedule__grid-wrapper">
        <div className="doctor-schedule__grid-header">
          {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day, idx) => (
            <div key={idx} className="day-name">{day}</div>
          ))}
        </div>

        <div className="doctor-schedule__grid-body">
          {days.map((dayObj, index) => {
            const appointments = getAppointmentsForDate(dayObj.date);
            const visibleAppointments = appointments.slice(0, 3);
            const remaining = appointments.length - 3;
            const hoje = new Date();
            const isToday =
              dayObj.date.getDate() === hoje.getDate() &&
              dayObj.date.getMonth() === hoje.getMonth() &&
              dayObj.date.getFullYear() === hoje.getFullYear();

            return (
              <div key={index} className={`cell ${!dayObj.isCurrentMonth ? 'outside-month' : ''}`}>
                <div className={`date-number ${isToday ? 'today' : ''}`}>
                  {dayObj.date.getDate()}
                </div>
                
                <div className="appointments">
                  {visibleAppointments.map(app => (
                    <div key={app.id} className={`badge ${app.status}`} title={`${app.time} - ${app.label}`}>
                     {app.time && <span className="time">{app.time}</span>}
  {app.time && <div className="dot-separator"></div>}
                      <span className="name">{app.label}</span>
                    </div>
                  ))}
                </div>

                {remaining > 0 && (
                  <div className="more-indicator">
                    + {remaining} {remaining === 1 ? 'consulta' : 'consultas'}
                  </div>
                )}
                {remaining < 0 && appointments.length > 0 && appointments.length < 3 && (
                  <div className="more-indicator">
                    <span style={{opacity:0}}>placeholder</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
};

export default DoctorSchedule;
