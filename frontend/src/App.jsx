import { useAuthStore } from './store'
import Login from './components/Login'
import Layout from './components/Layout'

export default function App() {
  const token = useAuthStore((s) => s.token)
  return token ? <Layout /> : <Login />
}
