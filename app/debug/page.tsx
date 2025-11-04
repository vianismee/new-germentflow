'use client'

import { useState, useEffect } from 'react'
import { debugSalesOrdersAndWorkOrders, getApprovedSalesOrdersForWorkOrders, getWorkOrders } from '@/lib/actions/work-orders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [debugData, setDebugData] = useState<any>(null)
  const [approvedOrders, setApprovedOrders] = useState<any>(null)
  const [workOrders, setWorkOrders] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleDebug = async () => {
    setLoading(true)
    try {
      const result = await debugSalesOrdersAndWorkOrders()
      setDebugData(result)
    } catch (error) {
      console.error('Debug error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprovedOrders = async () => {
    setLoading(true)
    try {
      const result = await getApprovedSalesOrdersForWorkOrders()
      setApprovedOrders(result)
    } catch (error) {
      console.error('Approved orders error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkOrders = async () => {
    setLoading(true)
    try {
      const result = await getWorkOrders()
      setWorkOrders(result)
    } catch (error) {
      console.error('Work orders error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Work Orders</h1>

      <div className="space-y-4 mb-6">
        <Button onClick={handleDebug} disabled={loading}>
          {loading ? 'Loading...' : 'Debug All Data'}
        </Button>
        <Button onClick={handleApprovedOrders} disabled={loading} variant="outline">
          {loading ? 'Loading...' : 'Check Approved Orders'}
        </Button>
        <Button onClick={handleWorkOrders} disabled={loading} variant="outline">
          {loading ? 'Loading...' : 'Check Work Orders'}
        </Button>
      </div>

      {debugData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Debug Data</CardTitle>
            <CardDescription>Raw data from database</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {approvedOrders && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Approved Orders Available for Work Orders</CardTitle>
            <CardDescription>Orders that can be converted to work orders</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
              {JSON.stringify(approvedOrders, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {workOrders && (
        <Card>
          <CardHeader>
            <CardTitle>All Work Orders</CardTitle>
            <CardDescription>Existing work orders in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
              {JSON.stringify(workOrders, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}