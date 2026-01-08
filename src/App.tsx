import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import LendingPage from './Components/LendingPage';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

function App() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');

  const toast = (msg: string, t: ToastType = 'info') => {
    setMessage(msg);
    setType(t);
    setShow(true);
  };

  return (
    <>
      <LendingPage toast={toast} />

      <ToastContainer
        position="top-center"
        className="p-3"
        style={{
          zIndex: 9999,
          position: 'fixed',     
          top: '12px',          
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none' 
        }}
      >
        <Toast
          show={show}
          onClose={() => setShow(false)}
          delay={4000}
          autohide
          className="border-0 rounded-4 shadow-lg"
          style={{
            minWidth: '280px',
            pointerEvents: 'auto', 
            background:
              type === 'success'
                ? 'linear-gradient(135deg, #00c851, #007e33)'
                : type === 'error'
                  ? 'linear-gradient(135deg, #ff4444, #cc0000)'
                  : 'linear-gradient(135deg, #33b5e5, #0099cc)',
          }}
        >
          <Toast.Body className="fw-semibold text-white text-center">
            {message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default App;
