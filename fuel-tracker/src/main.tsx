import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { CarProvider } from './context/CarContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CarProvider>
      <App />
    </CarProvider>
  </StrictMode>,
)