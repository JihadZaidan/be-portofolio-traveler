import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { Router } from './router'
import ScrollToTop from './components/ui/ScrollToTop'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Router />
    </BrowserRouter>
  )
}

export default App