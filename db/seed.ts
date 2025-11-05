import { db } from './index';
import {
  customers,
  salesOrders,
  salesOrderItems,
  workOrders,
  productionStageHistory,
  qualityInspections,
  userRoles
} from './schema';
import { nanoid } from 'nanoid';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await db.delete(qualityInspections);
    await db.delete(productionStageHistory);
    await db.delete(workOrders);
    await db.delete(salesOrderItems);
    await db.delete(salesOrders);
    await db.delete(userRoles);
    await db.delete(customers);
    console.log('✅ Cleared existing data');
    // Insert sample customers
    console.log('📝 Inserting customers...');
    const sampleCustomers = [
      {
        id: nanoid(),
        name: 'Fashion Forward Ltd',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@fashionforward.com',
        phone: '+1-555-0101',
        address: '123 Fashion Ave, New York, NY 10001',
        shippingAddress: '123 Fashion Ave, New York, NY 10001',
        status: 'active' as const,
        totalOrders: 5,
        totalValue: '125000.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'Elite Garments Co',
        contactPerson: 'Michael Chen',
        email: 'michael@elitegarments.com',
        phone: '+1-555-0102',
        address: '456 textile Rd, Los Angeles, CA 90001',
        shippingAddress: '456 textile Rd, Los Angeles, CA 90001',
        status: 'active' as const,
        totalOrders: 3,
        totalValue: '87000.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'TrendSetters Inc',
        contactPerson: 'Emma Wilson',
        email: 'emma@trendsetters.com',
        phone: '+1-555-0103',
        address: '789 Style Blvd, Chicago, IL 60601',
        shippingAddress: '789 Style Blvd, Chicago, IL 60601',
        status: 'prospect' as const,
        totalOrders: 0,
        totalValue: '0.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await db.insert(customers).values(sampleCustomers);
    console.log(`✅ Inserted ${sampleCustomers.length} customers`);

    // Insert sample user roles
    console.log('👥 Inserting user roles...');
    const sampleUserRoles = [
      {
        id: nanoid(),
        userId: 'admin-user-1',
        role: 'admin',
        permissions: JSON.stringify({ all: true }),
        isActive: true,
        assignedBy: 'system',
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        userId: 'pm-user-1',
        role: 'production-manager',
        permissions: JSON.stringify({
          sales_orders: ['read', 'write'],
          work_orders: ['read', 'write'],
          customers: ['read'],
          quality_control: ['read']
        }),
        isActive: true,
        assignedBy: 'admin-user-1',
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        userId: 'qc-user-1',
        role: 'quality-inspector',
        permissions: JSON.stringify({
          work_orders: ['read'],
          quality_control: ['read', 'write'],
          customers: ['read']
        }),
        isActive: true,
        assignedBy: 'admin-user-1',
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await db.insert(userRoles).values(sampleUserRoles);
    console.log(`✅ Inserted ${sampleUserRoles.length} user roles`);

    // Insert sample sales orders
    console.log('📋 Inserting sales orders...');
    const sampleSalesOrders = [
      {
        id: nanoid(),
        orderNumber: 'SO-2024-001',
        customerId: sampleCustomers[0].id,
        orderDate: new Date('2024-01-15'),
        targetDeliveryDate: new Date('2024-03-15'),
        actualDeliveryDate: null,
        status: 'approve' as const,
        totalAmount: '25000.00',
        notes: 'Spring collection order',
        createdBy: 'pm-user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        orderNumber: 'SO-2024-002',
        customerId: sampleCustomers[1].id,
        orderDate: new Date('2024-02-01'),
        targetDeliveryDate: new Date('2024-04-01'),
        actualDeliveryDate: null,
        status: 'draft' as const,
        totalAmount: '18000.00',
        notes: 'Summer collection preview',
        createdBy: 'pm-user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await db.insert(salesOrders).values(sampleSalesOrders);
    console.log(`✅ Inserted ${sampleSalesOrders.length} sales orders`);

    // Insert sample sales order items
    console.log('👕 Inserting sales order items...');
    const sampleOrderItems = [
      {
        id: nanoid(),
        salesOrderId: sampleSalesOrders[0].id,
        productName: 'Cotton T-Shirt',
        quantity: 500,
        size: 'M,L,XL',
        color: 'White, Black, Navy',
        designFileUrl: 'https://example.com/designs/tshirt-001.pdf',
        unitPrice: '12.50',
        totalPrice: '6250.00',
        specifications: JSON.stringify({ material: '100% cotton', weight: '180gsm', fit: 'regular' }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        salesOrderId: sampleSalesOrders[0].id,
        productName: 'Denim Jeans',
        quantity: 300,
        size: '30,32,34',
        color: 'Blue',
        designFileUrl: 'https://example.com/designs/jeans-001.pdf',
        unitPrice: '45.00',
        totalPrice: '13500.00',
        specifications: JSON.stringify({ material: '98% cotton, 2% elastane', weight: '320gsm', style: 'slim fit' }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        salesOrderId: sampleSalesOrders[1].id,
        productName: 'Polo Shirt',
        quantity: 200,
        size: 'S,M,L,XL',
        color: 'Red, White, Blue',
        designFileUrl: 'https://example.com/designs/polo-001.pdf',
        unitPrice: '18.00',
        totalPrice: '3600.00',
        specifications: JSON.stringify({ material: '100% pique cotton', weight: '200gsm', fit: 'classic' }),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await db.insert(salesOrderItems).values(sampleOrderItems);
    console.log(`✅ Inserted ${sampleOrderItems.length} sales order items`);

    // Insert sample work orders
    console.log('🏭 Inserting work orders...');
    const sampleWorkOrders = [
      {
        id: nanoid(),
        workOrderNumber: 'WO-2024-001',
        salesOrderId: sampleSalesOrders[0].id,
        salesOrderItemId: sampleOrderItems[0].id,
        currentStage: 'sewing_assembly' as const,
        startedAt: new Date('2024-01-20'),
        completedAt: null,
        estimatedCompletion: new Date('2024-02-25'),
        priority: 8,
        assignedTo: 'worker-1',
        createdBy: 'pm-user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        workOrderNumber: 'WO-2024-002',
        salesOrderId: sampleSalesOrders[0].id,
        salesOrderItemId: sampleOrderItems[1].id,
        currentStage: 'cutting' as const,
        startedAt: new Date('2024-01-22'),
        completedAt: null,
        estimatedCompletion: new Date('2024-03-01'),
        priority: 7,
        assignedTo: 'worker-2',
        createdBy: 'pm-user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await db.insert(workOrders).values(sampleWorkOrders);
    console.log(`✅ Inserted ${sampleWorkOrders.length} work orders`);

    // Insert sample production stage history
    console.log('📊 Inserting production stage history...');
    const sampleStageHistory = [
      {
        id: nanoid(),
        workOrderId: sampleWorkOrders[0].id,
        stage: 'order_processing' as const,
        startedAt: new Date('2024-01-20'),
        completedAt: new Date('2024-01-21'),
        duration: 1440, // 24 hours in minutes
        notes: 'Order verified and materials planned',
        userId: 'pm-user-1',
        createdAt: new Date(),
      },
      {
        id: nanoid(),
        workOrderId: sampleWorkOrders[0].id,
        stage: 'material_procurement' as const,
        startedAt: new Date('2024-01-21'),
        completedAt: new Date('2024-01-25'),
        duration: 5760, // 4 days in minutes
        notes: 'All materials received and quality checked',
        userId: 'pm-user-1',
        createdAt: new Date(),
      },
      {
        id: nanoid(),
        workOrderId: sampleWorkOrders[0].id,
        stage: 'cutting' as const,
        startedAt: new Date('2024-01-25'),
        completedAt: new Date('2024-02-01'),
        duration: 10080, // 7 days in minutes
        notes: 'Cutting completed with 98% yield',
        userId: 'worker-1',
        createdAt: new Date(),
      },
      {
        id: nanoid(),
        workOrderId: sampleWorkOrders[0].id,
        stage: 'sewing_assembly' as const,
        startedAt: new Date('2024-02-01'),
        completedAt: null,
        duration: null,
        notes: 'Currently in progress - 60% complete',
        userId: 'worker-1',
        createdAt: new Date(),
      }
    ];

    await db.insert(productionStageHistory).values(sampleStageHistory);
    console.log(`✅ Inserted ${sampleStageHistory.length} production stage history records`);

    // Insert sample quality inspections
    console.log('🔍 Inserting quality inspections...');
    const sampleQualityInspections = [
      {
        id: nanoid(),
        workOrderId: sampleWorkOrders[0].id,
        stage: 'cutting' as const,
        status: 'pass' as const,
        inspectedBy: 'qc-user-1',
        inspectionDate: new Date('2024-02-01'),
        issues: JSON.stringify([]),
        repairNotes: null,
        reinspectionDate: null,
        finalStatus: 'pass' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await db.insert(qualityInspections).values(sampleQualityInspections);
    console.log(`✅ Inserted ${sampleQualityInspections.length} quality inspections`);

    console.log('🎉 Database seeding completed successfully!');

    // Summary
    console.log('\n📈 Seeding Summary:');
    console.log(`   • Customers: ${sampleCustomers.length}`);
    console.log(`   • User Roles: ${sampleUserRoles.length}`);
    console.log(`   • Sales Orders: ${sampleSalesOrders.length}`);
    console.log(`   • Sales Order Items: ${sampleOrderItems.length}`);
    console.log(`   • Work Orders: ${sampleWorkOrders.length}`);
    console.log(`   • Production Stage History: ${sampleStageHistory.length}`);
    console.log(`   • Quality Inspections: ${sampleQualityInspections.length}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed function
seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});