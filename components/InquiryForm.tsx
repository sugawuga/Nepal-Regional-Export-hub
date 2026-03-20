'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, Mail, MessageSquare, Phone, Send, User2 } from 'lucide-react';

type ProductOption = {
  _id?: string;
  slug?: string;
  name: string;
};

type InquiryFormProps = {
  regionId?: string;
  regionName: string;
  regionProvince: string;
  products: ProductOption[];
  onSuccess?: () => void;
};

export default function InquiryForm({ regionId, regionName, regionProvince, products, onSuccess }: InquiryFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [quantity, setQuantity] = useState('');
  const [productId, setProductId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((product) => String(product._id || product.slug || product.name) === productId),
    [productId, products]
  );

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regionId,
          productId: selectedProduct?._id,
          regionName,
          regionProvince,
          productName: selectedProduct?.name || '',
          fullName,
          email,
          phone,
          company,
          quantity,
          message,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to submit inquiry');
      }

      setSuccess('Inquiry sent successfully. We will get back to you soon.');
      setFullName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setQuantity('');
      setProductId('');
      setMessage('');
      if (onSuccess) {
        setTimeout(onSuccess, 2000); // Close after 2 seconds on success
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to submit inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="inquiry-form" className="bg-white rounded-[2rem] p-8 md:p-10">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-5">
          <Send size={12} />
          Send Inquiry
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">Request supply information</h2>
        <p className="text-stone-500 mt-3 leading-relaxed">
          Send a direct inquiry for {regionName}. Include a product if you want a specific commodity quote.
        </p>

        {success && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">{success}</div>}
        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        <form onSubmit={submitInquiry} className="mt-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Full name</span>
              <div className="relative">
                <User2 size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 text-black pl-10 pr-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="Your name"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Email</span>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 text-black pl-10 pr-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="you@example.com"
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Phone</span>
              <div className="relative">
                <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 text-black pl-10 pr-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="Optional phone"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Company / organization</span>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 text-black px-4 py-3 outline-none focus:border-emerald-400"
                placeholder="Optional company"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Product</span>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 text-black px-4 py-3 outline-none focus:border-emerald-400"
              >
                <option value="">General region inquiry</option>
                {products.map((product) => (
                  <option key={product._id || product.slug || product.name} value={product._id || product.slug || product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Estimated quantity</span>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 text-black px-4 py-3 outline-none focus:border-emerald-400"
                placeholder="For example: 500 kg or 200 units"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Message</span>
            <div className="relative">
              <MessageSquare size={16} className="pointer-events-none absolute left-4 top-4 text-stone-400" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                 className="w-full rounded-2xl border border-stone-200 bg-stone-50 text-black pl-10 pr-4 py-3 outline-none focus:border-emerald-400"
                placeholder="Tell us what you need, target timeline, and any delivery details"
              />
            </div>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-sm text-stone-500">
              Inquiry will be saved for {regionName}, {regionProvince}.
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-white font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Send Inquiry
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}