document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const currentTimeElement = document.getElementById('current-time');
    const currentDateElement = document.getElementById('current-date');
    const timerDisplay = document.getElementById('timer-display');
    const startTimerBtn = document.getElementById('start-timer');
    const stopTimerBtn = document.getElementById('stop-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const currentTaskLabel = document.getElementById('current-task-label');
    const currentTaskName = document.getElementById('current-task-name');
    
    const addTaskBtn = document.getElementById('add-task-btn');
    const addTaskForm = document.getElementById('add-task-form');
    const taskNameInput = document.getElementById('task-name');
    const taskTimeInput = document.getElementById('task-time');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const tasksTableBody = document.getElementById('tasks-table-body');
    const noTasksRow = document.getElementById('no-tasks-row');
    
    const addMaterialBtn = document.getElementById('add-material-btn');
    const addMaterialForm = document.getElementById('add-material-form');
    const materialNameInput = document.getElementById('material-name');
    const materialUrlInput = document.getElementById('material-url');
    const saveMaterialBtn = document.getElementById('save-material-btn');
    const materialsGrid = document.getElementById('materials-grid');
    
    const progressModal = document.getElementById('progress-modal');
    const progressInput = document.getElementById('progress-input');
    const progressValue = document.getElementById('progress-value');
    const progressNotes = document.getElementById('progress-notes');
    const saveProgressBtn = document.getElementById('save-progress-btn');
    const cancelProgressBtn = document.getElementById('cancel-progress-btn');

    // State variables
    let timerInterval;
    let seconds = 0;
    let isTimerRunning = false;
    let currentTaskId = null;
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let materials = JSON.parse(localStorage.getItem('materials')) || [
        { name: 'YouTube', url: 'https://www.youtube.com', icon: 'youtube', color: 'red' },
        { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'robot', color: 'green' },
        { name: 'Google Docs', url: 'https://docs.google.com', icon: 'google-drive', color: 'blue' },
        { name: 'GitHub', url: 'https://github.com', icon: 'github', color: 'gray' },
        { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'stack-overflow', color: 'orange' }
    ];
    let activeProgressTaskId = null;

    // Initialize the app
    function init() {
        updateDateTime();
        setInterval(updateDateTime, 1000);
        renderTasks();
        renderMaterials();
        setupEventListeners();
    }

    // Update current time and date
    function updateDateTime() {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        
        currentTimeElement.textContent = now.toLocaleTimeString(undefined, timeOptions);
        currentDateElement.textContent = now.toLocaleDateString(undefined, dateOptions);
    }

    // Timer functions
    function startTimer(taskId = null, taskName = null) {
        if (!isTimerRunning) {
            isTimerRunning = true;
            timerInterval = setInterval(updateTimer, 1000);
            startTimerBtn.disabled = true;
            stopTimerBtn.disabled = false;
            
            if (taskId && taskName) {
                currentTaskId = taskId;
                currentTaskName.textContent = taskName;
                currentTaskLabel.classList.remove('hidden');
                
                // Update task status to "In Progress"
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].status = 'In Progress';
                    saveTasks();
                    renderTasks();
                }
            }
        }
    }

    function stopTimer() {
        if (isTimerRunning) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            startTimerBtn.disabled = false;
            stopTimerBtn.disabled = true;
            
            if (currentTaskId) {
                currentTaskLabel.classList.add('hidden');
                currentTaskId = null;
            }
        }
    }

    function resetTimer() {
        stopTimer();
        seconds = 0;
        updateTimerDisplay();
    }

    function updateTimer() {
        seconds++;
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        timerDisplay.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Task management functions
    function addTask(name, estimatedTime) {
        const newTask = {
            id: Date.now().toString(),
            name,
            estimatedTime: parseInt(estimatedTime),
            elapsedTime: 0,
            status: 'Not Started',
            progress: 0,
            notes: '',
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        hideAddTaskForm();
    }

    function updateTaskProgress(taskId, progress, notes) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].progress = progress;
            tasks[taskIndex].notes = notes;
            
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
        }
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        
        // If the deleted task was the current task, stop the timer
        if (currentTaskId === taskId) {
            stopTimer();
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        if (tasks.length === 0) {
            noTasksRow.classList.remove('hidden');
            tasksTableBody.innerHTML = '';
            tasksTableBody.appendChild(noTasksRow);
            return;
        }
        
        noTasksRow.classList.add('hidden');
        tasksTableBody.innerHTML = '';
        
        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.className = `task-row ${task.status.toLowerCase().replace(' ', '-')}`;
            row.dataset.taskId = task.id;
            
            // Status cell
            const statusCell = document.createElement('td');
            statusCell.className = 'px-6 py-4 whitespace-nowrap';
            
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
            
            // Task name cell
            const nameCell = document.createElement('td');
            nameCell.className = 'px-6 py-4 whitespace-nowrap';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'text-sm font-medium text-gray-900';
            nameDiv.textContent = task.name;
            
            nameCell.appendChild(nameDiv);
            row.appendChild(nameCell);
            
            // Time cell
            const timeCell = document.createElement('td');
            timeCell.className = 'px-6 py-4 whitespace-nowrap';
            
            const timeDiv = document.createElement('div');
            timeDiv.className = 'text-sm text-gray-500';
            
            const estimatedTimeSpan = document.createElement('span');
            estimatedTimeSpan.textContent = `${task.estimatedTime} min`;
            
            timeDiv.appendChild(estimatedTimeSpan);
            
            if (task.elapsedTime > 0) {
                const elapsedTimeSpan = document.createElement('span');
                elapsedTimeSpan.className = 'ml-2 text-indigo-600';
                elapsedTimeSpan.textContent = `(${Math.floor(task.elapsedTime / 60)}m ${task.elapsedTime % 60}s)`;
                timeDiv.appendChild(elapsedTimeSpan);
            }
            
            timeCell.appendChild(timeDiv);
            row.appendChild(timeCell);
            
            // Progress cell
            const progressCell = document.createElement('td');
            progressCell.className = 'px-6 py-4 whitespace-nowrap';
            
            const progressDiv = document.createElement('div');
            progressDiv.className = 'flex items-center';
            
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container w-full mr-2';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.style.width = `${task.progress}%`;
            
            progressContainer.appendChild(progressBar);
            progressDiv.appendChild(progressContainer);
            
            const progressText = document.createElement('span');
            progressText.className = 'text-xs font-medium text-gray-500';
            progressText.textContent = `${task.progress}%`;
            
            progressDiv.appendChild(progressText);
            progressCell.appendChild(progressDiv);
            row.appendChild(progressCell);
            
            // Actions cell
            const actionsCell = document.createElement('td');
            actionsCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium';
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'flex space-x-2';
            
            // Start/Stop button
            const timerBtn = document.createElement('button');
            timerBtn.className = `px-2 py-1 rounded-md ${currentTaskId === task.id ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'}`;
            
            const timerIcon = document.createElement('i');
            timerIcon.className = `fas ${currentTaskId === task.id ? 'fa-stop' : 'fa-play'}`;
            
            timerBtn.appendChild(timerIcon);
            timerBtn.addEventListener('click', () => {
                if (currentTaskId === task.id) {
                    stopTimer();
                } else {
                    if (isTimerRunning) {
                        stopTimer();
                    }
                    startTimer(task.id, task.name);
                }
            });
            
            actionsDiv.appendChild(timerBtn);
            
            // Progress button
            const progressBtn = document.createElement('button');
            progressBtn.className = 'px-2 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200';
            
            const progressBtnIcon = document.createElement('i');
            progressBtnIcon.className = 'fas fa-chart-line';
            
            progressBtn.appendChild(progressBtnIcon);
            progressBtn.addEventListener('click', () => showProgressModal(task.id, task.progress, task.notes));
            
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

    function showAddTaskForm() {
        addTaskForm.classList.remove('hidden');
        taskNameInput.focus();
    }

    function hideAddTaskForm() {
        addTaskForm.classList.add('hidden');
        taskNameInput.value = '';
        taskTimeInput.value = '30';
    }

    function showProgressModal(taskId, progress, notes) {
        activeProgressTaskId = taskId;
        progressInput.value = progress;
        progressValue.textContent = `${progress}%`;
        progressNotes.value = notes || '';
        progressModal.classList.remove('hidden');
    }

    function hideProgressModal() {
        progressModal.classList.add('hidden');
        activeProgressTaskId = null;
    }

    // Study materials functions
    function addMaterial(name, url) {
        // Extract domain for icon
        let icon = 'link';
        let color = 'indigo';
        
        if (url.includes('youtube.com')) {
            icon = 'youtube';
            color = 'red';
        } else if (url.includes('openai.com')) {
            icon = 'robot';
            color = 'green';
        } else if (url.includes('google.com') || url.includes('docs.google.com')) {
            icon = 'google-drive';
            color = 'blue';
        } else if (url.includes('github.com')) {
            icon = 'github';
            color = 'gray';
        } else if (url.includes('stackoverflow.com')) {
            icon = 'stack-overflow';
            color = 'orange';
        }
        
        const newMaterial = {
            id: Date.now().toString(),
            name,
            url,
            icon,
            color
        };
        
        materials.push(newMaterial);
        saveMaterials();
        renderMaterials();
        hideAddMaterialForm();
    }

    function saveMaterials() {
        localStorage.setItem('materials', JSON.stringify(materials));
    }

    function renderMaterials() {
        materialsGrid.innerHTML = '';
        
        materials.forEach(material => {
            const materialCard = document.createElement('div');
            materialCard.className = 'material-card bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center transition-all hover:shadow-lg cursor-pointer';
            materialCard.dataset.url = material.url;
            
            const icon = document.createElement('i');
            icon.className = `fab fa-${material.icon} text-3xl text-${material.color}-500 mb-2`;
            
            const name = document.createElement('span');
            name.className = 'text-sm font-medium text-gray-800 text-center';
            name.textContent = material.name;
            
            materialCard.appendChild(icon);
            materialCard.appendChild(name);
            
            materialCard.addEventListener('click', () => {
                window.open(material.url, '_blank');
            });
            
            materialsGrid.appendChild(materialCard);
        });
    }

    function showAddMaterialForm() {
        addMaterialForm.classList.remove('hidden');
        materialNameInput.focus();
    }

    function hideAddMaterialForm() {
        addMaterialForm.classList.add('hidden');
        materialNameInput.value = '';
        materialUrlInput.value = '';
    }

    // Event listeners setup
    function setupEventListeners() {
        // Timer controls
        startTimerBtn.addEventListener('click', () => startTimer());
        stopTimerBtn.addEventListener('click', stopTimer);
        resetTimerBtn.addEventListener('click', resetTimer);
        
        // Task management
        addTaskBtn.addEventListener('click', showAddTaskForm);
        saveTaskBtn.addEventListener('click', () => {
            const name = taskNameInput.value.trim();
            const estimatedTime = taskTimeInput.value.trim();
            
            if (name && estimatedTime) {
                addTask(name, estimatedTime);
            } else {
                alert('Please fill in all fields');
            }
        });
        
        // Study materials
        addMaterialBtn.addEventListener('click', showAddMaterialForm);
        saveMaterialBtn.addEventListener('click', () => {
            const name = materialNameInput.value.trim();
            const url = materialUrlInput.value.trim();
            
            if (name && url) {
                // Validate URL
                try {
                    new URL(url);
                    addMaterial(name, url);
                } catch (e) {
                    alert('Please enter a valid URL (include http:// or https://)');
                }
            } else {
                alert('Please fill in all fields');
            }
        });
        
        // Progress modal
        progressInput.addEventListener('input', () => {
            progressValue.textContent = `${progressInput.value}%`;
        });
        
        saveProgressBtn.addEventListener('click', () => {
            if (activeProgressTaskId) {
                updateTaskProgress(
                    activeProgressTaskId,
                    parseInt(progressInput.value),
                    progressNotes.value
                );
                hideProgressModal();
            }
        });
        
        cancelProgressBtn.addEventListener('click', hideProgressModal);
        
        // Click outside modal to close
        progressModal.addEventListener('click', (e) => {
            if (e.target === progressModal) {
                hideProgressModal();
            }
        });
        
        // Material cards (delegated event)
        materialsGrid.addEventListener('click', (e) => {
            const materialCard = e.target.closest('.material-card');
            if (materialCard) {
                const url = materialCard.dataset.url;
                window.open(url, '_blank');
            }
        });
    }

    // Initialize the app
    init();
});