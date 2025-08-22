    let invoices = [];
    let editedInvoices = new Set();
    let filteredInvoices = [];
    let originalAmountPaid = new Map();

    // Authentication handling
    (function() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const email = params.get("email");

      if (token && email) {
        localStorage.setItem("jwtToken", token);
        localStorage.setItem("loggedInUser", email);
        
        // Clean URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      const savedToken = localStorage.getItem("jwtToken");
      const savedEmail = localStorage.getItem("loggedInUser");

      if (savedToken && savedEmail) {
        window.currentUser = { email: savedEmail, token: savedToken };
        document.getElementById("userEmail").textContent = savedEmail;
      } else {
        document.getElementById("userEmail").textContent = "Not logged in";
        showError("Please log in to access payment tracking");
      }
    })();

    // Load invoices from server
    async function loadInvoices() {
      showLoading(true);
      try {
        const response = await fetch("https://invoice-generator-backend-jg51.onrender.com/api/invoices", {
          headers: { "Authorization": `Bearer ${window.currentUser?.token || ""}` }
        });

        if (response.status === 401) {
          showError("Session expired. Please login again.");
          setTimeout(() => logout(), 2000);
          return;
        }

        const data = await response.json();
        if (data.invoices) {
          invoices = data.invoices;
          
          // Store original amount paid for each invoice
          originalAmountPaid.clear();
          invoices.forEach((invoice, index) => {
            originalAmountPaid.set(index, invoice.amountPaid || 0);
          });
          
          filteredInvoices = [...invoices];
          displayInvoices();
          updateDashboard();
        } else {
          showError("Failed to load invoices");
        }
      } catch (error) {
        showError("Error loading invoices: " + error.message);
      } finally {
        showLoading(false);
      }
    }

    // Update dashboard with summary data
    function updateDashboard() {
      document.getElementById('totalInvoices').textContent = invoices.length;
      
      const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
      const totalPending = invoices.reduce((sum, inv) => sum + (inv.amountRemaining || 0), 0);
      
      const today = new Date();
      const totalOverdue = invoices.reduce((sum, inv) => {
        if (inv.dueDate && new Date(inv.dueDate) < today && inv.amountRemaining > 0) {
          return sum + (inv.amountRemaining || 0);
        }
        return sum;
      }, 0);
      
      document.getElementById('totalPaid').textContent = `$${totalPaid.toFixed(2)}`;
      document.getElementById('totalPending').textContent = `$${totalPending.toFixed(2)}`;
      document.getElementById('totalOverdue').textContent = `$${totalOverdue.toFixed(2)}`;
    }

    // Filter invoices based on selected criteria
    function filterInvoices() {
      const statusFilter = document.getElementById('statusFilter').value;
      const dateFilter = document.getElementById('dateFilter').value;
      const searchText = document.getElementById('searchInput').value.toLowerCase();
      
      const today = new Date();
      
      filteredInvoices = invoices.filter(invoice => {
        // Status filter
        if (statusFilter !== 'all' && invoice.paymentStatus !== statusFilter) {
          return false;
        }
        
        // Date filter
        if (dateFilter !== 'all' && invoice.dueDate) {
          const dueDate = new Date(invoice.dueDate);
          const timeDiff = dueDate.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          if (dateFilter === 'week' && daysDiff > 7) return false;
          if (dateFilter === 'month' && daysDiff > 30) return false;
          if (dateFilter === 'overdue' && (dueDate >= today || invoice.amountRemaining === 0)) return false;
        }
        
        // Search filter
        if (searchText) {
          const matchesInvoiceNo = invoice.invoiceNo && invoice.invoiceNo.toLowerCase().includes(searchText);
          const matchesBilledTo = invoice.billedToName && invoice.billedToName.toLowerCase().includes(searchText);
          if (!matchesInvoiceNo && !matchesBilledTo) return false;
        }
        
        return true;
      });
      
      displayInvoices();
    }

    // Validate amount paid input
    function validateAmountPaid(index, newAmount) {
      const invoice = invoices[index];
      const grandTotal = invoice.grandTotal || 0;
      const originalAmount = originalAmountPaid.get(index) || 0;
      
      if (newAmount > grandTotal) {
        showError(`Amount paid cannot exceed grand total of $${grandTotal.toFixed(2)}`);
        return false;
      }
      
      if (newAmount < originalAmount) {
        showError(`Amount paid cannot be less than the original amount of $${originalAmount.toFixed(2)}`);
        return false;
      }
      
      return true;
    }

    // Display invoices in table
    function displayInvoices() {
      const tbody = document.getElementById("invoiceBody");
      tbody.innerHTML = "";

      if (filteredInvoices.length === 0) {
        document.getElementById("invoiceTable").style.display = "none";
        showMessage("No invoices found matching your filters", "info");
        return;
      }

      filteredInvoices.forEach((invoice, index) => {
        const originalIndex = invoices.findIndex(inv => inv._id === invoice._id);
        const row = document.createElement("tr");
        
        let statusClass = '';
        let statusText = '';
        
        switch(invoice.paymentStatus) {
          case 'paid':
            statusClass = 'status-paid';
            statusText = 'Paid';
            break;
          case 'partially_paid':
            statusClass = 'status-partial';
            statusText = 'Partial';
            break;
          case 'to_be_paid':
            if (invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.amountRemaining > 0) {
              statusClass = 'status-overdue';
              statusText = 'Overdue';
            } else {
              statusClass = 'status-pending';
              statusText = 'Pending';
            }
            break;
          default:
            statusClass = 'status-pending';
            statusText = 'Pending';
        }
        
        const isFullyPaid = invoice.paymentStatus === 'paid';
        const amountRemaining = invoice.amountRemaining || 0;
        
        row.innerHTML = `
          <td>${invoice.invoiceNo || "N/A"}</td>
          <td>${invoice.billedToName || "N/A"}</td>
          <td>$${invoice.grandTotal?.toFixed(2) || "0.00"}</td>
          <td>
            <input type="number" class="table-input"
                   value="${invoice.amountPaid || 0}"
                   step="0.01"
                   min="${originalAmountPaid.get(originalIndex) || 0}"
                   max="${invoice.grandTotal || 0}"
                   onchange="handleAmountPaidChange(${originalIndex}, this.value, this)"
                   title="${isFullyPaid ? 'Cannot modify amount for fully paid invoices' : 'Enter amount paid'}">
          </td>
          <td>$${(invoice.amountRemaining || 0).toFixed(2)}</td>
          <td>
            <select class="table-input" 
                    ${isFullyPaid ? 'disabled' : ''}
                    onchange="handlePaymentStatusChange(${originalIndex}, this.value, this)"
                    title="${isFullyPaid ? 'Cannot modify status for fully paid invoices' : 'Select payment status'}">
              <option value="paid" ${invoice.paymentStatus === "paid" ? "selected" : ""} 
                      ${amountRemaining > 0 ? 'disabled' : ''}>Paid</option>
              <option value="partially_paid" ${invoice.paymentStatus === "partially_paid" ? "selected" : ""} 
                      ${amountRemaining === 0 ? 'disabled' : ''}>Partially Paid</option>
              <option value="to_be_paid" ${invoice.paymentStatus === "to_be_paid" ? "selected" : ""} 
                      ${amountRemaining === 0 ? 'disabled' : ''}>To Be Paid</option>
            </select>
          </td>
          <td>
            <input type="date" class="table-input"
                   value="${invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : ""}"
                   disabled
                   title="Due date cannot be modified">
          </td>
          <td>${new Date(invoice.createdAt).toLocaleDateString()}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-primary btn-sm" onclick="saveSingleInvoice(${originalIndex})">
                <i class="fas fa-save"></i> Save
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });

      document.getElementById("invoiceTable").style.display = "table";
    }

    // Handle amount paid change with validation
    function handleAmountPaidChange(index, value, inputElement) {
      const newAmount = parseFloat(value) || 0;
      
      if (!validateAmountPaid(index, newAmount)) {
        inputElement.value = invoices[index].amountPaid || 0;
        return;
      }
      
      markAsEdited(index, 'amountPaid', newAmount);
      updatePaymentStatusDropdown(index);
    }

    // Update payment status dropdown options based on current state
    function updatePaymentStatusDropdown(index) {
      const invoice = invoices[index];
      const amountRemaining = invoice.amountRemaining || 0;
      const amountPaid = invoice.amountPaid || 0;
      
      const selectElement = document.querySelector(`select[onchange*="handlePaymentStatusChange(${index}"]`);
      if (!selectElement) return;
      
      const options = selectElement.querySelectorAll('option');
      options.forEach(option => {
        switch(option.value) {
          case 'paid':
            option.disabled = amountRemaining > 0;
            break;
          case 'partially_paid':
            option.disabled = amountRemaining === 0;
            break;
          case 'to_be_paid':
            option.disabled = amountPaid > 0 || amountRemaining === 0;
            break;
        }
      });
      
      if (selectElement.selectedOptions[0]?.disabled) {
        if (amountRemaining === 0) {
          selectElement.value = 'paid';
          invoice.paymentStatus = 'paid';
        } else if (amountPaid > 0) {
          selectElement.value = 'partially_paid';
          invoice.paymentStatus = 'partially_paid';
        }
      }
    }

    // Handle payment status change with validation
    function handlePaymentStatusChange(index, value, selectElement) {
      const invoice = invoices[index];
      const amountRemaining = invoice.amountRemaining || 0;
      
      if (amountRemaining === 0 && value !== 'paid') {
        showError("Invoice with zero remaining amount can only be marked as 'Paid'");
        selectElement.value = invoice.paymentStatus;
        return;
      }
      
      if (invoice.paymentStatus === 'paid' && value !== 'paid') {
        showError("Cannot change status of a fully paid invoice");
        selectElement.value = 'paid';
        return;
      }
      
      markAsEdited(index, 'paymentStatus', value);
    }

    // Mark invoice as edited
    function markAsEdited(index, field, value) {
      if (!editedInvoices.has(index)) editedInvoices.add(index);
      
      if (field === "amountPaid") {
        invoices[index].amountPaid = parseFloat(value) || 0;
        invoices[index].amountRemaining = Math.max(
          (invoices[index].grandTotal || 0) - (invoices[index].amountPaid || 0), 0
        );
        
        if (invoices[index].amountRemaining === 0) {
          invoices[index].paymentStatus = "paid";
        } else if (invoices[index].amountPaid > 0) {
          invoices[index].paymentStatus = "partially_paid";
        } else {
          invoices[index].paymentStatus = "to_be_paid";
        }
        
        filterInvoices();
      } else {
        invoices[index][field] = value;
      }
    }

    // Save single invoice
    async function saveSingleInvoice(index) {
      try {
        const response = await fetch("https://invoice-generator-backend-jg51.onrender.com/api/update-invoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${window.currentUser?.token || ""}`
          },
          body: JSON.stringify({ index, invoice: invoices[index] })
        });

        if (response.ok) {
          showMessage("Invoice updated successfully!", "success");
          editedInvoices.delete(index);
          setTimeout(loadInvoices, 1000);
        } else {
          showError("Failed to update invoice");
        }
      } catch (error) {
        showError("Error updating invoice: " + error.message);
      }
    }

    // Export to CSV function
    function exportToCSV() {
      if (invoices.length === 0) {
        showMessage("No invoices to export", "info");
        return;
      }

      const csvContent = [
        ["Invoice No", "Billed To", "Grand Total", "Amount Paid", "Amount Remaining", "Payment Status", "Due Date", "Created Date"],
        ...invoices.map(inv => [
          inv.invoiceNo || "N/A",
          inv.billedToName || "N/A",
          inv.grandTotal || 0,
          inv.amountPaid || 0,
          inv.amountRemaining || 0,
          inv.paymentStatus || "N/A",
          inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A",
          new Date(inv.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "invoices_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showMessage("CSV export started", "success");
    }

    function refreshInvoices() {
      editedInvoices.clear();
      loadInvoices();
      showMessage("Refreshed invoices", "info");
    }

    function logout() {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("loggedInUser");
      window.location.href = "hero.html";
    }

    function showLoading(show) {
      document.getElementById("loading").style.display = show ? "flex" : "none";
    }

    function showMessage(message, type) {
      showToast(message, type);
    }

    function showToast(message, type) {
      let toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          max-width: 400px;
        `;
        document.body.appendChild(toastContainer);
      }

      const toast = document.createElement('div');
      toast.style.cssText = `
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
        max-width: 100%;
        word-wrap: break-word;
      `;

      switch(type) {
        case 'success':
          toast.style.backgroundColor = '#10b981';
          break;
        case 'error':
          toast.style.backgroundColor = '#ef4444';
          break;
        case 'info':
          toast.style.backgroundColor = '#3b82f6';
          break;
        case 'warning':
          toast.style.backgroundColor = '#f59e0b';
          break;
        default:
          toast.style.backgroundColor = '#6b7280';
      }

      toast.textContent = message;
      toast.onclick = () => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
      };

      toastContainer.appendChild(toast);

      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.animation = 'slideOut 0.3s ease-in';
          setTimeout(() => toast.remove(), 300);
        }
      }, 2000);
    }

    function showError(message) {
      showMessage(message, "error");
    }

    // Start once DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
      if (window.currentUser) {
        loadInvoices();
      } else {
        showLoading(false);
      }
    });