import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { BillingRow } from "./types";

interface PatientData {
  name: string;
  phone: string;
  address: string;
  plan: string;
  billing: Record<string, BillingRow>;
  totals: { retail: number; owe: number };
  finalOwe: number;
  payMethod: string;
  checkNum: string;
}

interface ReceiptItem {
  id: number;
  code: string;
  desc: string;
  qty: number;
  price: number;
}

interface ReceiptPageProps {
  patientData: PatientData;
}

// Get V-Code based on item
const getVCode = (label: string): string => {
  const l = label.toUpperCase();
  if (l.includes("FRAME")) return "V2020";
  if (l.includes("SINGLE VISION") || l.includes("SV ") || l.includes("PLANO"))
    return "V2100";
  if (
    l.includes("BIFOCAL") ||
    l.includes("FT-28") ||
    l.includes("FT-35") ||
    l.includes("BIF")
  )
    return "V2200";
  if (l.includes("TRIFOCAL") || l.includes("TRIF")) return "V2300";
  if (l.includes("PROGRESSIVE") || l.includes("PROG") || l.includes("VARILUX"))
    return "V2410";
  if (l.includes("TRANSITIONS") || l.includes("TRANS")) return "V2744";
  if (l.includes("TINT")) return "V2745";
  if (
    l.includes("ANTI-REFLECTIVE") ||
    l.includes("A/R") ||
    l.includes("AR COAT") ||
    l.includes("GLARE")
  )
    return "V2750";
  if (l.includes("POLARIZED") || l.includes("POLAR")) return "V2762";
  if (l.includes("POLYCARBONATE") || l.includes("POLY")) return "V2784";
  return "V2799";
};

export function ReceiptPage({ patientData }: ReceiptPageProps) {
  const [items, setItems] = useState<ReceiptItem[]>(() => {
    return Object.values(patientData.billing)
      .filter((b) => b.retail && parseFloat(b.retail) > 0)
      .map((b, idx) => ({
        id: idx,
        code: getVCode(b.label),
        desc: b.label,
        qty: 1,
        price: parseFloat(b.retail),
      }));
  });
  const [patAddress, setPatAddress] = useState<string>(
    patientData.address || "",
  );

  const handleItemChange = (
    id: number,
    field: keyof ReceiptItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    const newId =
      items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 0;
    setItems([
      ...items,
      { id: newId, code: "", desc: "NEW ITEM", qty: 1, price: 0 },
    ]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = subtotal * 0.06;
  const grandTotal = subtotal + tax;
  const patientOwes = patientData.finalOwe;
  const insuranceDiscount =
    grandTotal > patientOwes ? grandTotal - patientOwes : 0;
  const amtPaid = patientOwes;
  const balance = patientOwes - amtPaid;

  return (
    <>
      <style>{`
        @media print {
          @page { size: portrait; margin: 0.5in; }
          body * { visibility: hidden; }
          .receipt-content-wrapper, .receipt-content-wrapper * { visibility: visible !important; }
          .receipt-content-wrapper { position: fixed !important; left: 0 !important; top: 0 !important; width: 100vw !important; height: 100vh !important; background: white !important; color: black !important; }
          .receipt-content-wrapper * { color: black !important; border-color: black !important; }
          input, textarea { border: none !important; background: transparent !important; }
          .print\\:hidden, .print\\:hidden * { display: none !important; }
        }
      `}</style>
      <div className="receipt-content-wrapper max-w-3xl mx-auto border-2 border-black p-10 bg-white shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-5 mb-5">
          <div className="space-y-1">
            <h1 className="text-3xl font-black italic text-black uppercase">
              Pal Optical
            </h1>
            <p className="text-sm font-bold text-black">
              1555 E New Circle Rd, Suite 146
            </p>
            <p className="text-sm font-bold text-black">Lexington, KY 40509</p>
            <p className="text-sm font-bold text-black">
              Phone: (859) 266-3003
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-slate-300 italic">
              RECEIPT
            </h2>
            <p className="font-bold text-black">
              DATE: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-200 mb-2">
              Patient Info
            </h3>
            <div className="font-black text-sm uppercase text-black">
              {patientData.name}
            </div>
            <div className="font-bold text-sm text-black">
              {patientData.phone}
            </div>
            <textarea
              className="w-full mt-2 text-sm font-bold bg-transparent border border-dashed border-slate-300 p-2 resize-none outline-none text-black print:border-none"
              placeholder="Enter Patient Address..."
              value={patAddress}
              onChange={(e) => setPatAddress(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-200 mb-2">
              Insurance Plan
            </h3>
            <p className="font-black text-sm uppercase text-black">
              {patientData.plan}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full text-sm mb-6 text-black">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2 font-black uppercase">Code</th>
              <th className="text-left py-2 font-black uppercase">
                Description
              </th>
              <th className="text-right py-2 font-black uppercase w-16">Qty</th>
              <th className="text-right py-2 font-black uppercase w-24">
                Price
              </th>
              <th className="text-right py-2 font-black uppercase w-24">
                Total
              </th>
              <th className="print:hidden w-8"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-3">
                  <input
                    className="bg-transparent border-none outline-none font-bold w-20 uppercase text-black"
                    value={item.code}
                    onChange={(e) =>
                      handleItemChange(item.id, "code", e.target.value)
                    }
                  />
                </td>
                <td className="py-3">
                  <input
                    className="bg-transparent border-none outline-none font-bold w-full uppercase text-black"
                    value={item.desc}
                    onChange={(e) =>
                      handleItemChange(item.id, "desc", e.target.value)
                    }
                  />
                </td>
                <td className="py-3 text-right">
                  <input
                    type="number"
                    className="bg-transparent border-none outline-none font-bold w-full text-right text-black"
                    value={item.qty}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "qty",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </td>
                <td className="py-3 text-right">
                  <input
                    type="number"
                    className="bg-transparent border-none outline-none font-bold w-full text-right text-black"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "price",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </td>
                <td className="py-3 text-right font-black text-black">
                  ${(item.qty * item.price).toFixed(2)}
                </td>
                <td className="py-3 text-right print:hidden">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Actions */}
        <div className="mb-6 print:hidden">
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-xs uppercase text-black"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Totals */}
        <div className="ml-auto w-72 space-y-2 text-black">
          <div className="flex justify-between font-bold">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Tax (6%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-xl border-t-2 border-black pt-2">
            <span>Grand Total:</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
          {insuranceDiscount > 0 && (
            <div className="flex justify-between font-bold text-red-600 pt-1">
              <span>Insurance Benefits:</span>
              <span>-${insuranceDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-black border-t-2 border-black pt-2 mt-2">
            <span>Patient Total:</span>
            <span>${patientOwes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-green-600 bg-green-50 p-1 px-2 rounded mt-2">
            <span>Paid ({patientData.payMethod}):</span>
            <span>-${amtPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black border-t border-black pt-2 mt-2">
            <span>Balance:</span>
            <span>${balance.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">
            Thank you for choosing Pal Optical!
          </p>
          <button
            onClick={() => window.print()}
            className="mt-6 px-8 py-3 bg-black text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-800 transition-all print:hidden"
          >
            Print Itemized Receipt
          </button>
        </div>
      </div>
    </>
  );
}
