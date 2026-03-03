import React, { useState, useEffect } from "react";
import { useProject } from "@/contexts/project";
import { fetchZohoProjectTasks, } from "@/services/api";
import Loading from "../../shared/Loading";
import { toast } from "sonner";
import { LuFilter } from "react-icons/lu";

const ProjectSchedule = () => {
    const {
        isLoading,
        projectDetails: project,
    } = useProject();
    const [zohoTasks, setZohoTasks] = useState([]);
    const [zohoAnalytics, setZohoAnalytics] = useState(null);
    const [isLoadingZoho, setIsLoadingZoho] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOwner, setFilterOwner] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    useEffect(() => {
        if (project?.zoho_portal_id && project?.zoho_project_id) {
            fetchZohoTasks();
        }
    }, [project?.zoho_portal_id, project?.zoho_project_id]);


    const fetchZohoTasks = async () => {
        setIsLoadingZoho(true);
        try {
            const response = await fetchZohoProjectTasks(project.zoho_portal_id, project.zoho_project_id);

            // The API response has tasks and analytics at the root level of response.data
            setZohoTasks(response.data.tasks || []);
            setZohoAnalytics(response.data.analytics || null);
            setIsLoadingZoho(false);
        } catch (error) {
            toast.error("Failed to fetch Zoho tasks.");
            setIsLoadingZoho(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedTasks = React.useMemo(() => {
        let sortableTasks = [...zohoTasks];

        // Apply search filter
        if (searchQuery) {
            sortableTasks = sortableTasks.filter(task =>
                task.task_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.task_owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.task_status_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply owner filter
        if (filterOwner) {
            sortableTasks = sortableTasks.filter(task => task.task_owner_name === filterOwner);
        }

        // Apply status filter
        if (filterStatus) {
            sortableTasks = sortableTasks.filter(task => task.task_status_name === filterStatus);
        }

        // Apply priority filter
        if (filterPriority) {
            sortableTasks = sortableTasks.filter(task => task.task_priority === filterPriority);
        }

        // Apply date range filter
        if (filterStartDate && filterEndDate) {
            sortableTasks = sortableTasks.filter(task => {
                if (!task.start_date) return false;
                const taskDate = new Date(task.start_date);
                const startDate = new Date(filterStartDate);
                const endDate = new Date(filterEndDate);
                return taskDate >= startDate && taskDate <= endDate;
            });
        }

        // Apply sorting
        if (sortConfig.key !== null) {
            sortableTasks.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle null/undefined values
                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';

                // Convert to string for comparison
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableTasks;
    }, [zohoTasks, sortConfig, searchQuery, filterOwner, filterStatus, filterPriority, filterStartDate, filterEndDate]);

    // PieChart Component for Analytics
    const PieChart = ({ data, colors }) => {
        const entries = Object.entries(data);
        const total = entries.reduce((sum, [_, count]) => sum + count, 0);

        if (total === 0) {
            return (
                <div className="text-xs text-zinc-500 text-center py-8">No data available</div>
            );
        }

        let currentAngle = 0;
        const radius = 120;
        const centerX = 150;
        const centerY = 150;

        const segments = entries.map(([label, count]) => {
            const percentage = (count / total) * 100;
            const angle = (count / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
            const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
            const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
            const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${startX} ${startY}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                'Z'
            ].join(' ');

            currentAngle = endAngle;

            return {
                label,
                count,
                percentage: percentage.toFixed(1),
                pathData,
                color: colors[label] || '#6b7280'
            };
        });

        return (
            <div className="relative w-full h-full min-h-[320px] flex items-center justify-center">
                {/* Legend - Top Right */}
                <div className="absolute top-0 right-0 flex flex-col gap-1.5 text-sm max-w-[45%]">
                    {segments.map((segment, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: segment.color }}
                            ></div>
                            <span className="text-zinc-700 text-sm truncate" title={`${segment.label}: ${segment.count} (${segment.percentage}%)`}>
                                {segment.label}: <span className="font-semibold">{segment.count}</span>
                                <span className="text-zinc-500 ml-0.5">({segment.percentage}%)</span>
                            </span>
                        </div>
                    ))}
                </div>

                {/* Pie Chart */}
                <svg width="300" height="300" viewBox="0 0 300 300" className="max-w-full">
                    {segments.map((segment, index) => (
                        <path
                            key={index}
                            d={segment.pathData}
                            fill={segment.color}
                            stroke="white"
                            strokeWidth="3"
                        />
                    ))}
                </svg>
            </div>
        );
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="p-5 flex flex-col gap-5">
            {isLoadingZoho ? (
                <Loading />
            ) : !project?.zoho_portal_id || !project?.zoho_project_id ? (
                <div className="border border-zinc-100 rounded-md p-5 text-center">
                    <p className="text-zinc-600">No Zoho project linked to this project.</p>
                </div>
            ) : (
                <>
                    {/* Analytics Section - 2x3 Grid */}
                    {zohoAnalytics && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Status Wise Count - Pie Chart */}
                            <div className="border border-zinc-100 rounded-md p-4 min-h-[400px]">
                                <h3 className="text-sm font-semibold text-zinc-800 mb-3">Status Wise Count</h3>
                                <div className="flex items-center justify-center h-full">
                                    <PieChart
                                        data={zohoAnalytics.status_wise_count || {}}
                                        colors={{
                                            'Open': '#3b82f6',
                                            'In Progress': '#eab308',
                                            'In Review': '#a855f7',
                                            'On Hold': '#f97316',
                                            'Closed': '#22c55e'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Priority Wise Count - Pie Chart */}
                            <div className="border border-zinc-100 rounded-md p-4 min-h-[400px]">
                                <h3 className="text-sm font-semibold text-zinc-800 mb-3">Priority Wise Count</h3>
                                <div className="flex items-center justify-center h-full">
                                    <PieChart
                                        data={zohoAnalytics.priority_wise_count || {}}
                                        colors={{
                                            'High': '#ef4444',
                                            'Medium': '#f97316',
                                            'Low': '#22c55e',
                                            'None': '#6b7280'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Owner Wise Count - List View */}
                            <div className="border border-zinc-100 rounded-md p-4">
                                <h3 className="text-sm font-semibold text-zinc-800 mb-3">Owner Wise Count (Top 10)</h3>
                                <div className="max-h-64 overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-zinc-50 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-semibold text-zinc-700">Owner</th>
                                                <th className="px-3 py-2 text-center font-semibold text-zinc-700">Total</th>
                                                <th className="px-3 py-2 text-center font-semibold text-zinc-700">Open</th>
                                                <th className="px-3 py-2 text-center font-semibold text-zinc-700">Closed</th>
                                                <th className="px-3 py-2 text-center font-semibold text-zinc-700">Overdue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(zohoAnalytics.owner_wise_count || {})
                                                .sort((a, b) => b[1].total_tasks - a[1].total_tasks)
                                                .slice(0, 10)
                                                .map(([owner, stats], index) => (
                                                    <tr key={owner} className="border-b border-zinc-100 hover:bg-zinc-50">
                                                        <td className="px-3 py-2 text-zinc-700" title={owner}>{owner}</td>
                                                        <td className="px-3 py-2 text-zinc-800 font-semibold text-center">{stats.total_tasks}</td>
                                                        <td className="px-3 py-2 text-blue-600 text-center">{stats.open_tasks}</td>
                                                        <td className="px-3 py-2 text-green-600 text-center">{stats.closed_tasks}</td>
                                                        <td className="px-3 py-2 text-red-600 text-center">{stats.overdue_tasks}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Overdue Tasks - List View */}
                            <div className="border border-zinc-100 rounded-md p-4">
                                <h3 className="text-sm font-semibold text-zinc-800 mb-3">
                                    Overdue Tasks ({zohoAnalytics.overdue_tasks?.length || 0})
                                </h3>
                                <div className="max-h-64 overflow-y-auto">
                                    {zohoAnalytics.overdue_tasks && zohoAnalytics.overdue_tasks.length > 0 ? (
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">Task</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">Owner</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">Due Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {zohoAnalytics.overdue_tasks.map((task, index) => (
                                                    <tr key={index} className="border-b border-zinc-100 hover:bg-zinc-50">
                                                        <td className="px-3 py-2 text-zinc-700" title={task.task_name}>
                                                            {task.task_name}
                                                        </td>
                                                        <td className="px-3 py-2 text-zinc-600">{task.task_owner_name || '-'}</td>
                                                        <td className="px-3 py-2 text-red-600 font-medium">{task.end_date || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-sm text-zinc-500 text-center py-4">No overdue tasks</p>
                                    )}
                                </div>
                            </div>

                            {/* Today's Tasks - List View */}
                            <div className="border border-zinc-100 rounded-md p-4">
                                <h3 className="text-sm font-semibold text-zinc-800 mb-3">
                                    Today&apos; Tasks ({zohoAnalytics.todays_tasks?.length || 0})
                                </h3>
                                <div className="max-h-64 overflow-y-auto">
                                    {zohoAnalytics.todays_tasks && zohoAnalytics.todays_tasks.length > 0 ? (
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">Task</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">Owner</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {zohoAnalytics.todays_tasks.map((task, index) => (
                                                    <tr key={index} className="border-b border-zinc-100 hover:bg-zinc-50">
                                                        <td className="px-3 py-2 text-zinc-700" title={task.task_name}>
                                                            {task.task_name}
                                                        </td>
                                                        <td className="px-3 py-2 text-zinc-600">{task.task_owner_name || '-'}</td>
                                                        <td className="px-3 py-2">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${task.task_status_name === 'Closed' ? 'bg-green-100 text-green-700' :
                                                                task.task_status_name === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                                                    task.task_status_name === 'Open' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-zinc-100 text-zinc-700'
                                                                }`}>
                                                                {task.task_status_name || '-'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-sm text-zinc-500 text-center py-4">No tasks due today</p>
                                    )}
                                </div>
                            </div>

                            {/* Upcoming Tasks (Next 7 Days) - List View */}
                            <div className="border border-zinc-100 rounded-md p-4">
                                <h3 className="text-sm font-semibold text-zinc-800 mb-3">
                                    Upcoming Tasks (Next 7 Days) ({zohoAnalytics.upcoming_tasks_next_7_days?.length || 0})
                                </h3>
                                <div className="max-h-64 overflow-y-auto">
                                    {zohoAnalytics.upcoming_tasks_next_7_days && zohoAnalytics.upcoming_tasks_next_7_days.length > 0 ? (
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">Task</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">Owner</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">Due Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {zohoAnalytics.upcoming_tasks_next_7_days.map((task, index) => (
                                                    <tr key={index} className="border-b border-zinc-100 hover:bg-zinc-50">
                                                        <td className="px-3 py-2 text-zinc-700" title={task.task_name}>
                                                            {task.task_name}
                                                        </td>
                                                        <td className="px-3 py-2 text-zinc-600">{task.task_owner_name || '-'}</td>
                                                        <td className="px-3 py-2 text-zinc-800 font-medium">{task.end_date || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-sm text-zinc-500 text-center py-4">No upcoming tasks in the next 7 days</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tasks Table */}
                    <div className="border border-zinc-100 rounded-md p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-zinc-800">Tasks ({sortedTasks.length} / {zohoTasks.length})</h3>
                        </div>

                        {/* Search Bar and Filter Icon */}
                        <div className="mb-4 flex gap-2">
                            {/* Search */}
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by task name, owner, status..."
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                            </div>

                            {/* Filter Button with Badge */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`relative px-4 py-2 text-sm font-medium rounded border transition-colors ${showFilters
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                                    }`}
                            >
                                <LuFilter className="w-4 h-4" />
                                {(filterOwner || filterStatus || filterPriority || filterStartDate || filterEndDate) && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                                        {[filterOwner, filterStatus, filterPriority, filterStartDate, filterEndDate].filter(Boolean).length}
                                    </span>
                                )}
                            </button>

                            {/* Clear Filters Button - Only show when filters are active */}
                            {(filterOwner || filterStatus || filterPriority || filterStartDate || filterEndDate) && (
                                <button
                                    onClick={() => {
                                        setFilterOwner('');
                                        setFilterStatus('');
                                        setFilterPriority('');
                                        setFilterStartDate('');
                                        setFilterEndDate('');
                                    }}
                                    className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded border border-zinc-200"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Filters Dropdown */}
                        {showFilters && (
                            <div className="mb-4 p-4 bg-zinc-50 rounded-md border border-zinc-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {/* Owner Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-700 mb-1">Owner</label>
                                        <select
                                            value={filterOwner}
                                            onChange={(e) => setFilterOwner(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                                        >
                                            <option value="">All Owners</option>
                                            {[...new Set(zohoTasks.map(task => task.task_owner_name).filter(Boolean))].sort().map(owner => (
                                                <option key={owner} value={owner}>{owner}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-700 mb-1">Status</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                                        >
                                            <option value="">All Statuses</option>
                                            {[...new Set(zohoTasks.map(task => task.task_status_name).filter(Boolean))].sort().map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Priority Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-700 mb-1">Priority</label>
                                        <select
                                            value={filterPriority}
                                            onChange={(e) => setFilterPriority(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                                        >
                                            <option value="">All Priorities</option>
                                            {[...new Set(zohoTasks.map(task => task.task_priority).filter(Boolean))].sort().map(priority => (
                                                <option key={priority} value={priority}>{priority}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Start Date Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-700 mb-1">Start Date (From)</label>
                                        <input
                                            type="date"
                                            value={filterStartDate}
                                            onChange={(e) => setFilterStartDate(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                                        />
                                    </div>

                                    {/* End Date Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-700 mb-1">Start Date (To)</label>
                                        <input
                                            type="date"
                                            value={filterEndDate}
                                            onChange={(e) => setFilterEndDate(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-50 border-b border-zinc-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('task_name')}>
                                            <div className="flex items-center gap-1">
                                                Task Name
                                                {sortConfig.key === 'task_name' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('task_status_name')}>
                                            <div className="flex items-center gap-1">
                                                Status
                                                {sortConfig.key === 'task_status_name' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('task_priority')}>
                                            <div className="flex items-center gap-1">
                                                Priority
                                                {sortConfig.key === 'task_priority' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('task_owner_name')}>
                                            <div className="flex items-center gap-1">
                                                Owner
                                                {sortConfig.key === 'task_owner_name' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('start_date')}>
                                            <div className="flex items-center gap-1">
                                                Start Date
                                                {sortConfig.key === 'start_date' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('end_date')}>
                                            <div className="flex items-center gap-1">
                                                End Date
                                                {sortConfig.key === 'end_date' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('duration')}>
                                            <div className="flex items-center gap-1">
                                                Duration
                                                {sortConfig.key === 'duration' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('task_percent_complete')}>
                                            <div className="flex items-center gap-1">
                                                Progress
                                                {sortConfig.key === 'task_percent_complete' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('task_created_by_full_name')}>
                                            <div className="flex items-center gap-1">
                                                Created By
                                                {sortConfig.key === 'task_created_by_full_name' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('task_created_at')}>
                                            <div className="flex items-center gap-1">
                                                Created At
                                                {sortConfig.key === 'task_created_at' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedTasks.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="px-3 py-8 text-center text-zinc-500">
                                                No tasks found
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedTasks.map((task, index) => (
                                            <tr key={index} className="border-b border-zinc-100 hover:bg-zinc-50">
                                                <td className="px-3 py-2 text-zinc-800">{task.task_name}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${task.task_status_name === "Open" ? "bg-blue-100 text-blue-800" :
                                                        task.task_status_name === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                                                            task.task_status_name === "In Review" ? "bg-purple-100 text-purple-800" :
                                                                task.task_status_name === "On Hold" ? "bg-orange-100 text-orange-800" :
                                                                    "bg-gray-100 text-gray-800"
                                                        }`}>
                                                        {task.task_status_name}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${task.task_priority === "High" ? "bg-red-100 text-red-800" :
                                                        task.task_priority === "Medium" ? "bg-orange-100 text-orange-800" :
                                                            task.task_priority === "Low" ? "bg-green-100 text-green-800" :
                                                                "bg-gray-100 text-gray-800"
                                                        }`}>
                                                        {task.task_priority}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-zinc-600">{task.task_owner_name || "-"}</td>
                                                <td className="px-3 py-2 text-zinc-600">{task.start_date || "-"}</td>
                                                <td className="px-3 py-2 text-zinc-600">{task.end_date || "-"}</td>
                                                <td className="px-3 py-2 text-zinc-600">{task.duration} days</td>
                                                <td className="px-3 py-2 text-zinc-600">{task.task_percent_complete}%</td>
                                                <td className="px-3 py-2 text-zinc-600">{task.task_created_by_full_name}</td>
                                                <td className="px-3 py-2 text-zinc-600">{task.task_created_at}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default ProjectSchedule;