import React from 'react';
import './LoginPresentation.scss';

const BADGES = ['SAÚDE', 'SEGURANÇA', 'EFICIÊNCIA', 'CUIDADO', 'TECNOLOGIA'];

const ECG_PATH_D = `
M 0 10

L 8 10
L 9 12
L 10 4
L 11 15
L 12 10

L 22 10
L 23 13
L 24 2
L 25 17
L 26 10

L 36 10
L 37 11
L 38 6
L 39 14
L 40 10

L 52 10
L 53 14
L 54 1
L 55 18
L 56 10

L 68 10
L 69 12
L 70 3
L 71 16
L 72 10

L 84 10
L 85 13
L 86 5
L 87 14
L 88 10

L 100 10
`;

const LoginPresentation = () => {
  return (
    <div className="login-presentation">
      {/* Background decoration */}
      <div className="bg-decoration"></div>

      <div className="content-container">
        
        <div className="text-content">
          <span className="small-label">LIFIUM — CLÍNICA INTELIGENTE</span>
          <h1>A plataforma que cuida da sua <span>clínica</span> e dos seus <span>pacientes</span>.</h1>
          <p>
            Prontuários, agendamentos e relatórios reunidos em um sistema seguro,
            eficiente e feito para profissionais de saúde.
          </p>
        </div>

        <div className="ecg-section">
          <div className="ecg-animation-container">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="ecg-svg">
              {/* Linha base transparente */}
              <path className="ecg-base" d={ECG_PATH_D} />
              
              {/* Linha de pulso que se move por cima */}
              <path 
                className="ecg-pulse"
                pathLength="100" 
                d={ECG_PATH_D} 
              />
            </svg>
          </div>
          
          <div className="badges-container">
            {BADGES.map((badge, index) => (
              <div 
                key={badge} 
                className="badge-item"
                
                // Isso faz com que cada badge brilhe exatamente quando o pulso de luz (ECG) passa pelo seu centro.
               style={{ animationDelay: `${index * 1}s`  }} 
              >
                {badge}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPresentation;
