import React from 'react'
import { motion } from 'framer-motion'

const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    red: 'text-red-600 bg-red-50',
  }

  return (
    <motion.div
      className="stats-card"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="stats-card-content">
        <div className="stats-card-header">
          <div className={`stats-card-icon ${colorClasses[color] || colorClasses.blue}`}>
            <Icon size={24} />
          </div>
          <div className="stats-card-trend">
            {trend}
          </div>
        </div>
        <div className="stats-card-body">
          <div className="stats-card-value">
            {value.toLocaleString()}
          </div>
          <div className="stats-card-title">
            {title}
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-card {
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .stats-card:hover {
          box-shadow: var(--shadow-lg);
        }

        .stats-card-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .stats-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .stats-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
        }

        .stats-card-trend {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-md);
        }

        .stats-card-body {
          flex: 1;
        }

        .stats-card-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .stats-card-title {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* Color classes */
        .text-blue-600 { color: #2563eb; }
        .bg-blue-50 { background-color: #eff6ff; }
        
        .text-green-600 { color: #059669; }
        .bg-green-50 { background-color: #ecfdf5; }
        
        .text-purple-600 { color: #7c3aed; }
        .bg-purple-50 { background-color: #faf5ff; }
        
        .text-orange-600 { color: #ea580c; }
        .bg-orange-50 { background-color: #fff7ed; }
        
        .text-red-600 { color: #dc2626; }
        .bg-red-50 { background-color: #fef2f2; }
      `}</style>
    </motion.div>
  )
}

export default StatsCard
