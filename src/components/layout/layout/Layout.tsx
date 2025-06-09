import FooterComponent from '@/components/layout/footer/FooterComponent';
import HeaderComponent from '@/components/layout/header/HeaderComponent';
import React, { ReactNode } from 'react';
import classes from './Layout.module.scss';
import UserContextProvider from '@/context/user-context'

export type LayoutProps = {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={classes.pageWrapper}>
      <UserContextProvider>
        <HeaderComponent/>
          <main className={classes.main}>{ children }</main>
        <FooterComponent/>
      </UserContextProvider>
    </div>
  )
}

export default Layout