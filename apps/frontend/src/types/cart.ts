export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    sellerId?: string;
}

export interface BuyerInfo {
    name: string;
    phone: string;
    address: string;
}

export interface Order {
    orderId: string;
    items: CartItem[];
    total: number;
    buyerInfo: BuyerInfo;
    paymentMethod: 'COD' | 'ESCROW';
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
    createdAt: string;
}
