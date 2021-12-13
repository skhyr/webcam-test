import styled from '@emotion/styled';
import './App.css';
import {Video} from './components/Video'

const Container = styled.div`
  background-color: #101010;
  color: white;
`

function App() {
  return (
    <Container >
      <Video />
    </Container>
  );
}

export default App;
