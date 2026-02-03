import React from 'react';
import type { ShopItem } from '../ui/shopCards';
import type { OrderPackage } from '../order/sidebarOrder';

export interface OrderDetailsProps {
    item: ShopItem;
    orderPackage: OrderPackage;
    quantity: number;
    subtotal: number;
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const OrderDetails: React.FC<OrderDetailsProps> = ({ item, orderPackage, quantity, subtotal }) => {
    return (
        <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Order details</h2>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex gap-4 items-center">
                <div className="h-20 w-32 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    <img src={item.imageSrc} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate" title={item.title}>
                        {item.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {orderPackage.title}
                        </span>
                        {orderPackage.deliveryLabel && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                {orderPackage.deliveryLabel}
                            </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {quantity} {quantity === 1 ? 'order' : 'orders'}
                        </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                        {orderPackage.shortDescription}
                    </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {formatCurrency(subtotal)}
                </p>
            </div>
        </section>
    );
};

export default OrderDetails;
