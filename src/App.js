import styled from '@emotion/styled';
import './App.css';
import { Liveness } from './components/Liveness';

const Container = styled.div`
  background-color: #101010;
  color: white;
`

function App() {
  return (
    <Container >
      <Liveness />
    </Container>
  );
}

export default App;
