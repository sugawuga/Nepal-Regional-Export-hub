'use client';

import React, { useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

export default function InquiriesTab({
  inquiries,
}: {
  inquiries: InquiryRow[];
}) {
  const [inquiryQuery, setInquiryQuery] = useState('');

  const filteredInquiries = useMemo(() => {
    const q = inquiryQuery.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter((inquiry) =>
      [
        inquiry.fullName,
        inquiry.email,
        inquiry.phone,
        inquiry.company,
        inquiry.quantity,
        inquiry.message,
        inquiry.regionName,
        inquiry.regionProvince,
        inquiry.productName,
        inquiry.status,
      ].some((value) => value?.toLowerCase().includes(q))
    );
  }, [inquiries, inquiryQuery]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Inquiries</h2>
            <p className="text-stone-500 mt-1">View submitted supply requests from the district pages.</p>
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input value={inquiryQuery} onChange={(e) => setInquiryQuery(e.target.value)} placeholder="Search inquiries" className="w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-4 py-3 outline-none focus:border-emerald-400" />
          </div>
        </div>

        <div className="space-y-4 max-h-[760px] overflow-auto pr-1">
          {filteredInquiries.map((inquiry) => (
            <div key={inquiry._id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-stone-500 text-sm">
                    <MapPin size={14} />
                    <span>{inquiry.regionName}</span>
                    <span className="text-stone-300">&bull;</span>
                    <span>{inquiry.regionProvince}</span>
                    {inquiry.status && <span className="rounded-full bg-white border border-stone-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{inquiry.status}</span>}
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">{inquiry.fullName}</h3>
                  <p className="text-stone-500 mt-2 leading-relaxed">{inquiry.message}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <a href={`mailto:${inquiry.email}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-emerald-300 hover:text-emerald-700">
                    Reply
                  </a>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-stone-600">
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Email</div>
                  <div className="font-medium break-all">{inquiry.email}</div>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Product</div>
                  <div className="font-medium">{inquiry.productName || 'General inquiry'}</div>
                </div>
                {inquiry.phone && (
                  <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Phone</div>
                    <div className="font-medium">{inquiry.phone}</div>
                  </div>
                )}
                {inquiry.company && (
                  <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Company</div>
                    <div className="font-medium">{inquiry.company}</div>
                  </div>
                )}
              </div>

              {inquiry.quantity && (
                <div className="mt-3 text-sm text-stone-500">
                  Quantity: <span className="font-medium text-stone-700">{inquiry.quantity}</span>
                </div>
              )}
            </div>
          ))}
          {filteredInquiries.length === 0 && <div className="text-center text-stone-500 py-12">No inquiries found.</div>}
        </div>
      </div>
    </div>
  );
}
