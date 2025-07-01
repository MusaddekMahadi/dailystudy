// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Charts
    const dailyCtx = document.getElementById('daily-chart').getContext('2d');
    const accuracyCtx = document.getElementById('accuracy-chart').getContext('2d');
    
    const dailyChart = new Chart(dailyCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Estimated',
                    data: [120, 90, 150, 180, 60, 30, 0],
                    backgroundColor: '#c7d2fe',
                },
                {
                    label: 'Actual',
                    data: [90, 120, 180, 150, 45, 45, 0],
                    backgroundColor: '#4f46e5',
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw} mins`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Minutes'
                    }
                }
            }
        }
    });

    const accuracyChart = new Chart(accuracyCtx, {
        type: 'doughnut',
        data: {
            labels: ['Accurate', 'Overestimated', 'Underestimated'],
            datasets: [{
                data: [30, 40, 30],
                backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });

    // Task Management System
    const taskFormModal = document.getElementById('task-form-modal');
    const taskFormTitle = document.getElementById('task-form-title');
    const editTaskName = document.getElementById('edit-task-name');
    const editTaskDate = document.getElementById('edit-task-date');
    const editTaskTime = document.getElementById('edit-task-time');
    const editTaskDesc = document.getElementById('edit-task-desc');
    const editTaskRecurrence = document.getElementById('edit-task-recurrence');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const addTaskBtn = document.getElementById('add-task-btn');
    const tasksTableBody = document.getElementById('tasks-table-body');
    const noTasksRow = document.getElementById('no-tasks-row');
    
    // Set default date to today
    editTaskDate.valueAsDate = new Date();
    
    // Task data structure
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentTaskId = null;
    let editingTaskId = null;
    let activeTaskInterval = null;
    let activeTaskSeconds = 0;
    
    // Initialize the app
    function init() {
        renderTasks();
        updateDashboard();
        setupEventListeners();
    }
    
    // Render tasks based on view (today/upcoming/recurring)
    function renderTasks(view = 'today') {
        const today = new Date().toISOString().split('T')[0];
        
        let filteredTasks = [];
        if (view === 'today') {
            filteredTasks = tasks.filter(task => 
                task.date === today || 
                (task.recurrence && task.recurrence !== 'none')
            );
        } else if (view === 'upcoming') {
            filteredTasks = tasks.filter(task => 
                task.date > today && 
                (!task.recurrence || task.recurrence === 'none')
            );
        } else if (view === 'recurring') {
            filteredTasks = tasks.filter(task => 
                task.recurrence && task.recurrence !== 'none'
            );
        }
        
        if (filteredTasks.length === 0) {
            noTasksRow.classList.remove('hidden');
            tasksTableBody.innerHTML = '';
            tasksTableBody.appendChild(noTasksRow);
            return;
        }
        
        noTasksRow.classList.add('hidden');
        tasksTableBody.innerHTML = '';
        
        filteredTasks.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.status === 'In Progress' ? -1 : b.status === 'In Progress' ? 1 : 0;
        }).forEach(task => {
            const row = document.createElement('tr');
            row.className = `task-row ${task.status.toLowerCase().replace(' ', '-')} ${currentTaskId === task.id ? 'active-task' : ''}`;
            row.dataset.taskId = task.id;
            
            // Status cell
            const statusCell = document.createElement('td');
            statusCell.className = 'px-4 py-3 whitespace-nowrap';
            
            const statusDiv = document.createElement('div');
            statusDiv.className = `flex items-center ${getStatusClass(task.status)}`;
            
            const statusIcon = document.createElement('i');
            statusIcon.className = `fas ${getStatusIcon(task.status)} mr-2`;
            
            const statusText = document.createElement('span');
            statusText.className = 'text-sm font-medium';
            statusText.textContent = task.status;
            
            statusDiv.appendChild(statusIcon);
            statusDiv.appendChild(statusText);
            statusCell.appendChild(statusDiv);
            row.appendChild(statusCell);
            
            // Task details cell
            const detailsCell = document.createElement('td');
            detailsCell.className = 'px-4 py-3';
            
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'task-details flex flex-col';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'text-sm font-medium text-gray-900';
            nameDiv.textContent = task.name;
            
            const descDiv = document.createElement('div');
            descDiv.className = 'text-xs text-gray-500 mt-1';
            descDiv.textContent = task.description || 'No description';
            
            const dateDiv = document.createElement('div');
            dateDiv.className = 'text-xs text-gray-400 mt-1';
            
            const dateText = document.createElement('span');
            dateText.textContent = formatDate(task.date);
            
            dateDiv.appendChild(dateText);
            
            if (task.recurrence && task.recurrence !== 'none') {
                const recurrenceIcon = document.createElement('i');
                recurrenceIcon.className = 'fas fa-sync-alt ml-2';
                recurrenceIcon.title = `Repeats ${task.recurrence}`;
                dateDiv.appendChild(recurrenceIcon);
            }
            
            detailsDiv.appendChild(nameDiv);
            detailsDiv.appendChild(descDiv);
            detailsDiv.appendChild(dateDiv);
            detailsCell.appendChild(detailsDiv);
            row.appendChild(detailsCell);
            
            // Time cell
            const timeCell = document.createElement('td');
            timeCell.className = 'px-4 py-3 whitespace-nowrap';
            
            const timeDiv = document.createElement('div');
            timeDiv.className = 'flex flex-col';
            
            const estimatedTimeDiv = document.createElement('div');
            estimatedTimeDiv.className = 'text-sm';
            estimatedTimeDiv.textContent = `${task.estimatedTime} min`;
            
            timeDiv.appendChild(estimatedTimeDiv);
            
            if (task.actualTime) {
                const actualTimeDiv = document.createElement('div');
                actualTimeDiv.className = 'text-xs text-indigo-600';
                actualTimeDiv.textContent = `${task.actualTime} min actual`;
                timeDiv.appendChild(actualTimeDiv);
            }
            
            timeCell.appendChild(timeDiv);
            row.appendChild(timeCell);
            
            // Actions cell
            const actionsCell = document.createElement('td');
            actionsCell.className = 'px-4 py-3 whitespace-nowrap text-right text-sm font-medium';
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'task-actions flex space-x-2 justify-end';
            
            // Start/Stop button
            const timerBtn = document.createElement('button');
            timerBtn.className = `px-2 py-1 rounded-md ${currentTaskId === task.id ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'}`;
            
            const timerIcon = document.createElement('i');
            timerIcon.className = `fas ${currentTaskId === task.id ? 'fa-stop' : 'fa-play'}`;
            
            timerBtn.appendChild(timerIcon);
            timerBtn.addEventListener('click', () => {
                if (currentTaskId === task.id) {
                    stopTaskTimer();
                } else {
                    startTaskTimer(task.id);
                }
            });
            
            actionsDiv.appendChild(timerBtn);
            
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'px-2 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200';
            
            const editBtnIcon = document.createElement('i');
            editBtnIcon.className = 'fas fa-edit';
            
            editBtn.appendChild(editBtnIcon);
            editBtn.addEventListener('click', () => showEditTaskForm(task));
            
            actionsDiv.appendChild(editBtn);
            
            // Progress button
            const progressBtn = document.createElement('button');
            progressBtn.className = 'px-2 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200';
            
            const progressBtnIcon = document.createElement('i');
            progressBtnIcon.className = 'fas fa-chart-line';
            
            progressBtn.appendChild(progressBtnIcon);
            progressBtn.addEventListener('click', () => showProgressModal(task.id, task.progress, task.notes, task.actualTime));
            
            actionsDiv.appendChild(progressBtn);
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'px-2 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200';
            
            const deleteBtnIcon = document.createElement('i');
            deleteBtnIcon.className = 'fas fa-trash';
            
            deleteBtn.appendChild(deleteBtnIcon);
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this task?')) {
                    deleteTask(task.id);
                }
            });
            
            actionsDiv.appendChild(deleteBtn);
            
            actionsCell.appendChild(actionsDiv);
            row.appendChild(actionsCell);
            
            tasksTableBody.appendChild(row);
        });
    }
    
    // Task timer functions
    function startTaskTimer(taskId) {
        stopTaskTimer();
        
        currentTaskId = taskId;
        activeTaskSeconds = 0;
        
        // Update task status
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = 'In Progress';
            saveTasks();
            renderTasks();
        }
        
        // Update current task display
        updateCurrentTaskDisplay();
        
        // Start timer
        activeTaskInterval = setInterval(() => {
            activeTaskSeconds++;
            
            // Update task's elapsed time every minute
            if (activeTaskSeconds % 60 === 0) {
                const taskIndex = tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].elapsedTime = Math.floor(activeTaskSeconds / 60);
                    saveTasks();
                }
            }
            
            updateCurrentTaskDisplay();
        }, 1000);
    }
    
    function stopTaskTimer() {
        if (activeTaskInterval) {
            clearInterval(activeTaskInterval);
            activeTaskInterval = null;
            
            // Save the time spent if there was an active task
            if (currentTaskId) {
                const taskIndex = tasks.findIndex(t => t.id === currentTaskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].elapsedTime = Math.floor(activeTaskSeconds / 60);
                    saveTasks();
                }
            }
            
            currentTaskId = null;
            activeTaskSeconds = 0;
            renderTasks();
            updateCurrentTaskDisplay();
        }
    }
    
    function updateCurrentTaskDisplay() {
        const currentTaskElement = document.getElementById('current-task-name');
        const currentTaskTimeElement = document.getElementById('current-task-time');
        const spinnerElement = document.getElementById('active-task-spinner');
        
        if (currentTaskId) {
            const task = tasks.find(t => t.id === currentTaskId);
            if (task) {
                const hours = Math.floor(activeTaskSeconds / 3600);
                const minutes = Math.floor((activeTaskSeconds % 3600) / 60);
                const secs = activeTaskSeconds % 60;
                
                currentTaskElement.textContent = task.name;
                currentTaskTimeElement.textContent = 
                    `${hours}h ${minutes}m / ${task.estimatedTime} min`;
                spinnerElement.classList.remove('hidden');
            }
        } else {
            currentTaskElement.textContent = 'None';
            currentTaskTimeElement.textContent = '0h 0m / 0h 0m';
            spinnerElement.classList.add('hidden');
        }
    }
    
    // Task CRUD operations
    function addTask(taskData) {
        const newTask = {
            id: Date.now().toString(),
            name: taskData.name,
            description: taskData.description,
            date: taskData.date,
            estimatedTime: parseInt(taskData.estimatedTime),
            elapsedTime: 0,
            actualTime: null,
            status: 'Not Started',
            progress: 0,
            notes: '',
            recurrence: taskData.recurrence,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        hideTaskForm();
        updateDashboard();
    }
    
    function updateTask(taskId, taskData) {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                name: taskData.name,
                description: taskData.description,
                date: taskData.date,
                estimatedTime: parseInt(taskData.estimatedTime),
                recurrence: taskData.recurrence
            };
            
            saveTasks();
            renderTasks();
            hideTaskForm();
            updateDashboard();
        }
    }
    
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        updateDashboard();
        
        if (currentTaskId === taskId) {
            stopTaskTimer();
        }
    }
    
    function updateTaskProgress(taskId, progress, notes, actualTime) {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].progress = progress;
            tasks[taskIndex].notes = notes;
            tasks[taskIndex].actualTime = actualTime;
            
            // Update status based on progress
            if (progress >= 100) {
                tasks[taskIndex].status = 'Complete';
            } else if (progress > 0) {
                tasks[taskIndex].status = 'In Progress';
            } else {
                tasks[taskIndex].status = 'Not Started';
            }
            
            saveTasks();
            renderTasks();
            updateDashboard();
        }
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Task form handling
    function showAddTaskForm() {
        editingTaskId = null;
        taskFormTitle.textContent = 'Add New Task';
        editTaskName.value = '';
        editTaskDate.valueAsDate = new Date();
        editTaskTime.value = '30';
        editTaskDesc.value = '';
        editTaskRecurrence.value = 'none';
        taskFormModal.classList.remove('hidden');
    }
    
    function showEditTaskForm(task) {
        editingTaskId = task.id;
        taskFormTitle.textContent = 'Edit Task';
        editTaskName.value = task.name;
        editTaskDate.value = task.date;
        editTaskTime.value = task.estimatedTime;
        editTaskDesc.value = task.description || '';
        editTaskRecurrence.value = task.recurrence || 'none';
        taskFormModal.classList.remove('hidden');
    }
    
    function hideTaskForm() {
        taskFormModal.classList.add('hidden');
    }
    
    // Progress modal handling
    function showProgressModal(taskId, progress, notes, actualTime) {
        document.getElementById('progress-input').value = progress;
        document.getElementById('progress-value').textContent = `${progress}%`;
        document.getElementById('progress-notes').value = notes || '';
        document.getElementById('actual-time-input').value = actualTime || '';
        document.getElementById('progress-modal').classList.remove('hidden');
        activeProgressTaskId = taskId;
    }
    
    function hideProgressModal() {
        document.getElementById('progress-modal').classList.add('hidden');
        activeProgressTaskId = null;
    }
    
    // Dashboard updates
    function updateDashboard() {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = tasks.filter(task => task.date === today);
        
        // Calculate today's study time
        const todayEstimated = todayTasks.reduce((sum, task) => sum + task.estimatedTime, 0);
        const todayActual = todayTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);
        
        document.getElementById('today-estimated').textContent = `${Math.floor(todayEstimated / 60)}h ${todayEstimated % 60}m`;
        document.getElementById('today-actual').textContent = `${Math.floor(todayActual / 60)}h ${todayActual % 60}m`;
        
        // Calculate weekly completion
        const completedTasks = tasks.filter(task => task.status === 'Complete').length;
        const totalTasks = tasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        document.getElementById('weekly-completion').textContent = `${completionRate}%`;
        
        // Calculate accuracy (simplified for demo)
        const accurateTasks = tasks.filter(task => 
            task.actualTime && 
            Math.abs(task.actualTime - task.estimatedTime) <= 10
        ).length;
        const accuracyRate = tasks.filter(task => task.actualTime).length > 0 ? 
            Math.round((accurateTasks / tasks.filter(task => task.actualTime).length) * 100) : 0;
        document.getElementById('accuracy-rate').textContent = `${accuracyRate}%`;
        
        // Update charts (simplified for demo)
        updateCharts();
    }
    
    function updateCharts() {
        // Simplified - in a real app you'd calculate these from actual data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const estimatedData = days.map(() => Math.floor(Math.random() * 180) + 30);
        const actualData = estimatedData.map(val => Math.floor(val * (0.8 + Math.random() * 0.4)));
        
        dailyChart.data.datasets[0].data = estimatedData;
        dailyChart.data.datasets[1].data = actualData;
        dailyChart.update();
        
        const accurate = Math.floor(Math.random() * 40) + 30;
        const over = Math.floor(Math.random() * 30) + 20;
        const under = 100 - accurate - over;
        
        accuracyChart.data.datasets[0].data = [accurate, over, under];
        accuracyChart.update();
    }
    
    // Helper functions
    function getStatusClass(status) {
        switch (status) {
            case 'Complete': return 'task-status-complete';
            case 'In Progress': return 'task-status-in-progress';
            default: return 'task-status-not-started';
        }
    }
    
    function getStatusIcon(status) {
        switch (status) {
            case 'Complete': return 'fa-check-circle';
            case 'In Progress': return 'fa-spinner fa-pulse';
            default: return 'fa-circle';
        }
    }
    
    function formatDate(dateString) {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    // Event listeners
    function setupEventListeners() {
        // Task form
        addTaskBtn.addEventListener('click', showAddTaskForm);
        
        saveTaskBtn.addEventListener('click', () => {
            const name = editTaskName.value.trim();
            const date = editTaskDate.value;
            const estimatedTime = editTaskTime.value.trim();
            const description = editTaskDesc.value.trim();
            const recurrence = editTaskRecurrence.value;
            
            if (name && date && estimatedTime) {
                const taskData = { name, date, estimatedTime, description, recurrence };
                
                if (editingTaskId) {
                    updateTask(editingTaskId, taskData);
                } else {
                    addTask(taskData);
                }
            } else {
                alert('Please fill in all required fields (marked with *)');
            }
        });
        
        // Progress modal
        document.getElementById('progress-input').addEventListener('input', function() {
            document.getElementById('progress-value').textContent = `${this.value}%`;
        });
        
        document.getElementById('save-progress-btn').addEventListener('click', function() {
            if (activeProgressTaskId) {
                updateTaskProgress(
                    activeProgressTaskId,
                    parseInt(document.getElementById('progress-input').value),
                    document.getElementById('progress-notes').value,
                    parseInt(document.getElementById('actual-time-input').value)
                );
                hideProgressModal();
            }
        });
        
        document.getElementById('cancel-progress-btn').addEventListener('click', hideProgressModal);
        
        // View switcher
        document.getElementById('today-tasks-btn').addEventListener('click', function() {
            document.querySelectorAll('#today-tasks-btn, #upcoming-tasks-btn, #recurring-tasks-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white');
                btn.classList.add('bg-white', 'text-gray-700', 'border');
            });
            this.classList.add('bg-indigo-600', 'text-white');
            this.classList.remove('bg-white', 'text-gray-700', 'border');
            renderTasks('today');
        });
        
        document.getElementById('upcoming-tasks-btn').addEventListener('click', function() {
            document.querySelectorAll('#today-tasks-btn, #upcoming-tasks-btn, #recurring-tasks-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white');
                btn.classList.add('bg-white', 'text-gray-700', 'border');
            });
            this.classList.add('bg-indigo-600', 'text-white');
            this.classList.remove('bg-white', 'text-gray-700', 'border');
            renderTasks('upcoming');
        });
        
        document.getElementById('recurring-tasks-btn').addEventListener('click', function() {
            document.querySelectorAll('#today-tasks-btn, #upcoming-tasks-btn, #recurring-tasks-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white');
                btn.classList.add('bg-white', 'text-gray-700', 'border');
            });
            this.classList.add('bg-indigo-600', 'text-white');
            this.classList.remove('bg-white', 'text-gray-700', 'border');
            renderTasks('recurring');
        });
    }
    
    // Initialize the app
    init();
});
