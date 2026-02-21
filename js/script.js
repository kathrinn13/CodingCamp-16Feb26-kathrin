const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';
let tasks = [];
let editingId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
    setDateToToday();
    renderTasks();
});

// Setup event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });
}

// Set date input to today
function setDateToToday() {
    const today = new Date().toISOString().split('T')[0];
    taskDate.value = today;
}

// Add task
function addTask() {
    const text = taskInput.value.trim();
    const date = taskDate.value;

    if (!text) {
        alert('Please enter a task!');
        return;
    }

    if (!date) {
        alert('Please select a date!');
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        date: date,
        completed: false
    };

    tasks.push(task);
    saveTasks();
    taskInput.value = '';
    setDateToToday();
    renderTasks();
    taskInput.focus();
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Toggle complete status
function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Open edit modal
function openEditModal(id) {
    editingId = id;
    const task = tasks.find(t => t.id === id);

    document.getElementById('editTaskInput').value = task.text;
    document.getElementById('editTaskDate').value = task.date;
    document.getElementById('editModal').classList.add('show');
    document.getElementById('editTaskInput').focus();
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    editingId = null;
}

// Save edit
function saveEdit() {
    const newText = document.getElementById('editTaskInput').value.trim();
    const newDate = document.getElementById('editTaskDate').value;

    if (!newText) {
        alert('Please enter a task!');
        return;
    }

    if (!newDate) {
        alert('Please select a date!');
        return;
    }

    const task = tasks.find(t => t.id === editingId);
    if (task) {
        task.text = newText;
        task.date = newDate;
        saveTasks();
        renderTasks();
        closeEditModal();
    }
}

// Filter tasks based on current filter
function getFilteredTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);

        switch (currentFilter) {
            case 'today':
                return taskDate.getTime() === today.getTime();

            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return taskDate >= weekStart && taskDate <= weekEnd;

            case 'month':
                return taskDate.getMonth() === today.getMonth() &&
                    taskDate.getFullYear() === today.getFullYear();

            case 'year':
                return taskDate.getFullYear() === today.getFullYear();

            case 'all':
            default:
                return true;
        }
    });
}

// Format date for display
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
}

// Render tasks
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        emptyMessage.classList.add('show');
        return;
    }

    emptyMessage.classList.remove('show');

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) li.classList.add('completed');

        li.innerHTML = `
            <div class="task-content" onclick="toggleComplete(${task.id})">
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="task-date-display">${formatDate(task.date)}</span>
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="openEditModal(${task.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;

        taskList.appendChild(li);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Local Storage
function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('todoTasks');
    tasks = saved ? JSON.parse(saved) : [];
}

// Modal controls
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('editModal');
    const saveBtn = document.getElementById('saveEditBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');

    if (saveBtn) {
        saveBtn.addEventListener('click', saveEdit);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEditModal);
    }

    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }

    const editInput = document.getElementById('editTaskInput');
    if (editInput) {
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }
});