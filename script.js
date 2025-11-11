// Элементы DOM
const elements = {
    openFormBtn: document.getElementById('openFormBtn'),
    modalOverlay: document.getElementById('modalOverlay'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    feedbackForm: document.getElementById('feedbackForm'),
    messageContainer: document.getElementById('messageContainer'),
    submitBtn: document.getElementById('submitBtn')
};

// Константы
const constants = {
    STORAGE_KEY: 'feedbackFormData',
    FORMSPREE_URL: 'https://formspree.io/f/xpzvqkbg'
};

// Состояние приложения
const state = {
    isModalOpen: false
};

// Функция для отображения сообщения
function showMessage(message, isSuccess) {
    elements.messageContainer.textContent = message;
    elements.messageContainer.className = `message ${isSuccess ? 'success' : 'error'}`;
    elements.messageContainer.style.display = 'block';
    
    // Автоматически скрыть сообщение через 5 секунд
    setTimeout(() => {
        elements.messageContainer.style.display = 'none';
    }, 5000);
}

// Функция для валидации формы
function validateForm() {
    let isValid = true;
    
    // Сброс предыдущих ошибок
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('invalid');
    });
    
    // Проверка обязательных полей
    const fullName = document.getElementById('fullName').value;
    if (!fullName || fullName.length < 2) {
        document.querySelector('#fullName').closest('.form-group').classList.add('invalid');
        isValid = false;
    }
    
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        document.querySelector('#email').closest('.form-group').classList.add('invalid');
        isValid = false;
    }
    
    const message = document.getElementById('message').value;
    if (!message || message.length < 10) {
        document.querySelector('#message').closest('.form-group').classList.add('invalid');
        isValid = false;
    }
    
    const privacyPolicyChecked = document.getElementById('privacyPolicy').checked;
    if (!privacyPolicyChecked) {
        document.querySelector('.checkbox-group').classList.add('invalid');
        isValid = false;
    }
    
    return isValid;
}

// Функция для сохранения данных формы в localStorage
function saveFormData() {
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        organization: document.getElementById('organization').value,
        message: document.getElementById('message').value,
        privacyPolicy: document.getElementById('privacyPolicy').checked
    };
    
    localStorage.setItem(constants.STORAGE_KEY, JSON.stringify(formData));
}

// Функция для загрузки данных формы из localStorage
function loadFormData() {
    const savedData = localStorage.getItem(constants.STORAGE_KEY);
    
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            document.getElementById('fullName').value = formData.fullName || '';
            document.getElementById('email').value = formData.email || '';
            document.getElementById('phone').value = formData.phone || '';
            document.getElementById('organization').value = formData.organization || '';
            document.getElementById('message').value = formData.message || '';
            document.getElementById('privacyPolicy').checked = formData.privacyPolicy || false;
        } catch (error) {
            console.error('Ошибка при загрузке данных из localStorage:', error);
        }
    }
}

// Функция для очистки данных формы в localStorage
function clearFormData() {
    localStorage.removeItem(constants.STORAGE_KEY);
}

// Функция для открытия модального окна
function openModal() {
    elements.modalOverlay.classList.add('active');
    state.isModalOpen = true;
    
    // Изменяем URL с помощью History API
    const newUrl = `${window.location


gin}${window.location.pathname}#feedback`;
    window.history.pushState({ modal: true }, '', newUrl);
    
    // Загружаем сохраненные данные
    loadFormData();
    
    // Фокусируемся на первом поле формы
    document.getElementById('fullName').focus();
}

// Функция для закрытия модального окна
function closeModal() {
    elements.modalOverlay.classList.remove('active');
    state.isModalOpen = false;
    
    // Возвращаем исходный URL
    if (window.location.hash === '#feedback') {
        window.history.pushState(null, '', window.location.pathname);
    }
    
    // Скрываем сообщения
    elements.messageContainer.style.display = 'none';
}

// Обработчик отправки формы
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Валидация формы
    if (!validateForm()) {
        showMessage('Пожалуйста, заполните все обязательные поля корректно', false);
        return;
    }
    
    // Показываем индикатор загрузки
    elements.submitBtn.disabled = true;
    elements.submitBtn.classList.add('loading');
    
    // Собираем данные формы
    const formData = new FormData(elements.feedbackForm);
    const data = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        organization: formData.get('organization'),
        message: formData.get('message'),
        privacyPolicy: formData.get('privacyPolicy') === 'on'
    };
    
    try {
        // Отправляем данные на сервер
        const response = await fetch(constants.FORMSPREE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showMessage('Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', true);
            elements.feedbackForm.reset();
            clearFormData();
        } else {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
    } catch (error) {
        console.error('Ошибка при отправке формы:', error);
        showMessage('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.', false);
    } finally {
        // Восстанавливаем кнопку
        elements.submitBtn.disabled = false;
        elements.submitBtn.classList.remove('loading');
    }
}

// Обработчик события popstate (нажатие кнопки "Назад")
function handlePopState(event) {
    if (state.isModalOpen) {
        closeModal();
    }
}

// Обработчик клика вне модального окна
function handleOverlayClick(event) {
    if (event.target === elements.modalOverlay) {
        closeModal();
    }
}

// Обработчик нажатия клавиши Escape
function handleKeyDown(event) {
    if (event.key === 'Escape' && state.isModalOpen) {
        closeModal();
    }
}

// Инициализация событий
function initEventListeners() {
    // Открытие формы
    elements.openFormBtn.addEventListener('click', openModal);
    
    // Закрытие формы
    elements.closeModalBtn.addEventListener('click', closeModal);
    
    // Обработка отправки формы
    elements.feedbackForm.addEventListener('submit', handleFormSubmit);
    
    // Сохранение данных формы при изменении
    elements.feedbackForm.addEventListener('input', saveFormData);
    
    // Обработка нажатия кнопки "Назад"
    window.addEventListener('popstate', handlePopState);
    
    // Обработка клика по оверлею
    elements.modalOverlay.addEventListener('click', handleOverlayClick);
    
    // Обработка нажатия клавиши Escape
    document.addEventListener('keydown', handleKeyDown);
}

// Проверка состояния при загрузке страницы
function checkInitialState() {
    // Проверяем, открыта ли форма при загрузке страницы (если есть хэш)
    if (window.location.hash === '#feedback') {
        state.isModalOpen = true;
        elements.modalOverlay.classList.add('active');
        loadFormData();
    }
}

// Инициализация приложения
function init() {
    initEventListeners();
    checkInitialState();
}

// Запуск прило


жения после загрузки DOM
document.addEventListener('DOMContentLoaded', init);.ori
