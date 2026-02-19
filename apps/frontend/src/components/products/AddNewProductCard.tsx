import React from 'react';
import { Card } from '../ui/Card';

interface AddNewProductCardProps {
    onClick: () => void;
}

const AddNewProductCard: React.FC<AddNewProductCardProps> = ({ onClick }) => {
    return (
        <Card
            className="border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-muted/50 cursor-pointer transition-all duration-200 flex items-center justify-center aspect-square"
            onClick={onClick}
        >
            <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
                {/* Plus Icon */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                    >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </div>

                <div>
                    <h3 className="font-semibold text-lg mb-1">Thêm sản phẩm mới</h3>
                    <p className="text-sm text-muted-foreground">Click để đăng bán sản phẩm</p>
                </div>
            </div>
        </Card>
    );
};

export default AddNewProductCard;
