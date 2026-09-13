'use client'

import { ReactNode, useEffect } from 'react'
import classes from './SidePanel.module.scss'

type SidePanelProps = {
  side: 'left' | 'right'
  titleId?: string
  onClose: () => void
  children: ReactNode
}

const SidePanel = ({ side, titleId, onClose, children }: SidePanelProps) => {
  useEffect(() => {
    const { body, documentElement } = document
    const previousBodyOverflow = body.style.overflow
    const previousHtmlOverflow = documentElement.style.overflow
    body.style.overflow = 'hidden'
    documentElement.style.overflow = 'hidden'

    return () => {
      body.style.overflow = previousBodyOverflow
      documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  return (
    <div
      className={`${classes.panel} ${classes[side]}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button type="button" className={classes.close} aria-label="Close menu" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
      {children}
    </div>
  )
}

export default SidePanel
