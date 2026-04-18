import React, { useState, useEffect } from 'react'
import {
  Box,
  H2,
  H4,
  Text,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@adminjs/design-system'

const formatMoney = (value) => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const StatCard = ({ title, value }) => (
  <Box
    variant="white"
    p="xl"
    borderRadius="lg"
    boxShadow="card"
    width="220px"
    minHeight="120px"
  >
    <Text fontSize="sm" color="grey60">{title}</Text>
    <H2 mt="default">{value}</H2>
  </Box>
)

const Dashboard = (props) => {
  const initialData = props?.data || props?.dashboard || props?.dashboardData || null
  const [data, setData] = useState(initialData)

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      if (initialData) return

      try {
        const response = await fetch('/admin/api/dashboard')
        if (!response.ok) return
        const payload = await response.json()

        if (active) {
          setData(payload?.data || payload || null)
        }
      } catch (error) {
        console.error('Dashboard fetch failed:', error)
      }
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [initialData])

  if (!data) {
    return (
      <Box variant="grey" p="xxl">
        <H2>Dashboard</H2>
        <Text mt="lg">No data available yet.</Text>
      </Box>
    )
  }

  if (data.role === 'admin') {
    return (
      <Box variant="grey" p="xxl">
        <H2>Admin Dashboard</H2>
        <Text mt="default" mb="xl">System overview and recent orders.</Text>

        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(220px, 220px))"
          gap="lg"
          mb="xl"
        >
          <StatCard title="Total Users" value={data.stats.totalUsers} />
          <StatCard title="Total Categories" value={data.stats.totalCategories} />
          <StatCard title="Total Orders" value={data.stats.totalOrders} />
          <StatCard title="Total Products" value={data.stats.totalProducts} />
          <StatCard title="Revenue" value={formatMoney(data.stats.revenue)} />
        </Box>

        <Box variant="white" p="xl" borderRadius="lg" boxShadow="card">
          <H4>Recent Orders</H4>
          <Table mt="lg">
            <TableHead>
              <TableRow>
                <TableCell><b>Order</b></TableCell>
                <TableCell><b>Customer</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Total</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data.recentOrders || []).map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.user?.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'delivered' ? 'success' : 'info'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatMoney(order.totalAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    )
  }

  return (
    <Box variant="grey" p="xxl">
      <H2>Welcome back, {data.name || 'User'}</H2>
      <Text mt="default" mb="xl">Here is your recent account activity.</Text>

       <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(220px, 220px))"
          gap="lg"
          mb="xl"
        >
        <StatCard title="Total Spent" value={formatMoney(data.totalSpent)} />
        <StatCard title="Total Orders" value={Number(data.totalOrders || 0)} />
      </Box>

      <Box variant="white" p="xl" borderRadius="lg" boxShadow="card">
        <H4>Recent Orders</H4>
        <Table mt="lg">
          <TableHead>
            <TableRow>
              <TableCell><b>Order</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Total</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data.orders || []).map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{formatMoney(order.totalAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}

export default Dashboard
