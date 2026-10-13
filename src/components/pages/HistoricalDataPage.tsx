import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Filter,
  Check
} from 'lucide-react';
import { HistoricalRecord } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getIndiaTodayDateString } from '../../utils/dateUtils';

interface HistoricalDataPageProps {
  historicalData: HistoricalRecord[];
}

type SortField = 'date' | 'modal_price' | 'min_price' | 'max_price' | 'arrivals_quintals' | 'rainfall_mm' | 'realized_volatility_14d';
type SortOrder = 'asc' | 'desc';

export const HistoricalDataPage: React.FC<HistoricalDataPageProps> = ({ historicalData }) => {
  const { t } = useLanguage();
  const datasetEndDate = useMemo(() => {
    if (historicalData && historicalData.length > 0) {
      return historicalData[historicalData.length - 1].date;
    }
    return getIndiaTodayDateString();
  }, [historicalData]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2021-01-01');
  const [endDate, setEndDate] = useState<string>(datasetEndDate);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 50;

  // Filter and sort records
  const processedData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    let result = historicalData.filter((r) => {
      // Date range filter
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesDate = r.date.includes(q);
        const matchesPrice = r.modal_price.toString().includes(q);
        const matchesArrivals = r.arrivals_quintals.toString().includes(q);
        const matchesRain = r.rainfall_mm.toString().includes(q);
        if (!matchesDate && !matchesPrice && !matchesArrivals && !matchesRain) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'date') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [historicalData, searchTerm, startDate, endDate, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (processedData.length === 0) return;

    const headers = [
      'Date',
      'Commodity',
      'Market',
      'Modal Price (INR/quintal)',
      'Min Price',
      'Max Price',
      'Arrivals (quintals)',
      'Rainfall (mm)',
      'Monsoon Flag',
      '14-Day Realized Volatility (%)'
    ];

    const rows = processedData.map((r) => [
      r.date,
      `"${r.commodity || 'Tur Dal'}"`,
      `"${r.market || 'Mumbai APMC'}"`,
      r.modal_price,
      r.min_price,
      r.max_price,
      r.arrivals_quintals,
      r.rainfall_mm,
      r.is_monsoon ? 'Yes' : 'No',
      r.realized_volatility_14d
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AgriPulse_TurDal_MumbaiAPMC_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Filters, Search, Export */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t('history.title')}</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500">
              {t('history.matchingRecords', { count: processedData.length.toLocaleString() })}
            </span>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#18482E] hover:bg-[#123622] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('history.exportCsv')}</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t('history.search')}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t('history.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t('history.startDate')}
            </label>
            <input
              type="date"
              min="2021-01-01"
              max={datasetEndDate}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t('history.endDate')}
            </label>
            <input
              type="date"
              min="2021-01-01"
              max={datasetEndDate}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('history.dateCol')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('modal_price')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{t('history.modalCol')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">
                  {t('history.rangeCol')}
                </th>
                <th
                  onClick={() => handleSort('arrivals_quintals')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{t('history.arrivalsCol')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('rainfall_mm')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{t('history.rainfallCol')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('realized_volatility_14d')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{t('history.volCol')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => {
                  const vol = row.realized_volatility_14d;
                  return (
                    <tr
                      key={row.date}
                      className="hover:bg-[#F8FAF7] transition-colors"
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {row.date}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                        ₹{row.modal_price.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-500 text-[11px] hidden sm:table-cell">
                        ₹{row.min_price} – ₹{row.max_price}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-700">
                        {row.arrivals_quintals.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600">
                        {row.rainfall_mm > 0 ? (
                          <span className="text-sky-700 font-semibold">{row.rainfall_mm} mm</span>
                        ) : (
                          <span className="text-slate-400">0.0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold">
                        <span
                          className={
                            vol > 24
                              ? 'text-rose-700'
                              : vol >= 14
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }
                        >
                          {vol}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    No historical records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            {t('history.page', { current: currentPage, total: totalPages })}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {t('history.prev')}
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                currentPage === totalPages
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {t('history.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
