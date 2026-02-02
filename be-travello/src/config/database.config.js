// Simple database configuration for development
let data = {
  users: [],
  chatMessages: [],
  userSessions: [],
  travelKnowledge: []
};

export const db = {
  data,
  async prepare(query) {
    console.log('Mock DB Prepare:', query);
    return {
      run: (...params) => {
        console.log('Mock DB Run with params:', params);
        return { 
          lastID: Math.random().toString(36).substr(2, 9),
          changes: 1
        };
      },
      get: (...params) => {
        console.log('Mock DB Get with params:', params);
        
        // Mock payment methods data
        if (query.includes('payment_methods')) {
          return {
            id: 'credit_card',
            name: 'credit_card',
            display_name: 'Credit Card',
            description: 'Visa, Mastercard, JCB',
            icon: '💳',
            fees: 2.9,
            fixed_fee: 0,
            is_active: 1
          };
        }
        
        // Mock payment data
        if (query.includes('payments')) {
          return {
            id: 'pay_123',
            user_id: 'user_123',
            method: 'credit_card',
            amount: 150000,
            currency: 'IDR',
            description: 'Test payment',
            status: 'completed',
            created_at: new Date().toISOString()
          };
        }
        
        return null;
      },
      all: (...params) => {
        console.log('Mock DB All with params:', params);
        
        // Mock payment methods list
        if (query.includes('payment_methods')) {
          return [
            {
              id: 'credit_card',
              name: 'credit_card',
              display_name: 'Credit Card',
              description: 'Visa, Mastercard, JCB',
              icon: '💳',
              fees: 2.9,
              fixed_fee: 0,
              is_active: 1
            },
            {
              id: 'bank_transfer',
              name: 'bank_transfer',
              display_name: 'Bank Transfer',
              description: 'Transfer to virtual account',
              icon: '🏦',
              fees: 0,
              fixed_fee: 0,
              is_active: 1
            },
            {
              id: 'ewallet',
              name: 'ewallet',
              display_name: 'E-Wallet',
              description: 'GoPay, OVO, Dana, ShopeePay',
              icon: '📱',
              fees: 1.5,
              fixed_fee: 0,
              is_active: 1
            },
            {
              id: 'virtual_account',
              name: 'virtual_account',
              display_name: 'Virtual Account',
              description: 'BCA, BNI, BRI, Mandiri VA',
              icon: '🔢',
              fees: 0,
              fixed_fee: 0,
              is_active: 1
            }
          ];
        }
        
        // Mock payments history
        if (query.includes('payments')) {
          return [
            {
              id: 'pay_001',
              user_id: 'user_123',
              method: 'credit_card',
              amount: 150000,
              currency: 'IDR',
              description: 'Hotel booking',
              status: 'completed',
              created_at: new Date().toISOString()
            },
            {
              id: 'pay_002',
              user_id: 'user_123',
              method: 'ewallet',
              amount: 75000,
              currency: 'IDR',
              description: 'Transport booking',
              status: 'completed',
              created_at: new Date().toISOString()
            }
          ];
        }
        
        return [];
      }
    };
  },
  
  async read() {
    return this.data;
  },
  
  async write(data) {
    this.data = data;
    return true;
  }
};

export async function testConnection() {
  try {
    console.log('Database connection test - using mock database for development');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export async function initDatabase() {
  try {
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}
