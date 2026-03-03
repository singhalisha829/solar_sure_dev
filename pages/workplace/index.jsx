import React, { useState, useEffect, useRef } from "react";
import { fetchZohoUserTasks } from "@/services/api";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import Loading from "@/components/shared/Loading";
import { toast } from "sonner";
import { LuFilter } from "react-icons/lu";
import {
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdCancel,
  MdList
} from "react-icons/md";
import { BsFolderFill } from "react-icons/bs";

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper function to get a consistent color based on string
const getColorForName = (name) => {
  if (!name) return 'bg-zinc-400';
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-orange-500'
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

// PieChart Component
const PieChart = ({ data, colors, onSegmentClick }) => {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [_, count]) => sum + count, 0);

  if (total === 0) {
    return (
      <div className="text-sm text-zinc-500 text-center py-8">No data available</div>
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

    let pathData;

    // Special case: if angle is 360 degrees (or very close), draw a full circle
    if (angle >= 359.9) {
      // Draw as two semicircles to avoid the 360-degree arc issue
      const midX = centerX + radius * Math.cos((startAngle + 180 - 90) * Math.PI / 180);
      const midY = centerY + radius * Math.sin((startAngle + 180 - 90) * Math.PI / 180);

      pathData = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 0 1 ${midX} ${midY}`,
        `A ${radius} ${radius} 0 0 1 ${startX} ${startY}`,
        'Z'
      ].join(' ');
    } else {
      const largeArcFlag = angle > 180 ? 1 : 0;

      pathData = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        'Z'
      ].join(' ');
    }

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
          <div
            key={index}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => onSegmentClick && onSegmentClick(segment.label)}
            title={`Click to filter by ${segment.label}`}
          >
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            ></div>
            <span className="text-zinc-700 text-sm truncate">
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
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onSegmentClick && onSegmentClick(segment.label)}
            title={`Click to filter by ${segment.label}`}
          />
        ))}
      </svg>
    </div>
  );
};

const Workplace = () => {
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const tasksTableRef = useRef(null);

  // Add custom scrollbar styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Scroll to tasks table
  const scrollToTasks = () => {
    tasksTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handle summary card clicks
  const handleSummaryClick = (filterType) => {
    scrollToTasks();
    // Clear all filters first
    setSearchQuery('');
    setFilterProject('');

    // Apply specific filter based on type
    if (filterType === 'open') {
      setFilterStatus('Open');
      setFilterPriority('');
      setFilterOverdue(false);
    } else if (filterType === 'overdue') {
      setFilterStatus('');
      setFilterPriority('');
      setFilterOverdue(true);
    } else if (filterType === 'closed') {
      setFilterStatus('Closed');
      setFilterPriority('');
      setFilterOverdue(false);
    } else {
      // Total tasks - clear all filters
      setFilterStatus('');
      setFilterPriority('');
      setFilterOverdue(false);
    }
  };

  // Handle status filter from pie chart
  const handleStatusClick = (status) => {
    setFilterStatus(status);
    setFilterPriority('');
    setFilterProject('');
    setFilterOverdue(false);
    setSearchQuery('');
    scrollToTasks();
  };

  // Handle priority filter from pie chart
  const handlePriorityClick = (priority) => {
    setFilterPriority(priority);
    setFilterStatus('');
    setFilterProject('');
    setFilterOverdue(false);
    setSearchQuery('');
    scrollToTasks();
  };

  // Handle project filter
  const handleProjectClick = (project) => {
    setFilterProject(project);
    setFilterStatus('');
    setFilterPriority('');
    setFilterOverdue(false);
    setSearchQuery('');
    scrollToTasks();
  };

  // Handle task row click to open in Zoho
  const handleTaskClick = (task) => {
    window.open('https://projects.zoho.in/portal/ornatesolar', '_blank');
  };

  useEffect(() => {
    fetchUserTasks();
  }, []);

  const fetchUserTasks = async () => {
    setIsLoading(true);
    try {
      const userData = LocalStorageService.get("user");
      const userEmail = userData?.email;

      if (!userEmail) {
        toast.error("User email not found");
        setIsLoading(false);
        return;
      }

      const response = await fetchZohoUserTasks(userEmail);
      setTasks(response.data.tasks || []);
      setAnalytics(response.data.analytics || null);
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to fetch user tasks.");
      setIsLoading(false);
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
    let sortableTasks = [...tasks];

    // Apply search filter
    if (searchQuery) {
      sortableTasks = sortableTasks.filter(task =>
        task.task_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.status?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply overdue filter
    if (filterOverdue) {
      sortableTasks = sortableTasks.filter(task => task.is_overdue === true);
    }

    // Apply status filter
    if (filterStatus) {
      sortableTasks = sortableTasks.filter(task => task.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority) {
      sortableTasks = sortableTasks.filter(task => task.priority === filterPriority);
    }

    // Apply project filter
    if (filterProject) {
      // Match both the full project name and the project part after the portal
      sortableTasks = sortableTasks.filter(task => {
        const taskProjectName = task.project_name || '';
        // Check if it matches exactly or if the filterProject contains the task project name
        return taskProjectName === filterProject ||
          filterProject.includes(taskProjectName) ||
          taskProjectName.includes(filterProject);
      });
    }

    // Apply sorting
    if (sortConfig.key !== null) {
      sortableTasks.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

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
  }, [tasks, sortConfig, searchQuery, filterStatus, filterPriority, filterProject, filterOverdue]);

  // Get overdue tasks
  const overdueTasks = tasks.filter(task => task.is_overdue);

  // Get today's tasks
  const todaysTasks = tasks.filter(task => task.is_today);

  // Get upcoming tasks
  const upcomingTasks = tasks.filter(task => task.is_upcoming);

  return (
    <div className="p-6 bg-gradient-to-br from-zinc-50 to-zinc-100 min-h-screen">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-800 mb-2">My Workplace</h1>
          <p className="text-zinc-600">Track and manage all your tasks across projects</p>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <>
            {/* Summary Stats - 1x4 Cards */}
            {analytics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div
                  onClick={() => handleSummaryClick('total')}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  title="Click to view all tasks"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-700 mb-1">{analytics.summary?.total_tasks || 0}</div>
                      <div className="text-sm font-medium text-blue-600">Total Tasks</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-xl">
                      <MdList className="text-4xl text-blue-600" />
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => handleSummaryClick('open')}
                  className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  title="Click to view open tasks"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-700 mb-1">{analytics.summary?.open_tasks || 0}</div>
                      <div className="text-sm font-medium text-green-600">Open Tasks</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-xl">
                      <MdRadioButtonUnchecked className="text-4xl text-green-600" />
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => handleSummaryClick('overdue')}
                  className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  title="Click to view overdue tasks"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-red-700 mb-1">{analytics.summary?.overdue_tasks || 0}</div>
                      <div className="text-sm font-medium text-red-600">Overdue Tasks</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-xl">
                      <MdCancel className="text-4xl text-red-600" />
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => handleSummaryClick('closed')}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  title="Click to view closed tasks"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-purple-700 mb-1">{analytics.summary?.closed_tasks || 0}</div>
                      <div className="text-sm font-medium text-purple-600">Closed Tasks</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-xl">
                      <MdCheckCircle className="text-4xl text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Status Wise Count - Pie Chart */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[400px]">
                  <h3 className="text-base font-bold text-zinc-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    Status Wise Count
                  </h3>
                  <div className="flex items-center justify-center h-full">
                    <PieChart
                      data={analytics.status_wise_count || {}}
                      colors={{
                        'Open': '#3b82f6',
                        'In Progress': '#eab308',
                        'In Review': '#a855f7',
                        'On Hold': '#f97316',
                        'Closed': '#22c55e'
                      }}
                      onSegmentClick={handleStatusClick}
                    />
                  </div>
                </div>

                {/* Priority Wise Count - Pie Chart */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[400px]">
                  <h3 className="text-base font-bold text-zinc-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                    Priority Wise Count
                  </h3>
                  <div className="flex items-center justify-center h-full">
                    <PieChart
                      data={analytics.priority_wise_count || {}}
                      colors={{
                        'High': '#ef4444',
                        'Medium': '#f97316',
                        'Low': '#22c55e',
                        'None': '#6b7280'
                      }}
                      onSegmentClick={handlePriorityClick}
                    />
                  </div>
                </div>

                {/* Project Wise Count - List View */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-base font-bold text-zinc-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                    Project Wise Count
                  </h3>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-zinc-700">Project</th>
                          <th className="px-4 py-3 text-center font-semibold text-zinc-700">Total</th>
                          <th className="px-4 py-3 text-center font-semibold text-zinc-700">Open</th>
                          <th className="px-4 py-3 text-center font-semibold text-zinc-700">Closed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analytics.project_wise_count || {}).map(([projectName, stats], index) => (
                          <tr
                            key={index}
                            onClick={() => handleProjectClick(projectName)}
                            className="border-b border-zinc-100 hover:bg-purple-50 transition-colors duration-150 cursor-pointer"
                            title={`Click to filter by ${projectName}`}
                          >
                            <td className="px-4 py-3" title={projectName}>
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full ${getColorForName(projectName)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm`}>
                                  {getInitials(projectName.split(' / ')[1] || projectName)}
                                </div>
                                <span className="text-zinc-700 truncate">{projectName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-zinc-800 font-bold text-center">{stats.total_tasks}</td>
                            <td className="px-4 py-3 text-blue-600 font-semibold text-center">{stats.open_tasks}</td>
                            <td className="px-4 py-3 text-green-600 font-semibold text-center">{stats.closed_tasks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Overdue Tasks - List View */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-base font-bold text-zinc-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                    Overdue Tasks
                    <span className="ml-auto text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">{overdueTasks.length}</span>
                  </h3>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {overdueTasks.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Task</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Project</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Due Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overdueTasks.map((task, index) => (
                            <tr
                              key={index}
                              onClick={scrollToTasks}
                              className="border-b border-zinc-100 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                              title="Click to view task details"
                            >
                              <td className="px-4 py-3" title={task.task_name}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-full ${getColorForName(task.task_name)} flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 shadow-sm`}>
                                    {getInitials(task.task_name)}
                                  </div>
                                  <span className="text-zinc-700 truncate">{task.task_name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <BsFolderFill className="text-zinc-400 flex-shrink-0" />
                                  <span className="text-zinc-600 truncate">{task.project_name || '-'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">{task.end_date || '-'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                        <MdCheckCircle className="text-5xl mb-2" />
                        <p className="text-sm font-medium">No overdue tasks</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Today's Tasks - List View */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-base font-bold text-zinc-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    Today&apos; Tasks
                    <span className="ml-auto text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">{todaysTasks.length}</span>
                  </h3>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {todaysTasks.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Task</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Project</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todaysTasks.map((task, index) => (
                            <tr
                              key={index}
                              onClick={scrollToTasks}
                              className="border-b border-zinc-100 hover:bg-green-50 transition-colors duration-150 cursor-pointer"
                              title="Click to view task details"
                            >
                              <td className="px-4 py-3" title={task.task_name}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-full ${getColorForName(task.task_name)} flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 shadow-sm`}>
                                    {getInitials(task.task_name)}
                                  </div>
                                  <span className="text-zinc-700 truncate">{task.task_name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <BsFolderFill className="text-zinc-400 flex-shrink-0" />
                                  <span className="text-zinc-600 truncate">{task.project_name || '-'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${task.status === 'Closed' ? 'bg-green-100 text-green-700' :
                                  task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                    task.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                                      'bg-zinc-100 text-zinc-700'
                                  }`}>
                                  {task.status || '-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                        <MdList className="text-5xl mb-2" />
                        <p className="text-sm font-medium">No tasks due today</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Tasks (Next 7 Days) - List View */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-base font-bold text-zinc-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-cyan-500 rounded-full"></div>
                    Upcoming Tasks (Next 7 Days)
                    <span className="ml-auto text-sm font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">{upcomingTasks.length}</span>
                  </h3>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {upcomingTasks.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Task</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Project</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Due Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingTasks.map((task, index) => (
                            <tr
                              key={index}
                              onClick={scrollToTasks}
                              className="border-b border-zinc-100 hover:bg-cyan-50 transition-colors duration-150 cursor-pointer"
                              title="Click to view task details"
                            >
                              <td className="px-4 py-3" title={task.task_name}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-full ${getColorForName(task.task_name)} flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 shadow-sm`}>
                                    {getInitials(task.task_name)}
                                  </div>
                                  <span className="text-zinc-700 truncate">{task.task_name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <BsFolderFill className="text-zinc-400 flex-shrink-0" />
                                  <span className="text-zinc-600 truncate">{task.project_name || '-'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-zinc-800 font-semibold bg-zinc-100 px-2 py-1 rounded">{task.end_date || '-'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                        <MdRadioButtonUnchecked className="text-5xl mb-2" />
                        <p className="text-sm font-medium">No upcoming tasks in the next 7 days</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Table */}
            <div ref={tasksTableRef} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
                    <div className="w-1 h-7 bg-orange-500 rounded-full"></div>
                    My Tasks
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Showing {sortedTasks.length} of {tasks.length} tasks
                  </p>
                </div>
              </div>

              {/* Search Bar and Filter Icon */}
              <div className="mb-4 flex gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by task name, project, status..."
                    className="w-full pl-4 pr-4 py-3 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                  />
                </div>

                {/* Filter Button with Badge */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative px-5 py-3 text-sm font-semibold rounded-lg border transition-all duration-200 ${showFilters
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                    : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50 shadow-sm'
                    }`}
                >
                  <LuFilter className="w-5 h-5" />
                  {(filterStatus || filterPriority || filterProject || filterOverdue) && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                      {[filterStatus, filterPriority, filterProject, filterOverdue].filter(Boolean).length}
                    </span>
                  )}
                </button>

                {/* Clear Filters Button */}
                {(filterStatus || filterPriority || filterProject || filterOverdue) && (
                  <button
                    onClick={() => {
                      setFilterStatus('');
                      setFilterPriority('');
                      setFilterProject('');
                      setFilterOverdue(false);
                    }}
                    className="px-4 py-3 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 shadow-sm transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Filters Dropdown */}
              {showFilters && (
                <div className="mb-4 p-5 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-xl border border-zinc-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
                      >
                        <option value="">All Statuses</option>
                        {[...new Set(tasks.map(task => task.status).filter(Boolean))].sort().map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">Priority</label>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
                      >
                        <option value="">All Priorities</option>
                        {[...new Set(tasks.map(task => task.priority).filter(Boolean))].sort().map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </div>

                    {/* Project Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">Project</label>
                      <select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
                      >
                        <option value="">All Projects</option>
                        {[...new Set(tasks.map(task => task.project_name).filter(Boolean))].sort().map(project => (
                          <option key={project} value={project}>{project}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-lg border border-zinc-200">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100 border-b-2 border-zinc-200">
                    <tr>
                      <th className="px-4 py-4 text-left font-bold text-zinc-700 cursor-pointer hover:bg-zinc-200 transition-colors duration-150" onClick={() => handleSort('task_name')}>
                        <div className="flex items-center gap-2">
                          Task Name
                          {sortConfig.key === 'task_name' && (
                            <span className="text-orange-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-zinc-700 cursor-pointer hover:bg-zinc-200 transition-colors duration-150" onClick={() => handleSort('project_name')}>
                        <div className="flex items-center gap-2">
                          Project
                          {sortConfig.key === 'project_name' && (
                            <span className="text-orange-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-zinc-700 cursor-pointer hover:bg-zinc-200 transition-colors duration-150" onClick={() => handleSort('status')}>
                        <div className="flex items-center gap-2">
                          Status
                          {sortConfig.key === 'status' && (
                            <span className="text-orange-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-zinc-700 cursor-pointer hover:bg-zinc-200 transition-colors duration-150" onClick={() => handleSort('priority')}>
                        <div className="flex items-center gap-2">
                          Priority
                          {sortConfig.key === 'priority' && (
                            <span className="text-orange-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-zinc-700 cursor-pointer hover:bg-zinc-200 transition-colors duration-150" onClick={() => handleSort('start_date')}>
                        <div className="flex items-center gap-2">
                          Start Date
                          {sortConfig.key === 'start_date' && (
                            <span className="text-orange-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-zinc-700 cursor-pointer hover:bg-zinc-200 transition-colors duration-150" onClick={() => handleSort('end_date')}>
                        <div className="flex items-center gap-2">
                          End Date
                          {sortConfig.key === 'end_date' && (
                            <span className="text-orange-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-zinc-700">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTasks.map((task, index) => (
                      <tr
                        key={index}
                        onClick={() => handleTaskClick(task)}
                        className="border-b border-zinc-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 cursor-pointer"
                        title="Click to open in Zoho Projects"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${getColorForName(task.task_name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
                              {getInitials(task.task_name)}
                            </div>
                            <span className="text-zinc-800 font-medium">{task.task_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <BsFolderFill className="text-zinc-400 flex-shrink-0 text-base" />
                            <span className="text-zinc-600">{task.project_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${task.status === 'Closed' ? 'bg-green-100 text-green-700' :
                            task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                              task.status === 'In Review' ? 'bg-purple-100 text-purple-700' :
                                task.status === 'On Hold' ? 'bg-orange-100 text-orange-700' :
                                  task.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                                    'bg-zinc-100 text-zinc-700'
                            }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${task.priority === 'High' ? 'bg-red-100 text-red-700' :
                            task.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                              task.priority === 'Low' ? 'bg-green-100 text-green-700' :
                                'bg-zinc-100 text-zinc-700'
                            }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-zinc-600 font-medium">{task.start_date || '-'}</td>
                        <td className="px-4 py-4">
                          <span className={task.is_overdue ? 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded' : 'text-zinc-600 font-medium'}>
                            {task.end_date || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-zinc-200 rounded-full h-2.5 min-w-[80px] shadow-inner">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                                style={{ width: `${task.percent_complete || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-zinc-700 font-bold min-w-[35px]">{task.percent_complete || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Workplace;
