import type { AppProps } from 'next/app'
import { DashboardContent } from '../components/dashboard';

//import '../style/App.css';

function App({ Component, pageProps }: AppProps) {
  return (
    <DashboardContent>
      <Component {...pageProps} />
    </DashboardContent>
  )
}

export default App
