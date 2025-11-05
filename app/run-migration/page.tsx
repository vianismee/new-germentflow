'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

export default function RunMigrationPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleRunMigration = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const migrationResult = await response.json()
      setResult(migrationResult)
    } catch (error) {
      console.error('Migration failed:', error)

      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Data Migration</CardTitle>
            <CardDescription>
              Migrate WO-2025-022 data from data-system-v1 to the current system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Migration Status */}
            <div className="text-center">
              {isRunning ? (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-lg font-medium">Running migration...</span>
                </div>
              ) : result ? (
                <div className="flex items-center justify-center gap-2">
                  {result.success ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div className="text-lg font-medium text-green-600">Migration Completed</div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                      <div className="text-lg font-medium text-red-600">Migration Failed</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">Ready to run migration</div>
              )}
            </div>

            {/* Migration Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Migration Details:</h3>
              <div className="space-y-1 text-sm">
                <div><strong>Customer:</strong> Bapak Riza (contact: Riza)</div>
                <div><strong>Sales Order:</strong> SO-2025-021</div>
                <div><strong>Work Order:</strong> WO-2025-022</div>
                <div><strong>Products:</strong> Jersey (5XL, Hitam) × 5, Jersey Longsleeve (5XL, Putih) × 5</div>
                <div><strong>Current Stage:</strong> Cutting</div>
                <div><strong>QC Result:</strong> 100 passed, 0 repaired, 0 rejected</div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button
                onClick={handleRunMigration}
                disabled={isRunning}
                size="lg"
                className="px-8"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Migration...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Run Migration
                  </>
                )}
              </Button>
            </div>

            {/* Result Display */}
            {result && (
              <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h4 className={`font-medium mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? '✅ Migration Successful!' : '❌ Migration Failed'}
                </h4>

                {result.success && result.data && (
                  <div className="space-y-2 text-sm">
                    <div><strong>Customer ID:</strong> {result.data.customerId}</div>
                    <div><strong>Sales Order ID:</strong> {result.data.salesOrderId}</div>
                    <div><strong>Work Order ID:</strong> {result.data.workOrderId}</div>
                    <div><strong>Inspection ID:</strong> {result.data.inspectionId}</div>
                    <div><strong>Total Items:</strong> {result.data.itemCount}</div>
                    <div><strong>Total Quantity:</strong> {result.data.totalQuantity}</div>
                    <div><strong>Current Stage:</strong> {result.data.summary.currentStage}</div>
                    <div><strong>QC Result:</strong> {result.data.summary.qcResult}</div>
                  </div>
                )}

                {!result.success && result.error && (
                  <div className="text-sm text-red-700">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            )}

            {/* Next Steps */}
            {result?.success && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">✅ What to check next:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Go to <strong>Customers</strong> page → Check "Bapak Riza"</li>
                  <li>• Go to <strong>Sales Orders</strong> page → Find "SO-2025-021"</li>
                  <li>• Go to <strong>Work Orders</strong> page → View "WO-2025-022"</li>
                  <li>• Go to <strong>Quality Control</strong> page → Check inspection record</li>
                  <li>• Go to <strong>Debug → Quality Control</strong> → Verify all data</li>
                  <li>• Test workflow: Advance work order to sewing_assembly stage</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}