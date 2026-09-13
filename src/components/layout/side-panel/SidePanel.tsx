'use client'

import { ReactNode } from 'react'
import classes from './SidePanel.module.scss'

type SidePanelProps = {
  side: 'left' | 'right'
  titleId?: string
  onClose: () => void
  children: ReactNode
}

const SidePanel = ({ side, titleId, onClose, children }: SidePanelProps) => {
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
