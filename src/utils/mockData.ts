
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
  hireDate?: string;
  sapNumber?: string;
  department?: string;
  position?: string;
}

export interface Equipment {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  type: 'computer' | 'smartphone' | 'headset' | 'tablet';
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned';
  assignedUser: string | null;
  location: string;
  acquisitionDate: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  equipmentId: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplier: string;
  totalAmount: number;
  fileUrl?: string;
  fileName?: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    hireDate: '2022-03-15',
    sapNumber: 'SAP001',
    department: 'IT Department',
    position: 'IT Manager'
  },
  {
    id: '2',
    name: 'Viewer User',
    email: 'viewer@example.com',
    role: 'viewer',
    hireDate: '2023-01-10',
    sapNumber: 'SAP002',
    department: 'Marketing',
    position: 'Marketing Analyst'
  },
  {
    id: '3',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'viewer',
    hireDate: '2022-06-05',
    sapNumber: 'SAP003',
    department: 'Finance',
    position: 'Finance Analyst'
  },
  {
    id: '4',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'viewer',
    hireDate: '2023-02-15',
    sapNumber: 'SAP004',
    department: 'HR',
    position: 'HR Specialist'
  }
];

// Mock Equipment
export const mockEquipment: Equipment[] = [
  {
    id: '1',
    brand: 'Dell',
    model: 'XPS 15',
    serialNumber: 'DELL12345678',
    type: 'computer',
    status: 'active',
    assignedUser: '1',
    location: 'Headquarters',
    acquisitionDate: '2023-04-15',
    notes: 'High-performance laptop for development',
  },
  {
    id: '2',
    brand: 'HP',
    model: 'EliteBook 840',
    serialNumber: 'HP87654321',
    type: 'computer',
    status: 'active',
    assignedUser: '2',
    location: 'Branch Office',
    acquisitionDate: '2023-02-10',
  },
  {
    id: '3',
    brand: 'Apple',
    model: 'MacBook Pro 16',
    serialNumber: 'APPL9876543',
    type: 'computer',
    status: 'maintenance',
    assignedUser: null,
    location: 'IT Department',
    acquisitionDate: '2022-11-05',
    notes: 'Under repair - screen issue',
  },
  {
    id: '4',
    brand: 'Lenovo',
    model: 'ThinkPad T480',
    serialNumber: 'LEN45678901',
    type: 'computer',
    status: 'inactive',
    assignedUser: null,
    location: 'Storage',
    acquisitionDate: '2021-08-22',
  },
  {
    id: '5',
    brand: 'Microsoft',
    model: 'Surface Pro 8',
    serialNumber: 'MS12398765',
    type: 'tablet',
    status: 'active',
    assignedUser: '3',
    location: 'Marketing Department',
    acquisitionDate: '2023-01-18',
  },
  {
    id: '6',
    brand: 'Samsung',
    model: 'Galaxy S22',
    serialNumber: 'SAM2022001',
    type: 'smartphone',
    status: 'active',
    assignedUser: '1',
    location: 'Headquarters',
    acquisitionDate: '2023-05-20',
  },
  {
    id: '7',
    brand: 'Apple',
    model: 'iPhone 13',
    serialNumber: 'APL13PRO01',
    type: 'smartphone',
    status: 'active',
    assignedUser: '2',
    location: 'Branch Office',
    acquisitionDate: '2022-09-15',
  },
  {
    id: '8',
    brand: 'Jabra',
    model: 'Evolve 75',
    serialNumber: 'JBR75001',
    type: 'headset',
    status: 'active',
    assignedUser: '1',
    location: 'Headquarters',
    acquisitionDate: '2023-03-10',
  },
  {
    id: '9',
    brand: 'Sony',
    model: 'WH-1000XM4',
    serialNumber: 'SNY1000XM4',
    type: 'headset',
    status: 'active',
    assignedUser: '3',
    location: 'Marketing Department',
    acquisitionDate: '2023-02-05',
  },
  {
    id: '10',
    brand: 'Apple',
    model: 'iPad Pro 12.9',
    serialNumber: 'IPAD129001',
    type: 'tablet',
    status: 'active',
    assignedUser: '4',
    location: 'HR Department',
    acquisitionDate: '2022-12-10',
  }
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    equipmentId: '1',
    invoiceNumber: 'INV-2023-001',
    invoiceDate: '2023-04-10',
    supplier: 'Dell Technologies',
    totalAmount: 1899.99,
    fileName: 'dell_invoice_xps15.pdf'
  },
  {
    id: '2',
    equipmentId: '2',
    invoiceNumber: 'INV-2023-002',
    invoiceDate: '2023-02-05',
    supplier: 'HP Inc.',
    totalAmount: 1349.50,
    fileName: 'hp_invoice_elitebook.pdf'
  },
  {
    id: '3',
    equipmentId: '3',
    invoiceNumber: 'INV-2022-156',
    invoiceDate: '2022-11-01',
    supplier: 'Apple Store',
    totalAmount: 2499.00,
    fileName: 'apple_invoice_macbook.pdf'
  },
  {
    id: '4',
    equipmentId: '4',
    invoiceNumber: 'INV-2021-089',
    invoiceDate: '2021-08-15',
    supplier: 'Lenovo',
    totalAmount: 1199.00,
    fileName: 'lenovo_invoice_thinkpad.pdf'
  },
  {
    id: '5',
    equipmentId: '5',
    invoiceNumber: 'INV-2023-010',
    invoiceDate: '2023-01-15',
    supplier: 'Microsoft Store',
    totalAmount: 1599.00,
    fileName: 'microsoft_invoice_surface.pdf'
  }
];

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

// Helper function to get equipment by ID
export const getEquipmentById = (id: string): Equipment | undefined => {
  return mockEquipment.find(equipment => equipment.id === id);
};

// Helper function to get invoices for equipment
export const getInvoicesForEquipment = (equipmentId: string): Invoice[] => {
  return mockInvoices.filter(invoice => invoice.equipmentId === equipmentId);
};

// Helper function to get all equipment for a user
export const getEquipmentForUser = (userId: string): Equipment[] => {
  return mockEquipment.filter(equipment => equipment.assignedUser === userId);
};
