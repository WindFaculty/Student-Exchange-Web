import React from 'react';
import { Card } from '../ui/Card';

interface ListingProduct {
    id: string;
    name: string;
    price: number;
    quantity: number;
    images: string[];
    category: string;
    condition: string;
}

interface MyListingCardProps {
    product: ListingProduct;
    onEdit?: () => void;
    onDelete?: () => void;
}

const MyListingCard: React.FC<MyListingCardProps> = ({ product, onEdit, onDelete }) => {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Product Image */}
            <div className="aspect-square bg-muted relative">
                <img
                    src={product.images?.[0] || 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                {/* Condition Badge */}
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                    {product.condition === 'New' ? 'Mới 100%' : 'Đã qua sử dụng'}
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">{product.name}</h3>

                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Kho: {product.quantity}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{product.category}</span>
                </div>

                {(onEdit || onDelete) && (
                    <div className="flex gap-2 mt-2">
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                            >
                                Sửa
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/80 transition-colors"
                            >
                                Xóa
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default MyListingCard;
