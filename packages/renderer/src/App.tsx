import React from 'react'
import { HashRouter } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import './i18n/index' // initialize i18next

export default function App(): React.ReactElement {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  )
}
