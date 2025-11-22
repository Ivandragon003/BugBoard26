import React, { useState } from 'react';

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const issues = [
    {
      titolo: 'Update API documentation',
      stato: 'To Do',
      tipo: 'Documentation',
      priorita: 'medium',
      data: '15/10/2025'
    },
    {
      titolo: 'Add dark mode support',
      stato: 'To Do',
      tipo: 'Feature',
      priorita: 'medium',
      data: '12/10/2025'
    },
    {
      titolo: 'Login button not working on mobile',
      stato: 'In Progress',
      tipo: 'Bug',
      priorita: 'high',
      data: '10/10/2025'
    },
    {
      titolo: 'How to reset password?',
      stato: 'Done',
      tipo: 'Question',
      priorita: 'low',
      data: '08/10/2025'
    }
  ];

  const getStatoStyle = (stato: string) => {
    switch(stato) {
      case 'To Do': return { bg: '#e5e7eb', color: '#374151' };
      case 'In Progress': return { bg: '#fed7aa', color: '#9a3412' };
      case 'Done': return { bg: '#86efac', color: '#166534' };
      default: return { bg: '#e5e7eb', color: '#374151' };
    }
  };

  const getTipoStyle = (tipo: string) => {
    switch(tipo) {
      case 'Documentation': return { bg: '#d1fae5', color: '#065f46' };
      case 'Feature': return { bg: '#dbeafe', color: '#1e40af' };
      case 'Bug': return { bg: '#fee2e2', color: '#991b1b' };
      case 'Question': return { bg: '#e9d5ff', color: '#6b21a8' };
      default: return { bg: '#e5e7eb', color: '#374151' };
    }
  };

  const getPrioritaStyle = (priorita: string) => {
    switch(priorita) {
      case 'high': return { bg: '#fee2e2', color: '#991b1b' };
      case 'medium': return { bg: '#fef3c7', color: '#92400e' };
      case 'low': return { bg: '#f3f4f6', color: '#374151' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '264px' : '0',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <div style={{ width: '264px', padding: '24px 16px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#0d9488',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              BB
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>BugBoard</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Dashboard</div>
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#0d9488',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <span>📊</span>
              Dashboard
            </div>
            <div style={{
              padding: '12px 16px',
              color: '#6b7280',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>📋</span>
              Lista Issue
            </div>
            <div style={{
              padding: '12px 16px',
              color: '#6b7280',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>➕</span>
              Nuova Issue
            </div>
          </div>

          {/* Bottom Menu */}
          <div style={{ 
            position: 'absolute', 
            bottom: '24px', 
            left: '16px', 
            right: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              padding: '12px 16px',
              color: '#6b7280',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>👤</span>
              Profilo
            </div>
            <div style={{
              padding: '12px 16px',
              color: '#6b7280',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>🚪</span>
              Logout
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Hamburger Menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ width: '24px', height: '2px', backgroundColor: '#374151', borderRadius: '2px' }}></div>
              <div style={{ width: '24px', height: '2px', backgroundColor: '#374151', borderRadius: '2px' }}></div>
              <div style={{ width: '24px', height: '2px', backgroundColor: '#374151', borderRadius: '2px' }}></div>
            </button>

            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                BugBoard Dashboard
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Issue Management System
              </p>
            </div>
          </div>

          <button style={{
            padding: '10px 20px',
            backgroundColor: '#0d9488',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>+</span>
            Nuova Issue
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Filter Dropdown */}
          <div style={{ marginBottom: '32px' }}>
            <select style={{
              padding: '10px 40px 10px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              backgroundColor: 'white',
              cursor: 'pointer',
              outline: 'none'
            }}>
              <option>Tutte le issue</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Issue Totali</div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1f2937' }}>4</div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  📋
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Issue Todo</div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1f2937' }}>2</div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  ⏰
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Issue In Progress</div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1f2937' }}>1</div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  📈
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Issue Done</div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1f2937' }}>1</div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#d1fae5',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  ✅
                </div>
              </div>
            </div>
          </div>

          {/* Recent Issues Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Issue Recenti
              </h2>
              <button style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#0d9488',
                border: '1px solid #0d9488',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Visualizza Tutte
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Titolo</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Stato</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Tipo</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Priorità</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Data Creazione</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue, index) => (
                    <tr key={index} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1f2937' }}>
                        {issue.titolo}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getStatoStyle(issue.stato).bg,
                          color: getStatoStyle(issue.stato).color
                        }}>
                          {issue.stato}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getTipoStyle(issue.tipo).bg,
                          color: getTipoStyle(issue.tipo).color
                        }}>
                          {issue.tipo}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getPrioritaStyle(issue.priorita).bg,
                          color: getPrioritaStyle(issue.priorita).color
                        }}>
                          {issue.priorita}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                        {issue.data}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;