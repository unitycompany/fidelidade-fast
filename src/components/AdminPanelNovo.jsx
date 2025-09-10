import React from 'react';
import styled from 'styled-components';
import { FiSettings, FiGift, FiBarChart2 } from 'react-icons/fi';
import AdminResgates from './AdminResgates';
import AdminPremios from './AdminPremios';
import AdminEstatisticasNovo from './AdminEstatisticasNovo';

const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 1rem;
  
  @media (max-width: 900px) {
    padding: 0.5rem;
    min-height: calc(100vh - 64px);
  }
`;

function AdminPanelNovo({ section = 'resgates', user }) {
  return (
    <Container>
      {section === 'resgates' && <AdminResgates user={user} />}
      {section === 'catalogo' && <AdminPremios />}
      {section === 'estatisticas' && <AdminEstatisticasNovo />}
    </Container>
  );
}

export default AdminPanelNovo;