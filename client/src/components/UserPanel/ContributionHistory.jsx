import React from 'react';
import { GitCommit, Clock, CheckCircle, XCircle } from 'lucide-react';

const ContributionHistory = () => {
    // Mock data
    const contributions = [
        { id: 1, type: 'Added Layer', target: 'Historical Paris 1900', status: 'approved', date: '2023-11-15' },
        { id: 2, type: 'Edited Feature', target: 'Eiffel Tower', status: 'pending', date: '2023-11-14' },
        { id: 3, type: 'Added Point', target: 'Notre Dame', status: 'rejected', date: '2023-11-10' },
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle size={14} className="text-green-400" />;
            case 'rejected': return <XCircle size={14} className="text-red-400" />;
            default: return <Clock size={14} className="text-yellow-400" />;
        }
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</h4>

            <div className="space-y-3">
                {contributions.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                        <div className="mt-1 p-1.5 bg-slate-700/50 rounded-full text-slate-400">
                            <GitCommit size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-200">{item.type}</span>
                                <span className="text-xs text-slate-500">{item.date}</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">{item.target}</p>
                            <div className="flex items-center gap-1.5">
                                {getStatusIcon(item.status)}
                                <span className={`text-xs capitalize ${item.status === 'approved' ? 'text-green-400' :
                                        item.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContributionHistory;
