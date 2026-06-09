import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar } from 'lucide-react';
import api from '../../services/api';
import DoctorCreateAppointmentModal from '../../components/Modal/DoctorCreateAppointmentModal';
import ConsultaDetailModal from '../../components/Modal/ConsultaDetailModal';
import './DoctorSchedule.scss';

const STATUS_MAP = { realizado: 'finalizado' };

const STATUS_LABEL = {
  agendado:    'Agendado',
  atendimento: 'Em atendimento',
  finalizado:  'Finalizado',
  cancelado:   'Cancelado',
  exame:       'Exame',
  disponivel:  'Disponível',
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DAY_SHORT = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate();

const getWeekDays = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (d.getDay() + 6) % 7); // recua até segunda-feira
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    return day;
  });
};

const DoctorSchedule = () => {
  const { user } = useContext(AuthContext);

  const [view, setView]                   = useState('mes');
  const [currentDate, setCurrentDate]     = useState(() => new Date());
  const [eventos, setEventos]             = useState([]);
  const [agendamentosRaw, setAgendamentosRaw] = useState([]);
  const [medicoIdState, setMedicoIdState] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [modalOpen, setModalOpen]         = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState(null);

  const loadEventos = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/agendamentos'),
      api.get('/exames'),
      api.get('/medicos/me'),
    ])
      .then(([agendRes, exameRes, medicoRes]) => {
        const medicoId = medicoRes.data.id;
        setMedicoIdState(medicoId);

        const agendamentos = agendRes.data || [];
        setAgendamentosRaw(agendamentos);

        const consultas = agendamentos.map(a => {
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
            rawId: a.id,
            date,
            time,
            label: a.pacienteNome || '—',
            status: STATUS_MAP[a.status] ?? a.status,
          };
        });

        const exames = (exameRes.data || [])
          .filter(e => e.medicoId === medicoId)
          .map(e => ({
            id:    `e-${e.id}`,
            rawId: null,
            date:  e.dataExame,
            time:  '',
            label: e.tipo || 'Exame',
            status: 'exame',
          }));

        setEventos([...consultas, ...exames]);
      })
      .catch(() => setEventos([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadEventos(); }, [loadEventos]);

  // ── helpers ──────────────────────────────────────────────────────────────────

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDay = (date.getDay() + 6) % 7;
    const prevMonthDays = new Date(year, month, 0).getDate();

    for (let i = firstDay - 1; i >= 0; i--)
      days.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });

    while (date.getMonth() === month) {
      days.push({ date: new Date(date), isCurrentMonth: true });
      date.setDate(date.getDate() + 1);
    }

    const rem = days.length % 7;
    if (rem !== 0)
      for (let i = 1; i <= 7 - rem; i++)
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });

    return days;
  };

  const getAppointmentsForDate = (date) => {
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    return eventos.filter(a => a.date === key).sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleBadgeClick = (app, e) => {
    e.stopPropagation();
    if (!app.rawId) return;
    const raw = agendamentosRaw.find(a => a.id === app.rawId);
    if (raw) setSelectedConsulta(raw);
  };

  // ── navegação ─────────────────────────────────────────────────────────────────

  const prev = () => setCurrentDate(d => {
    if (view === 'mes')    return new Date(d.getFullYear(), d.getMonth() - 1, 1);
    if (view === 'semana') return new Date(d.getTime() - 7 * 86400000);
    return new Date(d.getTime() - 86400000);
  });

  const next = () => setCurrentDate(d => {
    if (view === 'mes')    return new Date(d.getFullYear(), d.getMonth() + 1, 1);
    if (view === 'semana') return new Date(d.getTime() + 7 * 86400000);
    return new Date(d.getTime() + 86400000);
  });

  const goToToday = () => setCurrentDate(new Date());

  const headerTitle = () => {
    if (view === 'mes')
      return `${MONTH_NAMES[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;

    if (view === 'semana') {
      const days  = getWeekDays(currentDate);
      const start = days[0];
      const end   = days[6];
      if (start.getMonth() === end.getMonth())
        return `${start.getDate()}–${end.getDate()} de ${MONTH_NAMES[start.getMonth()]} de ${start.getFullYear()}`;
      return `${start.getDate()} ${MONTH_NAMES[start.getMonth()]} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
    }

    return currentDate.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  // ── render ────────────────────────────────────────────────────────────────────

  if (loading)
    return <div className="schedule-loading"><p>Carregando agenda...</p></div>;

  const hoje     = new Date();
  const weekDays = getWeekDays(currentDate);
  const dayApps  = getAppointmentsForDate(currentDate);

  const BadgeItem = ({ app }) => (
    <div
      className={`badge ${app.status}${app.rawId ? ' badge--clickable' : ''}`}
      title={`${app.time ? app.time + ' — ' : ''}${app.label}${app.rawId ? ' · clique para gerenciar' : ''}`}
      onClick={app.rawId ? e => handleBadgeClick(app, e) : undefined}
    >
      {app.time && <span className="time">{app.time}</span>}
      {app.time && <div className="dot-separator" />}
      <span className="name">{app.label}</span>
    </div>
  );

  return (
    <>
      <div className="doctor-schedule-page">
        <div className="doctor-schedule-page__heading">
          <h1>Agenda do Médico</h1>
          <p>Gerencie seus horários, visualize consultas e acesse detalhes dos pacientes.</p>
        </div>

        <div className="doctor-schedule">

          {/* ── HEADER ── */}
          <div className="doctor-schedule__header">
            <div className="month-nav">
              <div className="arrows">
                <button onClick={prev}><ChevronLeft size={16} /></button>
                <button onClick={next}><ChevronRight size={16} /></button>
              </div>
              <button className="btn-today" onClick={goToToday}>Hoje</button>
              <h3>{headerTitle()}</h3>
            </div>

            <div className="controls">
              <div className="view-toggles">
                <button className={view === 'mes'    ? 'active' : ''} onClick={() => setView('mes')}>Mês</button>
                <button className={view === 'semana' ? 'active' : ''} onClick={() => setView('semana')}>Semana</button>
                <button className={view === 'dia'    ? 'active' : ''} onClick={() => setView('dia')}>Dia</button>
              </div>
              <button className="btn-new" onClick={() => setModalOpen(true)}>
                <Plus size={16} /> Nova consulta
              </button>
            </div>
          </div>

          {/* ── SUBHEADER (legenda) ── */}
          <div className="doctor-schedule__subheader">
            <div className="legends">
              <Filter size={14} className="filter-icon" />
              <span className="legends-label">Legenda:</span>
              <div className="legend-item agendado">   <div className="dot" /> Agendado</div>
              <div className="legend-item atendimento"><div className="dot" /> Atendimento</div>
              <div className="legend-item finalizado"> <div className="dot" /> Finalizado</div>
              <div className="legend-item cancelado">  <div className="dot" /> Cancelado</div>
              <div className="legend-item exame">      <div className="dot" /> Exame</div>
              <div className="legend-item disponivel"> <div className="dot" /> Disponível</div>
            </div>
          </div>

          {/* ── VIEW: MÊS ── */}
          {view === 'mes' && (
            <div className="doctor-schedule__grid-wrapper">
              <div className="doctor-schedule__grid-header">
                {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((d, i) => (
                  <div key={i} className="day-name">{d}</div>
                ))}
              </div>
              <div className="doctor-schedule__grid-body">
                {getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()).map((dayObj, idx) => {
                  const apps    = getAppointmentsForDate(dayObj.date);
                  const visible = apps.slice(0, 3);
                  const rest    = apps.length - 3;
                  const isToday = isSameDay(dayObj.date, hoje);
                  return (
                    <div key={idx} className={`cell${!dayObj.isCurrentMonth ? ' outside-month' : ''}`}>
                      <div className={`date-number${isToday ? ' today' : ''}`}>
                        {dayObj.date.getDate()}
                      </div>
                      <div className="appointments">
                        {visible.map(app => <BadgeItem key={app.id} app={app} />)}
                      </div>
                      {rest > 0 && (
                        <div className="more-indicator">
                          +{rest} {rest === 1 ? 'consulta' : 'consultas'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── VIEW: SEMANA ── */}
          {view === 'semana' && (
            <div className="week-view">
              <div className="week-view__header">
                {weekDays.map((day, i) => {
                  const isToday = isSameDay(day, hoje);
                  return (
                    <div key={i} className={`week-view__col-header${isToday ? ' week-view__col-header--today' : ''}`}>
                      <span className="week-view__day-name">{DAY_SHORT[i]}</span>
                      <span className={`week-view__day-number${isToday ? ' week-view__day-number--today' : ''}`}>
                        {day.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="week-view__body">
                {weekDays.map((day, i) => {
                  const apps    = getAppointmentsForDate(day);
                  const isToday = isSameDay(day, hoje);
                  return (
                    <div key={i} className={`week-view__col${isToday ? ' week-view__col--today' : ''}`}>
                      {apps.length === 0
                        ? <span className="week-view__empty">—</span>
                        : apps.map(app => <BadgeItem key={app.id} app={app} />)
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── VIEW: DIA ── */}
          {view === 'dia' && (
            <div className="day-view">
              {dayApps.length === 0 ? (
                <div className="day-view__empty">
                  <Calendar size={36} />
                  <p>Nenhum evento para este dia.</p>
                </div>
              ) : (
                <div className="day-view__list">
                  {dayApps.map(app => (
                    <div
                      key={app.id}
                      className={`day-view__item${app.rawId ? ' day-view__item--clickable' : ''}`}
                      onClick={app.rawId ? e => handleBadgeClick(app, e) : undefined}
                    >
                      <span className="day-view__time">{app.time || '—'}</span>
                      <div className={`day-view__indicator ${app.status}`} />
                      <div className="day-view__info">
                        <span className="day-view__label">{app.label}</span>
                        <span className={`day-view__status-badge ${app.status}`}>
                          {STATUS_LABEL[app.status] || app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <DoctorCreateAppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => { setModalOpen(false); loadEventos(); }}
      />

      {selectedConsulta && medicoIdState && (
        <ConsultaDetailModal
          consulta={selectedConsulta}
          medicoId={medicoIdState}
          onClose={() => setSelectedConsulta(null)}
          onUpdated={() => { setSelectedConsulta(null); loadEventos(); }}
        />
      )}
    </>
  );
};

export default DoctorSchedule;
