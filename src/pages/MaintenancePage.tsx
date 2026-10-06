import React, { useState, useEffect } from 'react';
import { WorkOrder, WorkOrderStatus, PriorityLevel } from '../types';
import { api } from '../services/api';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Building2,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface MaintenancePageProps {
  onOpenWorkOrderModal: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ onOpenWorkOrderModal }) => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getWorkOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: WorkOrderStatus) => {
    try {
      await api.updateWorkOrderStatus(id, newStatus);
      loadOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'IN_PROGRESS':
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
        };
      case 'SCHEDULED':
        return {
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          icon: <Calendar className="w-3.5 h-3.5 text-indigo-400" />,
        };
      default:
        return {
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Wrench className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Maintenance Priority & Work Order Dispatch
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch civil crews, prioritize critical structural repairs, and monitor completion timelines
          </p>
        </div>

        <button
          onClick={onOpenWorkOrderModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-950/40 transition-all hover:scale-[1.02] shrink-0"
        >
          <Wrench className="w-4 h-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filter Status:</span>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const statusMeta = getStatusBadge(order.status);
          const priorityBadge = getPriorityBadge(order.priority);

          return (
            <div
              key={order.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 shadow-xl space-y-3.5 transition-all"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-400 uppercase bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {order.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${priorityBadge}`}>
                    {order.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border flex items-center gap-1 ${statusMeta.badge}`}>
                    {statusMeta.icon}
                    <span>{order.status.replace('_', ' ')}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Target: {order.dueDate}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono font-bold text-slate-200">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>${order.estimatedCostUsd.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Title & Asset Association */}
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{order.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-medium text-slate-300">{order.infrastructureName}</span>
                  <span>•</span>
                  <span>Crew: <strong className="text-slate-200">{order.assignedCrew}</strong></span>
                </div>
              </div>

              {/* Remediation Instructions */}
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                {order.description}
              </p>

              {/* Status Update Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Created: {order.createdAt}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Update Status:</span>
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'PENDING')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      order.status === 'PENDING'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'SCHEDULED')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      order.status === 'SCHEDULED'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Scheduled
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'IN_PROGRESS')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      order.status === 'IN_PROGRESS'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
