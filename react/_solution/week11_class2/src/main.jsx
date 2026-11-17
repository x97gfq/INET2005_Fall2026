import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Class 2: the template's index.css is gone. Bootstrap (index.html) styles the page now.
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
