import { useState } from 'react';
import client from './api/client';

function App() {
  const [result, setResult] = useState('');

  const checkConnection = async () => {
    try {
      const response = await client.get('/customers');
      setResult(`Статус: ${response.status}`);
    } catch (error) {
      if (error.response) {
        setResult(`Сервер ответил: ${error.response.status} ${error.response.data.code}`);
      } else {
        setResult('No connection to the server (check the address and CORS)');
      }
    }
  };

  return (
      <div>
        <h1>Cargo CRM</h1>
        <button onClick={checkConnection}>Check connection to the server</button>
        <p>{result}</p>
      </div>
  );
}

export default App;