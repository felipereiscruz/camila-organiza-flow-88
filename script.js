// Global state
let data = {
    faculdade: [],
    trabalho: [],
    academia: [],
    gj: [],
    outros: [],
    workoutPlan: null
};

let expandedSections = {
    faculdade: true,
    trabalho: true,
    academia: true,
    gj: true,
    outros: true
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderAll();
});

// Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show selected page
    document.getElementById(pageId + '-page').classList.remove('hidden');
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(pageId + '-nav').classList.add('active');
}

// Data persistence
function saveData() {
    localStorage.setItem('organizacao-camila', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('organizacao-camila');
    if (saved) {
        data = JSON.parse(saved);
    }
}

// Section management
function toggleSection(section) {
    expandedSections[section] = !expandedSections[section];
    const content = document.getElementById(section + '-content');
    const icon = document.getElementById(section + '-icon');
    
    if (expandedSections[section]) {
        content.classList.remove('collapsed');
        icon.textContent = '▼';
        icon.classList.remove('rotated');
    } else {
        content.classList.add('collapsed');
        icon.textContent = '▶';
        icon.classList.add('rotated');
    }
}

function clearSection(section) {
    if (confirm('Tem certeza que deseja limpar esta seção?')) {
        if (section === 'academia') {
            data.academia = [];
            data.workoutPlan = null;
        } else {
            data[section] = [];
        }
        saveData();
        renderSection(section);
    }
}

// Task management
function addTask(section) {
    const newTask = {
        id: Date.now().toString(),
        text: '',
        date: '',
        time: '',
        link: '',
        urgent: false
    };
    
    data[section].push(newTask);
    saveData();
    renderSection(section);
    
    // Focus on the new task input
    setTimeout(() => {
        const inputs = document.querySelectorAll(`#${section}-tasks .task-item input[type="text"]`);
        const lastInput = inputs[inputs.length - 1];
        if (lastInput) lastInput.focus();
    }, 100);
}

function updateTask(section, taskId, field, value) {
    const task = data[section].find(t => t.id === taskId);
    if (task) {
        if (field === 'urgent') {
            task[field] = value;
        } else {
            task[field] = value;
        }
        saveData();
        
        // Update urgent styling
        if (field === 'urgent') {
            renderSection(section);
        }
    }
}

function removeTask(section, taskId) {
    data[section] = data[section].filter(t => t.id !== taskId);
    saveData();
    renderSection(section);
}

// Workout plan management
function showWorkoutForm() {
    document.getElementById('workout-form').style.display = 'block';
    document.getElementById('workout-name').focus();
}

function hideWorkoutForm() {
    document.getElementById('workout-form').style.display = 'none';
    clearWorkoutForm();
}

function clearWorkoutForm() {
    document.getElementById('workout-name').value = '';
    ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].forEach(day => {
        document.getElementById(day).value = '';
    });
}

function saveWorkoutPlan() {
    const name = document.getElementById('workout-name').value.trim();
    if (!name) {
        alert('Por favor, insira um nome para o plano de treino.');
        return;
    }
    
    const schedule = {};
    ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].forEach(day => {
        schedule[day] = document.getElementById(day).value.trim();
    });
    
    data.workoutPlan = { name, schedule };
    saveData();
    hideWorkoutForm();
    renderWorkoutPlan();
}

function editWorkoutPlan() {
    if (data.workoutPlan) {
        document.getElementById('workout-name').value = data.workoutPlan.name;
        Object.keys(data.workoutPlan.schedule).forEach(day => {
            const input = document.getElementById(day);
            if (input) {
                input.value = data.workoutPlan.schedule[day];
            }
        });
        showWorkoutForm();
    }
}

function removeWorkoutPlan() {
    if (confirm('Tem certeza que deseja remover este plano de treino?')) {
        data.workoutPlan = null;
        saveData();
        renderWorkoutPlan();
    }
}

// Rendering functions
function renderAll() {
    renderSection('faculdade');
    renderSection('trabalho');
    renderSection('gj');
    renderSection('outros');
    renderWorkoutPlan();
}

function renderSection(section) {
    if (section === 'academia') {
        renderWorkoutPlan();
        return;
    }
    
    const container = document.getElementById(section + '-tasks');
    container.innerHTML = '';
    
    data[section].forEach(task => {
        const taskElement = createTaskElement(section, task);
        container.appendChild(taskElement);
    });
}

function createTaskElement(section, task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.urgent ? 'urgent' : ''}`;
    
    div.innerHTML = `
        <input type="checkbox" ${task.urgent ? 'checked' : ''} 
               onchange="updateTask('${section}', '${task.id}', 'urgent', this.checked)"
               title="Marcar como urgente">
        <input type="text" value="${task.text}" 
               oninput="updateTask('${section}', '${task.id}', 'text', this.value)"
               placeholder="Descreva a tarefa...">
        <input type="date" value="${task.date}"
               onchange="updateTask('${section}', '${task.id}', 'date', this.value)">
        <input type="time" value="${task.time}"
               onchange="updateTask('${section}', '${task.id}', 'time', this.value)">
        <input type="text" value="${task.link}" 
               oninput="updateTask('${section}', '${task.id}', 'link', this.value)"
               placeholder="Link (opcional)">
        <button class="task-remove" onclick="removeTask('${section}', '${task.id}')">×</button>
    `;
    
    return div;
}

function renderWorkoutPlan() {
    const container = document.getElementById('workout-plans');
    container.innerHTML = '';
    
    if (data.workoutPlan) {
        const div = document.createElement('div');
        div.className = 'workout-plan';
        
        let scheduleHtml = '';
        const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
        const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        
        days.forEach((day, index) => {
            const exercise = data.workoutPlan.schedule[day] || 'Descanso';
            scheduleHtml += `
                <div class="workout-day">
                    <strong>${dayNames[index]}:</strong>
                    <span>${exercise}</span>
                </div>
            `;
        });
        
        div.innerHTML = `
            <h3>${data.workoutPlan.name}</h3>
            ${scheduleHtml}
            <div class="workout-actions">
                <button onclick="editWorkoutPlan()" class="btn btn-sm">Editar</button>
                <button onclick="removeWorkoutPlan()" class="btn btn-sm btn-danger ml-2">Remover</button>
            </div>
        `;
        
        container.appendChild(div);
    }
}