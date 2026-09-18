import React from 'react';
import { DeliveryChallan, Customer, Tractor, ShowroomSettings, Invoice } from '../../types';

interface ChallanRendererProps {
  challan: DeliveryChallan;
  customers: Customer[];
  tractors: Tractor[];
  invoices: Invoice[];
  settings: ShowroomSettings;
  id?: string;
}

const ChallanRenderer: React.FC<ChallanRendererProps> = ({ 
  challan, 
  customers, 
  tractors, 
  invoices,
  settings,
  id = "challan-pdf-content"
}) => {
  const cust = customers.find(c => c.id === challan.customerId);
  const tractor = tractors.find(t => t.id === challan.tractorId);
  const invoice = invoices.find(i => i.id === challan.invoiceId);

  const checklistItems = [
    { key: 'model', label: `Model Name : ${tractor?.modelName || 'N/A'}`, value: 'Yes', qty: 1 },
    { key: 'hitch', label: 'Hitch :', value: challan.checklist.hitch ? 'Yes' : 'No', qty: challan.checklist.hitch ? 1 : 0 },
    { key: 'hood', label: 'Hood Complete :', value: challan.checklist.hood ? 'Yes' : 'No', qty: challan.checklist.hood ? 1 : 0 },
    { key: 'toolKit', label: 'Tool kit :', value: challan.checklist.toolKit ? 'Yes' : 'No', qty: challan.checklist.toolKit ? 1 : 0 },
    { key: 'topLink', label: 'Top Link :', value: challan.checklist.topLink ? 'Yes' : 'No', qty: challan.checklist.topLink ? 1 : 0 },
    { key: 'drawbar', label: 'Drawbar :', value: challan.checklist.drawbar ? 'Yes' : 'No', qty: challan.checklist.drawbar ? 1 : 0 },
    { key: 'frontBumper', label: 'Front Bumper :', value: challan.checklist.frontBumper ? 'Yes' : 'No', qty: challan.checklist.frontBumper ? 1 : 0 },
    { key: 'battery', label: 'Battery :', value: challan.checklist.battery ? 'Yes' : 'No', qty: challan.checklist.battery ? 1 : 0 },
    { key: 'tyres', label: 'Tyres :', value: challan.checklist.tyres ? 'Yes' : 'No', qty: challan.checklist.tyres ? 1 : 0 },
    { key: 'oilLevel', label: 'Oil Level :', value: challan.checklist.oilLevel ? 'Yes' : 'No', qty: challan.checklist.oilLevel ? 1 : 0 },
    { key: 'cultivator', label: 'Cultivator :', value: challan.checklist.cultivator ? 'Yes' : 'No', qty: challan.checklist.cultivator ? 1 : 0 },
  ];

  if (challan.exchangeValue && challan.exchangeValue > 0) {
    checklistItems.push({
      key: 'exchange',
      label: 'Confirmed Exchange Value :',
      value: `₹ ${challan.exchangeValue.toLocaleString()}`,
      qty: 1
    });
  }

  return (
    <div id={id} className="bg-white text-black p-6 sm:p-10 max-w-[950px] mx-auto font-sans text-[11px] leading-tight border border-slate-300 shadow-lg print:shadow-none print:border-none print:p-0">
      <div className="border border-slate-400 p-4">
        {/* Header Section */}
        <div className="flex items-start mb-4">
          <div className="w-32 shrink-0">
            <img src={settings.logoUrl} alt="Logo" className="w-24 h-auto object-contain" />
          </div>
          <div className="flex-1 text-center pr-32">
            <h1 className="text-2xl font-black text-[#4682B4] uppercase mb-1 tracking-tight">{settings.name}</h1>
            <p className="text-[10px] font-bold text-slate-800 mb-0.5">{settings.address}</p>
            <p className="text-[10px] font-bold text-slate-800">Mobile No. - {settings.phone}</p>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="border border-slate-800 rounded-full px-10 py-1.5 font-bold text-xs shadow-sm">
            Delivery Challan
          </div>
        </div>

        {/* Challan Info Row */}
        <div className="border-t border-slate-300 pt-3 flex justify-between font-bold mb-6 px-2">
          <span>Challan No: {challan.challanNo}</span>
          {invoice && <span>Bill No: {invoice.invoiceNo}</span>}
          <span>Date: {new Date(challan.date).toLocaleDateString('en-GB')}</span>
        </div>

        {/* Customer Details Section */}
        <div className="grid grid-cols-12 gap-y-2 mb-6 px-2">
          <div className="col-span-7 space-y-2">
            <div className="flex">
              <span className="font-bold w-20">Name</span>
              <span className="font-bold">: {cust?.name.toUpperCase()}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-20">S/o, W/o</span>
              <span className="font-bold">: {cust?.sog || ''}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-20">Address</span>
              <span className="font-bold">: {cust?.village.toUpperCase()}, {cust?.tehsil.toUpperCase()}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-20">Mobile No</span>
              <span className="font-bold">: {cust?.mobile}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-20">Chassis No</span>
              <span className="font-bold">: {tractor?.chassisNo}</span>
            </div>
          </div>
          <div className="col-span-5 space-y-2 pl-10">
            <div className="flex">
              <span className="font-bold w-16">HYPO</span>
              <span className="font-bold">: {challan.hypo || ''}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-16">Engin No</span>
              <span className="font-bold">: {tractor?.engineNo}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-16">Color</span>
              <span className="font-bold">: {tractor?.color || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <table className="w-full border-collapse border border-slate-800">
          <thead>
            <tr className="font-bold text-[10px]">
              <th className="border border-slate-800 px-2 py-2 text-left w-12">Sr No</th>
              <th className="border border-slate-800 px-4 py-2 text-left">Description</th>
              <th className="border border-slate-800 px-2 py-2 text-center w-24">Status (Yes/No)</th>
              <th className="border border-slate-800 px-2 py-2 text-center w-24">Quantity</th>
              <th className="border border-slate-800 px-2 py-2 text-center w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {checklistItems.map((item, index) => (
              <tr key={item.key} className="text-[10px]">
                <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">{index + 1}</td>
                <td className="border border-slate-800 px-4 py-1.5 font-bold">{item.label}</td>
                <td className="border border-slate-800 px-4 py-1.5 font-bold text-center w-24">{item.value}</td>
                <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">{item.qty}</td>
                <td className="border border-slate-800 px-2 py-1.5 text-right font-bold pr-4">0.00</td>
              </tr>
            ))}
            {/* Empty Row for spacing matching image */}
            <tr>
              <td className="border border-slate-800 px-2 py-4"></td>
              <td className="border border-slate-800 px-2 py-4"></td>
              <td className="border border-slate-800 px-2 py-4"></td>
              <td className="border border-slate-800 px-2 py-4"></td>
              <td className="border border-slate-800 px-2 py-4"></td>
            </tr>
            {/* Total Row */}
            <tr className="font-bold text-[10px]">
              <td className="border border-slate-800 px-2 py-2"></td>
              <td className="border border-slate-800 px-2 py-2 text-right pr-10" colSpan={2}>Total</td>
              <td className="border border-slate-800 px-2 py-2"></td>
              <td className="border border-slate-800 px-2 py-2 text-right pr-4">0.00</td>
            </tr>
          </tbody>
        </table>

        {/* Footer Section */}
        <div className="border border-slate-800 border-t-0 p-0">
          <div className="text-right font-bold py-2 pr-4 border-b border-slate-800 text-[10px]">
            IN WORDS: ONLY
          </div>

          <div className="p-6 pt-10 flex justify-between items-end">
            <div className="space-y-6">
              <p className="font-bold underline text-[10px]">Term & Condtions</p>
              <p className="text-[9px] font-bold">1. Goods once sold will not be taken back.</p>
            </div>
            <div className="text-center space-y-16">
              <div>
                <p className="font-bold text-[10px]">For</p>
                <p className="font-bold uppercase text-[10px]">{settings.name}</p>
              </div>
              <p className="font-bold pt-4 text-[10px] border-t border-slate-300">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallanRenderer;
