'use client';

import React, { useState } from 'react';
import InquiryForm from './InquiryForm';
import { X } from 'lucide-react';

type ProductOption = {
  _id?: string;
  slug?: string;
  name: string;
};

type InquiryModalProps = {
  regionId?: string;
  regionName: string;
  regionProvince: string;
  products: ProductOption[];
};

export default function InquiryModal({ regionId, regionName, regionProvince, products }: InquiryModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex px-8 py-4 bg-white text-emerald-800 rounded-2xl font-bold hover:bg-emerald-50 transition-colors"
      >
        Inquire About Supply
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem]">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 z-10 p-2 text-stone-400 hover:text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-2">
              <InquiryForm
                regionId={regionId}
                regionName={regionName}
                regionProvince={regionProvince}
                products={products}
                onSuccess={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
