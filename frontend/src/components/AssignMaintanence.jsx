import React, { useState, useEffect } from 'react'
import { maintenanceRequestAPI, employeeAPI } from '../api'

const AssignMaintanence = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [requestsData, employeesData] = await Promise.all([
        maintenanceRequestAPI.getAllMaintenanceRequests(),
        employeeAPI.getAllEmployees()
      ])
      setMaintenanceRequests(requestsData)
      setEmployees(employeesData)
      setError(null)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load maintenance requests and employees')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRequest = async (requestId) => {
    if (!selectedEmployee) {
      alert('Please select an employee to assign this request to')
      return
    }

    try {
      await maintenanceRequestAPI.assignMaintenanceRequest(requestId, parseInt(selectedEmployee))
      
      // Update local state to reflect the assignment
      setMaintenanceRequests(prev => 
        prev.map(req => 
          req.requestId === requestId 
            ? { ...req, assignedTo: parseInt(selectedEmployee), status: 'Assigned' }
            : req
        )
      )
      setSelectedRequest(null)
      setSelectedEmployee('')
      alert('Maintenance request assigned successfully!')
    } catch (err) {
      console.error('Error assigning request:', err)
      alert('Failed to assign maintenance request. Please try again.')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#fbbf24'
      case 'assigned': return '#3b82f6'
      case 'in progress': return '#8b5cf6'
      case 'completed': return '#10b981'
      case 'cancelled': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading maintenance requests...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button onClick={loadData} style={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Maintenance Request Assignment</h2>
      
      {maintenanceRequests.length === 0 ? (
        <div style={styles.emptyState}>
          No maintenance requests found.
        </div>
      ) : (
        <div style={styles.requestsGrid}>
          {maintenanceRequests.map((request) => (
            <div key={request.requestId} style={styles.requestCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.requestTitle}>
                  Request #{request.requestId}
                </h3>
                <span 
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(request.status)
                  }}
                >
                  {request.status || 'Unknown'}
                </span>
              </div>
              
              <div style={styles.cardContent}>
                <div style={styles.field}>
                  <strong>Ride:</strong> {request.ride?.ride_Name || 'N/A'}
                </div>
                <div style={styles.field}>
                  <strong>Issue:</strong> {request.issueDescription || 'No description'}
                </div>
                <div style={styles.field}>
                  <strong>Reported By:</strong> {request.reporter?.firstName} {request.reporter?.lastName} (ID: {request.reportedBy})
                </div>
                <div style={styles.field}>
                  <strong>Assigned To:</strong> {
                    request.assignee 
                      ? `${request.assignee.firstName} ${request.assignee.lastName} (ID: ${request.assignedTo})`
                      : 'Unassigned'
                  }
                </div>
                <div style={styles.field}>
                  <strong>Request Date:</strong> {formatDate(request.requestDate)}
                </div>
                {request.completionDate && (
                  <div style={styles.field}>
                    <strong>Completion Date:</strong> {formatDate(request.completionDate)}
                  </div>
                )}
              </div>

              <div style={styles.cardActions}>
                {request.status?.toLowerCase() === 'pending' && (
                  <button
                    onClick={() => setSelectedRequest(request)}
                    style={styles.assignButton}
                  >
                    Assign
                  </button>
                )}
                <button
                  onClick={() => loadData()}
                  style={styles.refreshButton}
                >
                  Refresh
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {selectedRequest && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              Assign Request #{selectedRequest.requestId}
            </h3>
            <p style={styles.modalDescription}>
              Select an employee to assign this maintenance request to:
            </p>
            
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={styles.employeeSelect}
            >
              <option value="">Select an employee...</option>
              {employees.map((employee) => (
                <option key={employee.employee_ID} value={employee.employee_ID}>
                  {employee.firstName} {employee.lastName} - {employee.department?.department_Name || 'No Department'}
                </option>
              ))}
            </select>

            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setSelectedEmployee('')
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignRequest(selectedRequest.requestId)}
                style={styles.confirmButton}
              >
                Assign Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#1f2937'
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#6b7280',
    padding: '40px'
  },
  error: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#ef4444',
    padding: '20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  emptyState: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#6b7280',
    padding: '40px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  requestsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px'
  },
  requestCard: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  requestTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
    color: '#1f2937'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  cardContent: {
    marginBottom: '15px'
  },
  field: {
    marginBottom: '8px',
    fontSize: '14px',
    color: '#374151'
  },
  cardActions: {
    display: 'flex',
    gap: '10px'
  },
  assignButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  refreshButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#1f2937'
  },
  modalDescription: {
    marginBottom: '20px',
    color: '#6b7280'
  },
  employeeSelect: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    marginBottom: '20px'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  confirmButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px'
  }
}

export default AssignMaintanence
