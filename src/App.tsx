import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Portfolio from './pages/Portfolio'
import Exhibitions from './pages/Exhibitions'
import Prints from './pages/Prints'
import Press from './pages/Press'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename='/'>
        <Routes>
          <Route path='/' element={<Index />} />
          <Route path='/portfolio' element={<Portfolio />} />
          <Route path='/exhibitions' element={<Exhibitions />} />
          <Route path='/prints' element={<Prints />} />
          <Route path='/press' element={<Press />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/admin' element={<Admin />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
