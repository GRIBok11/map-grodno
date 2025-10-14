import React from 'react'
import './ModernUI2.css'

const SidePanel = ({ isOpen, children }) => {
  return (
    <div className={`modern-side-panel ${isOpen ? 'open' : 'closed'}`}>
      <div className="side-panel-content">
        {children}
      </div>
    </div>
  )
}

export default SidePanel