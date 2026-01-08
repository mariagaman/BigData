import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getAdminDashboardStats, getAdminBookings, getAdminUsers, getAdminTrains } from '../services/api';
import '../styles/AdminDashboard.css';

const COLORS = ['#8A2BE2', '#9370DB', '#BA55D3', '#DA70D6', '#EE82EE'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    paymentStatus: ''
  });
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [trains, setTrains] = useState([]);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [trainsPage, setTrainsPage] = useState(1);
  const [bookingsPagination, setBookingsPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [trainsPagination, setTrainsPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchDashboardData();

    if (activeTab === 'bookings') {
      setBookingsPage(1);
    }
  }, [filters]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'trains') {
      fetchTrains();
    }
  }, [activeTab, bookingsPage, usersPage, trainsPage, filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboardStats(filters);
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await getAdminBookings({
        ...filters,
        page: bookingsPage,
        limit: 20
      });
      setBookings(response.bookings || []);
      if (response.pagination) {
        setBookingsPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getAdminUsers({
        page: usersPage,
        limit: 20
      });
      setUsers(response.users || []);
      if (response.pagination) {
        setUsersPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTrains = async () => {
    try {
      const response = await getAdminTrains({
        page: trainsPage,
        limit: 20
      });
      setTrains(response.trains || []);
      if (response.pagination) {
        setTrainsPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching trains:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      paymentStatus: ''
    });

    setBookingsPage(1);
    setUsersPage(1);
    setTrainsPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} RON`;
  };

  const renderPagination = (pagination, currentPage, setPage) => {
    if (!pagination || pagination.pages <= 1) return null;

    const pages = [];
    const totalPages = pagination.pages;
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="pagination">
        <div className="pagination-info">
          Afișare {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} din {pagination.total}
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
          >
            ««
          </button>
          <button
            className="pagination-btn"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          {pages.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
            ) : (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setPage(page)}
              >
                {page}
              </button>
            )
          ))}
          <button
            className="pagination-btn"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
          <button
            className="pagination-btn"
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            »»
          </button>
        </div>
      </div>
    );
  };

  if (loading && !stats) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Se încarcă...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-dashboard">
        <div className="error">Eroare la încărcarea datelor</div>
      </div>
    );
  }

  const monthlyBookingsData = stats.monthlyBookings?.map(item => ({
    month: `${item._id.month}/${item._id.year}`,
    bookings: item.count,
    revenue: item.revenue || 0
  })) || [];

  const statusData = stats.bookingsByStatus?.map(item => ({
    name: item._id === 'confirmata' ? 'Confirmate' : item._id === 'anulata' ? 'Anulate' : item._id,
    value: item.count
  })) || [];

  const paymentMethodData = stats.bookingsByPaymentMethod?.map(item => ({
    name: item._id === 'card' ? 'Card' : item._id === 'paypal' ? 'PayPal' : item._id === 'transfer' ? 'Transfer' : item._id,
    value: item.count,
    revenue: item.revenue || 0
  })) || [];

  const newUsersData = stats.newUsersByMonth?.map(item => ({
    month: `${item._id.month}/${item._id.year}`,
    users: item.count
  })) || [];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Administrator</h1>
        <div className="filters">
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            placeholder="Data început"
            className="filter-input"
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            placeholder="Data sfârșit"
            className="filter-input"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Toate statusurile</option>
            <option value="confirmata">Confirmate</option>
            <option value="anulata">Anulate</option>
          </select>
          <select
            name="paymentStatus"
            value={filters.paymentStatus}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Toate statusurile de plată</option>
            <option value="finalizat">Finalizat</option>
            <option value="rambursat">Rambursat</option>
            <option value="anulat">Anulat</option>
          </select>
          <button onClick={resetFilters} className="btn-secondary">
            Resetează filtrele
          </button>
          <button onClick={fetchDashboardData} className="btn-primary">
            Actualizează
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Prezentare generală
        </button>
        <button
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          Rezervări
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Utilizatori
        </button>
        <button
          className={activeTab === 'trains' ? 'active' : ''}
          onClick={() => setActiveTab('trains')}
        >
          Trenuri
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="dashboard-content">
          {}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total Utilizatori</h3>
                <p className="stat-value">{stats.overview.totalUsers}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚂</div>
              <div className="stat-info">
                <h3>Total Trenuri</h3>
                <p className="stat-value">{stats.overview.totalTrains}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎟️</div>
              <div className="stat-info">
                <h3>Total Rezervări</h3>
                <p className="stat-value">{stats.overview.totalBookings}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Rezervări Confirmate</h3>
                <p className="stat-value">{stats.overview.confirmedBookings}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-info">
                <h3>Rezervări Anulate</h3>
                <p className="stat-value">{stats.overview.cancelledBookings}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Venituri Totale</h3>
                <p className="stat-value">{formatCurrency(stats.overview.totalRevenue)}</p>
              </div>
            </div>
          </div>

          {}
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Rezervări pe Lună</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyBookingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="bookings" stroke="#8A2BE2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Rezervări pe Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Rezervări pe Metodă de Plată</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentMethodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8A2BE2" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Utilizatori Noi pe Lună</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={newUsersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#9370DB" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {}
          <div className="top-trains">
            <h3>Top 5 Trenuri Cele Mai Căutate</h3>
            <div className="trains-list">
              {stats.topTrains?.map((train, index) => (
                <div key={index} className="train-item">
                  <div className="train-number">{train.trainNumber}</div>
                  <div className="train-route">{train.route}</div>
                  <div className="train-stats">
                    <span>📋 {train.bookings} rezervări</span>
                    <span>👥 {train.passengers} pasageri</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="dashboard-content">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Număr Rezervare</th>
                  <th>Tren</th>
                  <th>Utilizator</th>
                  <th>Pasageri</th>
                  <th>Preț Total</th>
                  <th>Status</th>
                  <th>Status Plată</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.bookingNumber}</td>
                    <td>
                      {booking.train?.trainNumber || 'N/A'}
                      <br />
                      <small>{booking.trainSnapshot?.from || 'N/A'} - {booking.trainSnapshot?.to || 'N/A'}</small>
                    </td>
                    <td>
                      {booking.userId?.firstName} {booking.userId?.lastName}
                      <br />
                      <small>{booking.userId?.email}</small>
                    </td>
                    <td>{booking.passengers?.length || 0}</td>
                    <td>{formatCurrency(booking.totalPrice || 0)}</td>
                    <td>
                      <span className={`status-badge ${booking.status === 'confirmata' ? 'confirmed' : 'cancelled'}`}>
                        {booking.status === 'confirmata' ? 'Confirmată' : 'Anulată'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${booking.paymentStatus === 'finalizat' ? 'completed' : 'refunded'}`}>
                        {booking.paymentStatus === 'finalizat' ? 'Finalizat' : booking.paymentStatus === 'rambursat' ? 'Rambursat' : booking.paymentStatus}
                      </span>
                    </td>
                    <td>{formatDate(booking.bookingDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(bookingsPagination, bookingsPage, setBookingsPage)}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="dashboard-content">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nume</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Rol</th>
                  <th>Data Înregistrării</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id || user._id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <span className={`role-badge ${user.role === 'administrator' ? 'admin' : 'user'}`}>
                        {user.role === 'administrator' ? 'Administrator' : 'Utilizator'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(usersPagination, usersPage, setUsersPage)}
        </div>
      )}

      {activeTab === 'trains' && (
        <div className="dashboard-content">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Număr Tren</th>
                  <th>Tip</th>
                  <th>Rută</th>
                  <th>Ora Plecare</th>
                  <th>Ora Sosire</th>
                  <th>Preț</th>
                  <th>Locuri Totale</th>
                </tr>
              </thead>
              <tbody>
                {trains.map((train) => (
                  <tr key={train._id}>
                    <td>{train.trainNumber}</td>
                    <td>{train.type}</td>
                    <td>
                      {train.from?.name || 'N/A'} - {train.to?.name || 'N/A'}
                    </td>
                    <td>{formatTime(train.departureTime)}</td>
                    <td>{formatTime(train.arrivalTime)}</td>
                    <td>{formatCurrency(train.price || 0)}</td>
                    <td>{train.totalSeats || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(trainsPagination, trainsPage, setTrainsPage)}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

