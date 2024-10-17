import { ThemeProvider } from "@/components/theme-provider"
import './App.css'
import JiraTicketCreator from './pages/jira-ticket-creator'

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <JiraTicketCreator />
    </ThemeProvider>
  )
}

export default App
