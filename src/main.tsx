import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ShareCard from './components/ShareCard.tsx'
import './index.css'

// /?share-card shows only the picture used when the site is shared (see ShareCard).
const shareCard = new URLSearchParams(window.location.search).has('share-card')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {shareCard ? <ShareCard /> : <App />}
  </React.StrictMode>,
)
