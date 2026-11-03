import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './app'
import { NoticeProvider } from './lib/notice'
import { SessionProvider } from './lib/session'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <NoticeProvider>
          <App />
        </NoticeProvider>
      </SessionProvider>
    </BrowserRouter>
  </StrictMode>,
)
