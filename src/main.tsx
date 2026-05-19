import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Verse from './routes/Verse.tsx'
import { verseLoader } from './routes/verseLoader.ts'
import ErrorPage from './routes/ErrorPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Verse />,
    loader: verseLoader,
    errorElement: <ErrorPage />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
