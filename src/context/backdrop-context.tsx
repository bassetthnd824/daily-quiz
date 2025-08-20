'use client'

import { createContext, ReactNode, useContext, useState } from 'react'
import Backdrop from '@/components/ui-elements/Backdrop/Backdrop'

export type BackdropContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const BackdropContext = createContext<BackdropContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
})

const BackdropContextProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const open = () => {
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  return (
    <BackdropContext.Provider
      value={{
        isOpen,
        open,
        close,
      }}
    >
      <Backdrop isOpen={isOpen} onClick={close} />
      {children}
    </BackdropContext.Provider>
  )
}

export default BackdropContextProvider

export const useBackdrop = () => useContext(BackdropContext)
