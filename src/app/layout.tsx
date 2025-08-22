import FooterComponent from '@/components/layout/footer/FooterComponent'
import HeaderComponent from '@/components/layout/header/HeaderComponent'
import React, { ReactNode } from 'react'
import Script from 'next/script'
import classes from './layout.module.scss'
import UserContextProvider from '@/context/user-context'
import './ui/globals.scss'
import BackdropContextProvider from '@/context/backdrop-context'

export type LayoutProps = {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <div className={classes.pageWrapper}>
          <UserContextProvider>
            <BackdropContextProvider>
              <HeaderComponent />
              <main className={classes.main}>{children}</main>
              <FooterComponent />
            </BackdropContextProvider>
          </UserContextProvider>
        </div>
        <Script src="https://kit.fontawesome.com/707065c5c5.js" crossOrigin="anonymous" strategy="lazyOnload" />
      </body>
    </html>
  )
}

export default Layout
