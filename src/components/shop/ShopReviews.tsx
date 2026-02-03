import React from 'react';
import { Zap } from 'lucide-react';

const ShopReviews: React.FC = () => {
    return (
        <div className="mt-12 space-y-8 text-sm text-slate-700 max-w-4xl">
            <div className="grid gap-10 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Zap className="mt-1 h-5 w-5 text-slate-900" />
                        <div>
                            <p className="font-semibold text-slate-900">Highly Responsive</p>
                            <p className="text-xs text-slate-500">Known for exceptionally quick replies</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Zap className="mt-1 h-5 w-5 text-slate-900" />
                        <div>
                            <p className="font-semibold text-slate-900">Highly Responsive</p>
                            <p className="text-xs text-slate-500">Known for exceptionally quick replies</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Zap className="mt-1 h-5 w-5 text-slate-900" />
                        <div>
                            <p className="font-semibold text-slate-900">Highly Responsive</p>
                            <p className="text-xs text-slate-500">Known for exceptionally quick replies</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Zap className="mt-1 h-5 w-5 text-slate-900" />
                        <div>
                            <p className="font-semibold text-slate-900">Highly Responsive</p>
                            <p className="text-xs text-slate-500">Known for exceptionally quick replies</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <article className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        Sarah M.
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600">
                        &quot;I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear
                        to elegant dresses, every piece I've bought has exceeded my expectations.&quot;
                    </p>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        Alex K.
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600">
                        &quot;Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co.
                        The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.&quot;
                    </p>
                </article>
            </div>
        </div>
    );
};

export default ShopReviews;
