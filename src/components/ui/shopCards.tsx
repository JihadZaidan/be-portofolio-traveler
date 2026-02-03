import React from 'react';
import { useNavigate } from 'react-router-dom';

export type ShopItem = {
    id: number;
    title: string;
    imageSrc: string;
    price: string;
    deliveryTime?: string;
    serviceCategory?: string;
};

type ShopCardProps = {
    item: ShopItem;
};

export const ShopCard: React.FC<ShopCardProps> = ({ item }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/work/shop/${item.id}`, { state: { item } });
    };

    const parsePrice = (price: string): number => {
        const numeric = Number(price.replace(/[^0-9.]/g, ''));
        return Number.isNaN(numeric) ? 0 : numeric;
    };

    const basePrice = parsePrice(item.price);
    const fromPriceValue = basePrice > 0 ? Math.max(1, Math.round((basePrice / 1000) * 500)) : 0;
    const fromPriceDisplay = fromPriceValue > 0 ? `$${fromPriceValue}` : item.price;

    return (
        <article
            onClick={handleClick}
            className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-150 cursor-pointer overflow-hidden p-4"
        >
            <div className="relative w-full aspect-[3/2]">
                <img
                    src={item.imageSrc}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover rounded-xl"
                />
            </div>

            <div className="flex-1 px-5 pt-4 pb-4 flex flex-col justify-between">
                <p className="text-sm text-slate-900 leading-relaxed">
                    {item.title}
                </p>

                <div className="mt-4 flex items-baseline gap-1 text-slate-900">
                    <span className="text-xs text-slate-500">From</span>
                    <span className="text-xl font-semibold">{fromPriceDisplay}</span>
                </div>
            </div>
        </article>
    );
};
