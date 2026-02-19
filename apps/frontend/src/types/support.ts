// Support request types
export interface SupportRequest {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    category: 'SHOPPING' | 'PAYMENT' | 'EVENT' | 'ACCOUNT' | 'TECHNICAL';
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    createdAt: string;
    resolvedAt?: string;
    adminResponse?: string;
}

// FAQ types
export interface FAQItem {
    id: number;
    question: string;
    answer: string;
    category: 'SHOPPING' | 'PAYMENT' | 'EVENT' | 'ACCOUNT' | 'REFUND';
}

// Guide types
export interface Guide {
    id: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    image?: string;
    category: string;
}

// Order status for tracking
export interface OrderStatus {
    orderId: string;
    email: string;
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    total: number;
    createdAt: string;
    timeline: Array<{
        status: string;
        timestamp: string;
        description: string;
    }>;
}
