import React, { useState, useEffect } from "react";
import { authAPI, employeeAPI } from "../api";

const EmployeeDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("employees");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hireDate: "",
    salary: "",
    departmentId: "",
    roleId: "",
    password: "",
  });

  const [createEmployeeForm, setCreateEmployeeForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hireDate: "",
    salary: "",
    departmentId: "",
    roleId: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({
    departmentName: "",
  });
  const [roleForm, setRoleForm] = useState({
    roleName: "",
    description: "",
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [customersData, employeesData, departmentsData, rolesData] =
        await Promise.all([
          authAPI.getAllCustomers(),
          employeeAPI.getAllEmployees(),
          employeeAPI.getAllDepartments(),
          employeeAPI.getAllRoles(),
        ]);

      setCustomers(customersData);
      setEmployees(employeesData);
      setDepartments(departmentsData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      hireDate: employee.hireDate ? employee.hireDate.split("T")[0] : "",
      salary: employee.salary || "",
      departmentId: employee.departmentId || "",
      roleId: employee.roleId || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const handlePromoteCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      hireDate: new Date().toISOString().split("T")[0],
      salary: "",
      departmentId: "",
      roleId: "",
    });
    setShowPromoteModal(true);
  };

  const handleSaveEmployee = async () => {
    try {
      if (selectedEmployee) {
        // Include the employeeId in the formData to match what the backend expects
        const updateData = {
          ...formData,
          employeeId: selectedEmployee.employeeId,
          // Convert empty strings to null for optional fields
          departmentId: formData.departmentId || null,
          roleId: formData.roleId || null,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          hireDate: formData.hireDate || null,
        };
        await employeeAPI.updateEmployee(
          selectedEmployee.employeeId,
          updateData
        );

        // If a password was provided, update it via the auth API (separate user_login table)
        if (formData.password && formData.password.trim() !== "") {
          try {
            await authAPI.updateProfile(selectedEmployee.employeeId, { Password: formData.password }, "Employee");
          } catch (pwErr) {
            console.error("Error updating password:", pwErr);
            // Surface server message if present
            if (pwErr?.response?.data?.message) {
              alert(`Password update failed: ${pwErr.response.data.message}`);
            } else {
              alert("Password update failed. See console for details.");
            }
            // Don't continue to close modal / reload if password update failed
            return;
          }
        }
      }
      setShowEditModal(false);
      setSelectedEmployee(null);
      loadAllData();
      alert(`✓ Employee ${formData.firstName} ${formData.lastName} has been updated successfully!`);
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Error updating employee. Please try again.");
    }
  };

  const handlePromoteToEmployee = async () => {
    try {
      // Create the employee first
      await employeeAPI.createEmployee(formData);

      // Delete the customer from the customers table
      if (selectedCustomer?.customerId) {
        await authAPI.deleteCustomer(selectedCustomer.customerId);
      }

      setShowPromoteModal(false);
      setSelectedCustomer(null);
      loadAllData();
      alert(`✓ Customer ${formData.firstName} ${formData.lastName} has been promoted to Employee!`);
    } catch (error) {
      console.error("Error promoting customer:", error);
      alert("Error promoting customer to employee. Please try again.");
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        console.log("Attempting to delete employeeId:", employeeId);
        const resp = await employeeAPI.deleteEmployee(employeeId);
        console.log("Delete employee API response:", resp);
        loadAllData();
        alert("✓ Employee has been successfully removed from the system.");
      } catch (error) {
        console.error("Error deleting employee:", error);
        let msg = "Error deleting employee.";
        if (error?.response?.data?.message) {
          msg += `\n${error.response.data.message}`;
        } else if (error?.message) {
          msg += `\n${error.message}`;
        }
        alert(msg);
      }
    }
  };

  const handleCreateEmployeeAccount = async () => {
    try {
      if (createEmployeeForm.password !== createEmployeeForm.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      // Create employee account with login credentials
      const employeeAccountData = {
        firstName: createEmployeeForm.firstName,
        lastName: createEmployeeForm.lastName,
        email: createEmployeeForm.email,
        phone: createEmployeeForm.phone,
        username: createEmployeeForm.username,
        password: createEmployeeForm.password,
        hireDate: createEmployeeForm.hireDate,
        salary: createEmployeeForm.salary,
        departmentId: createEmployeeForm.departmentId,
        roleId: createEmployeeForm.roleId,
      };

      await authAPI.registerEmployee(employeeAccountData);

      // Reset form and close modal
      setCreateEmployeeForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        hireDate: "",
        salary: "",
        departmentId: "",
        roleId: "",
        username: "",
        password: "",
        confirmPassword: "",
      });
      setShowCreateEmployeeModal(false);
      loadAllData();
      alert(`✓ Employee account for ${employeeAccountData.firstName} ${employeeAccountData.lastName} has been created successfully!`);
    } catch (error) {
      console.error("Error creating employee account:", error);
      alert("Error creating employee account. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleAddDepartment = async () => {
    try {
      if (!departmentForm.departmentName.trim()) {
        alert("Please enter a department name!");
        return;
      }

      const departmentData = {
        departmentName: departmentForm.departmentName.trim(),
      };

      await employeeAPI.createDepartment(departmentData);

      // Reset form and close modal
      setDepartmentForm({ departmentName: "" });
      setShowAddDepartmentModal(false);
      loadAllData();
      alert("Department created successfully!");
    } catch (error) {
      console.error("Error creating department:", error);
      alert("Error creating department. Please try again.");
    }
  };

  const handleAddRole = async () => {
    try {
      if (!roleForm.roleName.trim()) {
        alert("Please enter a role name!");
        return;
      }

      const roleData = {
        roleName: roleForm.roleName.trim(),
        description: roleForm.description.trim(),
      };

      await employeeAPI.createRole(roleData);

      // Reset form and close modal
      setRoleForm({ roleName: "", description: "" });
      setShowAddRoleModal(false);
      loadAllData();
      alert("Role created successfully!");
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Error creating role. Please try again.");
    }
  };

  const styles = {
    container: {
      maxWidth: "80rem",
      margin: "0 auto",
      padding: "24px",
    },
    header: {
      marginBottom: "32px",
    },
    title: {
      fontSize: "30px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    subtitle: {
      color: "#6b7280",
    },
    tabsContainer: {
      borderBottom: "1px solid #e5e7eb",
      marginBottom: "24px",
    },
    tabsNav: {
      marginBottom: "-1px",
      display: "flex",
      gap: "32px",
    },
    tabButton: {
      padding: "8px 4px",
      borderBottom: "2px solid",
      fontWeight: "500",
      fontSize: "14px",
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
    },
    card: {
      backgroundColor: "white",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
    },
    cardContent: {
      padding: "20px 24px",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "500",
      color: "#111827",
    },
    button: {
      backgroundColor: "#2563eb",
      color: "white",
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
    },
    buttonGreen: {
      backgroundColor: "#059669",
      color: "white",
      padding: "4px 12px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
    },
    table: {
      minWidth: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
    },
    tableHeader: {
      backgroundColor: "#f9fafb",
    },
    tableHeaderCell: {
      padding: "12px 24px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "500",
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    tableRow: {
      backgroundColor: "white",
    },
    tableCell: {
      padding: "16px 24px",
      whiteSpace: "nowrap",
      fontSize: "14px",
      color: "#6b7280",
    },
    tableCellName: {
      padding: "16px 24px",
      whiteSpace: "nowrap",
      fontSize: "14px",
      fontWeight: "500",
      color: "#111827",
    },
    linkButton: {
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      marginRight: "12px",
    },
    linkButtonBlue: {
      color: "#2563eb",
    },
    linkButtonRed: {
      color: "#dc2626",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "16px",
    },
    gridItem: {
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "16px",
      cursor: "pointer",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(75, 85, 99, 0.5)",
      overflowY: "auto",
      height: "100%",
      width: "100%",
      zIndex: 50,
    },
    modalContent: {
      position: "relative",
      top: "80px",
      margin: "0 auto",
      padding: "20px",
      border: "1px solid #e5e7eb",
      width: "384px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      borderRadius: "6px",
      backgroundColor: "white",
    },
    formGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "4px",
    },
    input: {
      display: "block",
      width: "100%",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "14px",
    },
    select: {
      display: "block",
      width: "100%",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "14px",
    },
    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "24px",
    },
    buttonSecondary: {
      padding: "8px 16px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      color: "#374151",
      backgroundColor: "transparent",
      cursor: "pointer",
    },
    loading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "256px",
    },
    loadingText: {
      fontSize: "20px",
    },
  };

  // CustomerStatsBox: shows total and average accounts added per month
  function CustomerStatsBox({ customers }) {
    // Group customers by month
    const monthCounts = {};
    let total = 0;
    customers.forEach((c) => {
      if (!c.createdAt) return;
      const d = new Date(c.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthCounts[key] = (monthCounts[key] || 0) + 1;
      total++;
    });
    const months = Object.keys(monthCounts).sort();
    const avg = months.length > 0 ? (total / months.length).toFixed(2) : "0";
    return (
      <div style={{
        background: "#f3f4f6",
        borderRadius: "8px",
        padding: "18px 24px",
        marginBottom: "18px",
        display: "flex",
        gap: "32px",
        alignItems: "center",
        justifyContent: "flex-start",
        fontSize: "16px",
        color: "#374151",
        fontWeight: 500,
      }}>
        <div>
          <span style={{ fontSize: "22px", fontWeight: 700 }}>{total}</span>
          <span style={{ marginLeft: "8px" }}>Total Accounts Added</span>
        </div>
        <div>
          <span style={{ fontSize: "22px", fontWeight: 700 }}>{avg}</span>
          <span style={{ marginLeft: "8px" }}>Average Per Month</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>User Management Dashboard</h1>
        <p style={styles.subtitle}>
          Manage employees, departments and roles
        </p>
      </div>

      {/* Tabs (removed department and role add tabs) */}
      <div style={styles.tabsContainer}>
        <nav style={styles.tabsNav}>
          {[
            { id: "employees", name: "Employees", count: employees.length },
            { id: "customers", name: "Customers", count: customers.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabButton,
                borderColor: activeTab === tab.id ? "#3b82f6" : "transparent",
                color: activeTab === tab.id ? "#2563eb" : "#6b7280",
                borderBottomColor:
                  activeTab === tab.id ? "#3b82f6" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.color = "#374151";
                  e.target.style.borderBottomColor = "#d1d5db";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.color = "#6b7280";
                  e.target.style.borderBottomColor = "transparent";
                }
              }}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Employees</h3>
              <button
                style={styles.button}
                onClick={() => setShowCreateEmployeeModal(true)}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#1d4ed8")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#2563eb")
                }
              >
                Create Employee Account
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Name</th>
                    <th style={styles.tableHeaderCell}>Email</th>
                    <th style={styles.tableHeaderCell}>Department</th>
                    <th style={styles.tableHeaderCell}>Role</th>
                    <th style={styles.tableHeaderCell}>Hire Date</th>
                    <th style={styles.tableHeaderCell}>Salary</th>
                    <th style={styles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody style={styles.tableRow}>
                  {employees.map((employee, index) => (
                    <tr
                      key={employee.employeeId}
                      style={{
                        ...styles.tableRow,
                        borderTop: index > 0 ? "1px solid #e5e7eb" : "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "white")
                      }
                    >
                      <td style={styles.tableCell}>
                        <div style={styles.tableCellName}>
                          {employee.firstName} {employee.lastName}
                        </div>
                      </td>
                      <td style={styles.tableCell}>{employee.email}</td>
                      <td style={styles.tableCell}>
                        {employee.department?.departmentName || "N/A"}
                      </td>
                      <td style={styles.tableCell}>
                        {employee.role?.roleName || "N/A"}
                      </td>
                      <td style={styles.tableCell}>
                        {formatDate(employee.hireDate)}
                      </td>
                      <td style={styles.tableCell}>
                        {formatCurrency(employee.salary)}
                      </td>
                      <td style={styles.tableCell}>
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          style={{
                            ...styles.linkButton,
                            ...styles.linkButtonBlue,
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = "#1d4ed8")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = "#2563eb")
                          }
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteEmployee(employee.employeeId)
                          }
                          style={{
                            ...styles.linkButton,
                            ...styles.linkButtonRed,
                            marginRight: "0",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = "#b91c1c")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = "#dc2626")
                          }
                        >
                          Fire Employee
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Customers</h3>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>
                Promote customers to employees
              </p>
            </div>
            {/* Stats Box: Total and Average Accounts Added Per Month */}
            <CustomerStatsBox customers={customers} />
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Name</th>
                    <th style={styles.tableHeaderCell}>Email</th>
                    <th style={styles.tableHeaderCell}>Phone</th>
                    <th style={styles.tableHeaderCell}>Member Since</th>
                    <th style={styles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody style={styles.tableRow}>
                  {customers.map((customer, index) => (
                    <tr
                      key={customer.customerId}
                      style={{
                        ...styles.tableRow,
                        borderTop: index > 0 ? "1px solid #e5e7eb" : "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "white")
                      }
                    >
                      <td style={styles.tableCell}>
                        <div style={styles.tableCellName}>
                          {customer.firstName} {customer.lastName}
                        </div>
                      </td>
                      <td style={styles.tableCell}>{customer.email}</td>
                      <td style={styles.tableCell}>{customer.phone}</td>
                      <td style={styles.tableCell}>
                        {formatDate(customer.createdAt)}
                      </td>
                      <td style={styles.tableCell}>
                        <button
                          onClick={() => handlePromoteCustomer(customer)}
                          style={styles.buttonGreen}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#047857")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#059669")
                          }
                        >
                          Promote to Employee
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === "departments" && (
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Departments</h3>
              <button
                style={styles.button}
                onClick={() => setShowAddDepartmentModal(true)}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#1d4ed8")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#2563eb")
                }
              >
                Add Department
              </button>
            </div>
            <div style={styles.grid}>
              {departments.map((department) => (
                <div
                  key={department.departmentId}
                  style={styles.gridItem}
                  onMouseEnter={(e) =>
                    (e.target.style.boxShadow =
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
                  }
                  onMouseLeave={(e) => (e.target.style.boxShadow = "none")}
                >
                  <h4
                    style={{
                      fontWeight: "500",
                      color: "#111827",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {department.departmentName}
                  </h4>
                  <p
                    style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}
                  >
                    {department.employees?.length || 0} employees
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Roles</h3>
              <button
                style={styles.button}
                onClick={() => setShowAddRoleModal(true)}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#1d4ed8")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#2563eb")
                }
              >
                Add Role
              </button>
            </div>
            <div style={styles.grid}>
              {roles.map((role) => (
                <div
                  key={role.roleId}
                  style={styles.gridItem}
                  onMouseEnter={(e) =>
                    (e.target.style.boxShadow =
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
                  }
                  onMouseLeave={(e) => (e.target.style.boxShadow = "none")}
                >
                  <h4
                    style={{
                      fontWeight: "500",
                      color: "#111827",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {role.roleName}
                  </h4>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {role.description}
                  </p>
                  <p
                    style={{ fontSize: "14px", color: "#9ca3af", margin: "0" }}
                  >
                    {role.employees?.length || 0} employees
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "500",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Edit Employee
            </h3>
            <div style={{ marginBottom: "16px" }}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={formData.password}
                placeholder="Leave blank to keep current password"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Hire Date</label>
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) =>
                  setFormData({ ...formData, hireDate: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Salary</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
                style={styles.select}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select
                value={formData.roleId}
                onChange={(e) =>
                  setFormData({ ...formData, roleId: e.target.value })
                }
                style={styles.select}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowEditModal(false)}
                style={styles.buttonSecondary}
              >
                Cancel
              </button>
              <button onClick={handleSaveEmployee} style={styles.button}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote Customer Modal */}
      {showPromoteModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "500",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Promote Customer to Employee
            </h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Salary</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select
                value={formData.roleId}
                onChange={(e) =>
                  setFormData({ ...formData, roleId: e.target.value })
                }
                style={styles.select}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowPromoteModal(false)}
                style={styles.buttonSecondary}
              >
                Cancel
              </button>
              <button
                onClick={handlePromoteToEmployee}
                style={{ ...styles.button, backgroundColor: "#059669" }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#047857")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#059669")
                }
              >
                Promote to Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Employee Account Modal */}
      {showCreateEmployeeModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "500",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Create Employee Account
            </h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                value={createEmployeeForm.firstName}
                onChange={(e) =>
                  setCreateEmployeeForm({
                    ...createEmployeeForm,
                    firstName: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                value={createEmployeeForm.lastName}
                onChange={(e) =>
                  setCreateEmployeeForm({
                    ...createEmployeeForm,
                    lastName: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={createEmployeeForm.email}
                onChange={(e) =>
                  setCreateEmployeeForm({
                    ...createEmployeeForm,
                    email: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="text"
                value={createEmployeeForm.phone}
                onChange={(e) =>
                  setCreateEmployeeForm({
                    ...createEmployeeForm,
                    phone: e.target.value,
                  })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={createEmployeeForm.username}
                onChange={(e) =>
                  setCreateEmployeeForm({
                    ...createEmployeeForm,
                    username: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={createEmployeeForm.password}
                onChange={(e) =>
                  setCreateEmployeeForm({
                    ...createEmployeeForm,
                    password: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={createEmployeeForm.confirmPassword}
                onChange={(e) =>
                  setCreateEmployeeForm({
                    ...createEmployeeForm,
                    confirmPassword: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Hire Date</label>
              <input
                type="date"
                value={createEmployeeForm.hireDate}
                onChange={(e) =>
                  setCreateEmployeeForm({
                    ...createEmployeeForm,
                    hireDate: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Salary</label>
              <input
                type="number"
                value={createEmployeeForm.salary}
                onChange={(e) =>
                  setCreateEmployeeForm({
                    ...createEmployeeForm,
                    salary: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select
                value={createEmployeeForm.roleId}
                onChange={(e) =>
                  setCreateEmployeeForm({
                    ...createEmployeeForm,
                    roleId: e.target.value,
                  })
                }
                style={styles.select}
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowCreateEmployeeModal(false)}
                style={styles.buttonSecondary}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEmployeeAccount}
                style={styles.button}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDepartmentModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "500",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Add New Department
            </h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Department Name</label>
              <input
                type="text"
                value={departmentForm.departmentName}
                onChange={(e) =>
                  setDepartmentForm({
                    ...departmentForm,
                    departmentName: e.target.value,
                  })
                }
                style={styles.input}
                placeholder="Enter department name"
                required
              />
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowAddDepartmentModal(false)}
                style={styles.buttonSecondary}
              >
                Cancel
              </button>
              <button onClick={handleAddDepartment} style={styles.button}>
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "500",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Add New Role
            </h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Role Name</label>
              <input
                type="text"
                value={roleForm.roleName}
                onChange={(e) =>
                  setRoleForm({
                    ...roleForm,
                    roleName: e.target.value,
                  })
                }
                style={styles.input}
                placeholder="Enter role name"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                value={roleForm.description}
                onChange={(e) =>
                  setRoleForm({
                    ...roleForm,
                    description: e.target.value,
                  })
                }
                style={{
                  ...styles.input,
                  minHeight: "80px",
                  resize: "vertical",
                }}
                placeholder="Enter role description"
              />
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowAddRoleModal(false)}
                style={styles.buttonSecondary}
              >
                Cancel
              </button>
              <button onClick={handleAddRole} style={styles.button}>
                Add Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
