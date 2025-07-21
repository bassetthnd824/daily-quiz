import FooterComponent from '@/components/layout/footer/FooterComponent'
import HeaderComponent from '@/components/layout/header/HeaderComponent'
import React, { ReactNode } from 'react'
import classes from './layout.module.scss'
import UserContextProvider from '@/context/user-context'
import './ui/globals.scss'

export type LayoutProps = {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = async ({ children }) => {
  return (
    <html lang="en">
      <body>
        <div className={classes.pageWrapper}>
          <UserContextProvider>
            <HeaderComponent />
            <main className={classes.main}>{children}</main>
            <FooterComponent />
          </UserContextProvider>
        </div>
      </body>
    </html>
  )
}

export default Layout
