import { useState, useMemo } from 'react';
import SEO from '../../components/SEO';
import { 
  Calculator, 
  IndianRupee, 
  PieChart, 
  Info, 
  ArrowRight, 
  Activity, 
  History, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'calculator' | 'interest' | 'records';

export default function GSTCalculator() {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');
  const [amount, setAmount] = useState<string>('50000');
  const [gstRate, setGstRate] = useState<number>(18);
  const [isInclusive, setIsInclusive] = useState<boolean>(false);
  const [supplyType, setSupplyType] = useState<'intra' | 'inter'>('intra');
  const [cessRate, setCessRate] = useState<string>('0');

  // Interest Calculator States
  const [taxLiability, setTaxLiability] = useState<string>('100000');
  const [delayDays, setDelayDays] = useState<string>('30');
  const [interestRate, setInterestRate] = useState<number>(18); // Standard 18% p.a.

  const calcResults = useMemo(() => {
    const principal = parseFloat(amount) || 0;
    const cessPct = parseFloat(cessRate) || 0;
    let netAmount = 0;
    let gstAmount = 0;
    let cessAmount = 0;
    let totalAmount = 0;

    if (isInclusive) {
      // Total = Net + Net * (Rate + Cess) / 100
      // Net = Total / (1 + (Rate + Cess) / 100)
      totalAmount = principal;
      netAmount = totalAmount / (1 + (gstRate + cessPct) / 100);
      gstAmount = (netAmount * gstRate) / 100;
      cessAmount = (netAmount * cessPct) / 100;
    } else {
      netAmount = principal;
      gstAmount = (netAmount * gstRate) / 100;
      cessAmount = (netAmount * cessPct) / 100;
      totalAmount = netAmount + gstAmount + cessAmount;
    }

    return {
      netAmount: netAmount.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      cessAmount: cessAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      cgst: (supplyType === 'intra' ? gstAmount / 2 : 0).toFixed(2),
      sgst: (supplyType === 'intra' ? gstAmount / 2 : 0).toFixed(2),
      igst: (supplyType === 'inter' ? gstAmount : 0).toFixed(2),
    };
  }, [amount, gstRate, isInclusive, supplyType, cessRate]);

  const interestResults = useMemo(() => {
    const liability = parseFloat(taxLiability) || 0;
    const days = parseInt(delayDays) || 0;
    // Interest = (Tax Liability * Rate * No. of days) / (365 * 100)
    const interest = (liability * interestRate * days) / (365 * 100);

    return {
      interest: interest.toFixed(2),
      totalPayable: (liability + interest).toFixed(2)
    };
  }, [taxLiability, delayDays, interestRate]);

  return (
    <div className="max-w-6xl mx-auto py-6">
      <SEO title="GST Interest Calculator | Deccan Filings" description="Calculate your GST late payment interest and liability easily online." />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-dark flex items-center gap-3">
            <div className="bg-brand p-2 rounded-xl">
              <Calculator className="h-7 w-7 text-dark" />
            </div>
            Detailed GST Center
          </h1>
          <p className="text-slate-500 mt-1">Official-grade computation for GST, Interest, and Compliance tracking.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {(['calculator', 'interest'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${
                activeTab === tab ? 'bg-dark text-white shadow-lg' : 'text-slate-500 hover:text-dark'
              }`}
            >
              {tab === 'calculator' ? 'Tax Calculator' : 'Interest Calculator'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'calculator' ? (
          <motion.div 
            key="calc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Controls */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm space-y-8">
                <div>
                  <label className="block text-sm font-bold text-dark mb-3 uppercase tracking-wider">Base Amount (Taxable)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand focus:bg-white outline-none transition-all text-xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div 
                    onClick={() => setIsInclusive(false)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all text-center ${!isInclusive ? 'border-brand bg-brand/5' : 'border-slate-100'}`}
                   >
                     <p className={`text-xs font-bold uppercase ${!isInclusive ? 'text-brand-dark' : 'text-slate-400'}`}>GST Exclusive</p>
                     <p className="text-[10px] text-slate-400 mt-1">Add tax to price</p>
                   </div>
                   <div 
                    onClick={() => setIsInclusive(true)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all text-center ${isInclusive ? 'border-brand bg-brand/5' : 'border-slate-100'}`}
                   >
                     <p className={`text-xs font-bold uppercase ${isInclusive ? 'text-brand-dark' : 'text-slate-400'}`}>GST Inclusive</p>
                     <p className="text-[10px] text-slate-400 mt-1">Tax hidden in price</p>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-dark mb-4">GST Rate Selection</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 5, 12, 18, 28].map((rate) => (
                      <button 
                        key={rate}
                        onClick={() => setGstRate(rate)}
                        className={`py-3 rounded-xl text-xs font-black transition-all border-2 ${
                          gstRate === rate ? 'bg-dark text-white border-dark' : 'bg-white text-slate-500 border-slate-100 hover:border-brand'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-dark mb-4">Supply & Other</label>
                  <div className="space-y-4">
                    <div className="flex bg-slate-50 p-1.5 rounded-xl">
                      <button 
                        onClick={() => setSupplyType('intra')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${supplyType === 'intra' ? 'bg-white shadow-sm text-dark' : 'text-slate-400'}`}
                      >
                        Intra-State (CGST+SGST)
                      </button>
                      <button 
                        onClick={() => setSupplyType('inter')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${supplyType === 'inter' ? 'bg-white shadow-sm text-dark' : 'text-slate-400'}`}
                      >
                        Inter-State (IGST)
                      </button>
                    </div>
                    
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">% Cess</span>
                      <input 
                        type="number"
                        placeholder="Additional Cess %"
                        value={cessRate}
                        onChange={(e) => setCessRate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-dark p-6 rounded-4xl text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2 text-brand">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Compliance Tip</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">Ensure HSN/SAC codes are verified before final billing to avoid mismatch in GST rates.</p>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
              </div>
            </div>

            {/* Results Output */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-10 rounded-4xl border border-slate-100 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="flex items-center justify-between mb-12">
                   <h2 className="text-2xl font-black text-dark tracking-tight leading-none">Computation Results</h2>
                   <div className="p-3 bg-slate-50 rounded-2xl">
                     <PieChart className="h-6 w-6 text-slate-400" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div className="space-y-8">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[2px] mb-3">Net Taxable Value</p>
                        <p className="text-5xl font-black text-dark">₹{calcResults.netAmount}</p>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-slate-500">Gross GST Amount</span>
                            <span className="text-xl font-black text-brand-dark">₹{calcResults.gstAmount}</span>
                         </div>
                         {parseFloat(cessRate) > 0 && (
                           <div className="flex justify-between items-end">
                              <span className="text-sm font-bold text-slate-500">Compensation Cess</span>
                              <span className="text-xl font-black text-orange-500">₹{calcResults.cessAmount}</span>
                           </div>
                         )}
                         <div className="h-px bg-slate-100 w-full my-4"></div>
                         <div className="flex justify-between items-end">
                            <span className="text-lg font-bold text-dark">Grand Total</span>
                            <span className="text-4xl font-black text-dark">₹{calcResults.totalAmount}</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-8 rounded-4xl space-y-6">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-4">GST Component Breakdown</p>
                      
                      {supplyType === 'intra' ? (
                        <>
                          <div className="flex justify-between group">
                            <span className="text-sm font-bold text-slate-600 group-hover:text-dark transition-colors">CGST (Central Tax)</span>
                            <span className="text-sm font-black text-dark">₹{calcResults.cgst}</span>
                          </div>
                          <div className="flex justify-between group">
                            <span className="text-sm font-bold text-slate-600 group-hover:text-dark transition-colors">SGST (State Tax)</span>
                            <span className="text-sm font-black text-dark">₹{calcResults.sgst}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between group">
                          <span className="text-sm font-bold text-slate-600 group-hover:text-dark transition-colors">IGST (Integrated Tax)</span>
                          <span className="text-sm font-black text-dark">₹{calcResults.igst}</span>
                        </div>
                      )}

                      <div className="mt-12 pt-6 border-t border-slate-200">
                         <div className="flex items-center gap-2 mb-3">
                           <Info className="h-4 w-4 text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase">Applicable Rules</span>
                         </div>
                         <p className="text-[11px] text-slate-400 leading-relaxed italic">
                           *Computation is based on {supplyType === 'intra' ? 'Same State' : 'Other State'} supply rules under Section 7/8 of the IGST Act.
                         </p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Lower info block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { title: 'Reverse Charge', value: 'RCM', desc: 'Reciever pays tax to Gov.', icon: Activity },
                   { title: 'ITC Eligibility', value: 'Full', desc: 'Can be claimed as credit.', icon: History },
                   { title: 'Doc Required', value: 'Tax Invoice', desc: 'Must mention all rates.', icon: HelpCircle },
                 ].map((card, i) => (
                   <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                      <div className="bg-slate-50 p-2.5 rounded-xl">
                        <card.icon className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{card.title}</p>
                        <p className="text-sm font-bold text-dark mt-0.5">{card.value}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{card.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="interest"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
          >
             <div className="bg-white p-10 rounded-4xl border border-slate-100 shadow-sm space-y-8">
                <div>
                   <h3 className="text-xl font-black text-dark mb-2">Interest Calculator (Sec 50)</h3>
                   <p className="text-sm text-slate-500">Calculate interest on delayed payment of tax after due date.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">Unpaid Tax Liability (Cash Ledger)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="number" 
                        value={taxLiability}
                        onChange={(e) => setTaxLiability(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-dark mb-2">Delay (Days)</label>
                      <input 
                        type="number" 
                        value={delayDays}
                        onChange={(e) => setDelayDays(e.target.value)}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-dark mb-2">Interest Rate (% p.a.)</label>
                      <select 
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseInt(e.target.value))}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all font-bold appearance-none"
                      >
                         <option value={18}>18% (Standard Delay)</option>
                         <option value={24}>24% (Excess ITC Clamied)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-brand/10 border border-brand/20 rounded-3xl">
                   <div className="flex gap-4">
                      <div className="bg-brand p-3 rounded-2xl h-fit">
                        <ArrowRight className="h-6 w-6 text-dark" />
                      </div>
                      <div>
                         <p className="text-xs font-black text-dark uppercase tracking-widest mb-1">Calculation Logic</p>
                         <p className="text-xs text-brand-dark/80 leading-relaxed font-medium">
                            Interest is computed on a per-day basis on the net tax liability paid through cash ledger after the standardized due date of filing.
                         </p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-dark p-12 rounded-4xl text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-12">
                   <div>
                      <p className="text-xs font-black text-brand uppercase tracking-[3px] mb-4">Interest Payable</p>
                      <p className="text-7xl font-black">₹{interestResults.interest}</p>
                   </div>

                   <div className="space-y-6">
                      <div className="flex justify-between items-center py-4 border-b border-white/10">
                         <span className="text-slate-400 font-bold">Principal Liability</span>
                         <span className="text-xl font-black">₹{taxLiability}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-white/10">
                         <span className="text-slate-400 font-bold">Accumulated Interest</span>
                         <span className="text-xl font-black text-brand">₹{interestResults.interest}</span>
                      </div>
                      <div className="flex justify-between items-center pt-8">
                         <span className="text-xl font-black text-white uppercase tracking-widest">Total Payable</span>
                         <span className="text-4xl font-black text-white">₹{interestResults.totalPayable}</span>
                      </div>
                   </div>
                </div>
                <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-brand/10 rounded-full blur-3xl"></div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
