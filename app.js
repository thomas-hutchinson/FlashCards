// ===== Flash Cards App =====

// State Management
const state = {
    categories: [],
    currentCategoryId: null,
    currentDeckId: null,
    currentView: 'categories',
    studyCards: [],
    studyIndex: 0,
    editingItem: null,
    editingType: null
};

// DOM Elements
const elements = {
    // Header
    backBtn: document.getElementById('backBtn'),
    headerTitle: document.getElementById('headerTitle'),
    menuBtn: document.getElementById('menuBtn'),
    
    // Views
    categoriesView: document.getElementById('categoriesView'),
    decksView: document.getElementById('decksView'),
    cardsView: document.getElementById('cardsView'),
    studyView: document.getElementById('studyView'),
    
    // Lists
    categoriesList: document.getElementById('categoriesList'),
    decksList: document.getElementById('decksList'),
    cardsList: document.getElementById('cardsList'),
    
    // Empty States
    emptyCategoriesState: document.getElementById('emptyCategoriesState'),
    emptyDecksState: document.getElementById('emptyDecksState'),
    emptyCardsState: document.getElementById('emptyCardsState'),
    
    // Buttons
    addCategoryBtn: document.getElementById('addCategoryBtn'),
    addDeckBtn: document.getElementById('addDeckBtn'),
    addCardBtn: document.getElementById('addCardBtn'),
    studyBtn: document.getElementById('studyBtn'),
    
    // Titles
    decksTitle: document.getElementById('decksTitle'),
    cardsTitle: document.getElementById('cardsTitle'),
    
    // Modal Overlay
    modalOverlay: document.getElementById('modalOverlay'),
    
    // Category Modal
    categoryModal: document.getElementById('categoryModal'),
    categoryModalTitle: document.getElementById('categoryModalTitle'),
    categoryForm: document.getElementById('categoryForm'),
    categoryName: document.getElementById('categoryName'),
    categoryColor: document.getElementById('categoryColor'),
    categoryIcon: document.getElementById('categoryIcon'),
    
    // Deck Modal
    deckModal: document.getElementById('deckModal'),
    deckModalTitle: document.getElementById('deckModalTitle'),
    deckForm: document.getElementById('deckForm'),
    deckName: document.getElementById('deckName'),
    deckDescription: document.getElementById('deckDescription'),
    
    // Card Modal
    cardModal: document.getElementById('cardModal'),
    cardModalTitle: document.getElementById('cardModalTitle'),
    cardForm: document.getElementById('cardForm'),
    cardFront: document.getElementById('cardFront'),
    cardBack: document.getElementById('cardBack'),
    cardImage: document.getElementById('cardImage'),
    imagePreview: document.getElementById('imagePreview'),
    removeImageBtn: document.getElementById('removeImageBtn'),
    
    // Context Menu
    contextMenu: document.getElementById('contextMenu'),
    editItemBtn: document.getElementById('editItemBtn'),
    deleteItemBtn: document.getElementById('deleteItemBtn'),
    
    // Confirm Modal
    confirmModal: document.getElementById('confirmModal'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    
    // Study View
    flashcard: document.getElementById('flashcard'),
    cardFrontImage: document.getElementById('cardFrontImage'),
    cardFrontText: document.getElementById('cardFrontText'),
    cardBackText: document.getElementById('cardBackText'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    prevCardBtn: document.getElementById('prevCardBtn'),
    nextCardBtn: document.getElementById('nextCardBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    
    // Toast
    toast: document.getElementById('toast')
};

// ===== Utility Functions =====

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveData() {
    localStorage.setItem('flashCardsData', JSON.stringify(state.categories));
}

function loadData() {
    const data = localStorage.getItem('flashCardsData');
    if (data) {
        state.categories = JSON.parse(data);
    }
}

function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} show`;
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function getCurrentCategory() {
    return state.categories.find(c => c.id === state.currentCategoryId);
}

function getCurrentDeck() {
    const category = getCurrentCategory();
    if (!category) return null;
    return category.decks.find(d => d.id === state.currentDeckId);
}

// ===== Navigation =====

function navigateTo(view) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    // Show target view
    const targetView = document.getElementById(`${view}View`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    state.currentView = view;
    updateHeader();
    
    // Render appropriate content
    switch (view) {
        case 'categories':
            renderCategories();
            break;
        case 'decks':
            renderDecks();
            break;
        case 'cards':
            renderCards();
            break;
        case 'study':
            initStudyMode();
            break;
    }
}

function updateHeader() {
    const category = getCurrentCategory();
    const deck = getCurrentDeck();
    
    switch (state.currentView) {
        case 'categories':
            elements.headerTitle.textContent = 'Flash Cards';
            elements.backBtn.classList.add('hidden');
            break;
        case 'decks':
            elements.headerTitle.textContent = category?.name || 'Decks';
            elements.backBtn.classList.remove('hidden');
            break;
        case 'cards':
            elements.headerTitle.textContent = deck?.name || 'Cards';
            elements.backBtn.classList.remove('hidden');
            break;
        case 'study':
            elements.headerTitle.textContent = 'Study Mode';
            elements.backBtn.classList.remove('hidden');
            break;
    }
}

function goBack() {
    switch (state.currentView) {
        case 'decks':
            state.currentCategoryId = null;
            navigateTo('categories');
            break;
        case 'cards':
            state.currentDeckId = null;
            navigateTo('decks');
            break;
        case 'study':
            navigateTo('cards');
            break;
    }
}

// ===== Render Functions =====

function renderCategories() {
    const list = elements.categoriesList;
    list.innerHTML = '';
    
    if (state.categories.length === 0) {
        elements.emptyCategoriesState.classList.add('visible');
        return;
    }
    
    elements.emptyCategoriesState.classList.remove('visible');
    
    state.categories.forEach(category => {
        const deckCount = category.decks?.length || 0;
        const cardCount = category.decks?.reduce((sum, deck) => sum + (deck.cards?.length || 0), 0) || 0;
        
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.style.setProperty('--item-color', category.color);
        item.innerHTML = `
            <div class="grid-item-actions">
                <button class="btn-more" data-id="${category.id}" data-type="category" aria-label="More options">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                    </svg>
                </button>
            </div>
            <div class="grid-item-icon">${category.icon}</div>
            <div class="grid-item-title">${escapeHtml(category.name)}</div>
            <div class="grid-item-meta">${deckCount} deck${deckCount !== 1 ? 's' : ''} • ${cardCount} card${cardCount !== 1 ? 's' : ''}</div>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-more')) {
                state.currentCategoryId = category.id;
                navigateTo('decks');
            }
        });
        
        list.appendChild(item);
    });
}

function renderDecks() {
    const category = getCurrentCategory();
    const list = elements.decksList;
    list.innerHTML = '';
    
    elements.decksTitle.textContent = category?.name || 'Decks';
    
    if (!category?.decks || category.decks.length === 0) {
        elements.emptyDecksState.classList.add('visible');
        return;
    }
    
    elements.emptyDecksState.classList.remove('visible');
    
    category.decks.forEach(deck => {
        const cardCount = deck.cards?.length || 0;
        
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.style.setProperty('--item-color', category.color);
        item.innerHTML = `
            <div class="grid-item-actions">
                <button class="btn-more" data-id="${deck.id}" data-type="deck" aria-label="More options">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                    </svg>
                </button>
            </div>
            <div class="grid-item-icon">🗂️</div>
            <div class="grid-item-title">${escapeHtml(deck.name)}</div>
            <div class="grid-item-meta">${cardCount} card${cardCount !== 1 ? 's' : ''}</div>
            ${deck.description ? `<div class="grid-item-description">${escapeHtml(deck.description)}</div>` : ''}
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-more')) {
                state.currentDeckId = deck.id;
                navigateTo('cards');
            }
        });
        
        list.appendChild(item);
    });
}

function renderCards() {
    const deck = getCurrentDeck();
    const list = elements.cardsList;
    list.innerHTML = '';
    
    elements.cardsTitle.textContent = deck?.name || 'Cards';
    
    if (!deck?.cards || deck.cards.length === 0) {
        elements.emptyCardsState.classList.add('visible');
        elements.studyBtn.disabled = true;
        return;
    }
    
    elements.emptyCardsState.classList.remove('visible');
    elements.studyBtn.disabled = false;
    
    deck.cards.forEach(card => {
        const item = document.createElement('div');
        item.className = 'card-item';
        item.innerHTML = `
            <div class="card-item-image">
                ${card.image 
                    ? `<img src="${card.image}" alt="Card image">` 
                    : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>`
                }
            </div>
            <div class="card-item-content">
                <div class="card-item-front">${escapeHtml(card.front)}</div>
                <div class="card-item-back">${escapeHtml(card.back)}</div>
            </div>
            <div class="card-item-actions">
                <button class="btn-more" data-id="${card.id}" data-type="card" aria-label="More options">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                    </svg>
                </button>
            </div>
        `;
        
        list.appendChild(item);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Modal Functions =====

function openModal(modalId) {
    elements.modalOverlay.classList.add('active');
    document.getElementById(modalId).classList.add('active');
}

function closeAllModals() {
    elements.modalOverlay.classList.remove('active');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    elements.contextMenu.classList.remove('active');
    
    // Reset forms
    elements.categoryForm.reset();
    elements.deckForm.reset();
    elements.cardForm.reset();
    resetImagePreview();
    
    // Reset color and icon selections
    document.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
    document.querySelector('.color-option[data-color="#6366f1"]').classList.add('selected');
    elements.categoryColor.value = '#6366f1';
    
    document.querySelectorAll('.icon-option').forEach(i => i.classList.remove('selected'));
    document.querySelector('.icon-option[data-icon="📚"]').classList.add('selected');
    elements.categoryIcon.value = '📚';
    
    // Reset editing state
    state.editingItem = null;
    state.editingType = null;
}

function showContextMenu(e, id, type) {
    e.stopPropagation();
    
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    
    state.editingItem = id;
    state.editingType = type;
    
    elements.contextMenu.style.top = `${rect.bottom + 8}px`;
    elements.contextMenu.style.left = `${Math.min(rect.left, window.innerWidth - 180)}px`;
    elements.contextMenu.classList.add('active');
    elements.modalOverlay.classList.add('active');
}

// ===== Category Functions =====

function openCategoryModal(editing = false) {
    if (editing && state.editingItem) {
        const category = state.categories.find(c => c.id === state.editingItem);
        if (category) {
            elements.categoryName.value = category.name;
            elements.categoryColor.value = category.color;
            elements.categoryIcon.value = category.icon;
            
            // Update selections
            document.querySelectorAll('.color-option').forEach(c => {
                c.classList.toggle('selected', c.dataset.color === category.color);
            });
            document.querySelectorAll('.icon-option').forEach(i => {
                i.classList.toggle('selected', i.dataset.icon === category.icon);
            });
        }
        elements.categoryModalTitle.textContent = 'Edit Category';
    } else {
        elements.categoryModalTitle.textContent = 'Add Category';
    }
    
    openModal('categoryModal');
}

function saveCategory(e) {
    e.preventDefault();
    
    const name = elements.categoryName.value.trim();
    const color = elements.categoryColor.value;
    const icon = elements.categoryIcon.value;
    
    if (!name) return;
    
    if (state.editingItem) {
        // Edit existing
        const category = state.categories.find(c => c.id === state.editingItem);
        if (category) {
            category.name = name;
            category.color = color;
            category.icon = icon;
            showToast('Category updated!');
        }
    } else {
        // Create new
        state.categories.push({
            id: generateId(),
            name,
            color,
            icon,
            decks: []
        });
        showToast('Category created!');
    }
    
    saveData();
    closeAllModals();
    renderCategories();
}

// ===== Deck Functions =====

function openDeckModal(editing = false) {
    if (editing && state.editingItem) {
        const category = getCurrentCategory();
        const deck = category?.decks.find(d => d.id === state.editingItem);
        if (deck) {
            elements.deckName.value = deck.name;
            elements.deckDescription.value = deck.description || '';
        }
        elements.deckModalTitle.textContent = 'Edit Deck';
    } else {
        elements.deckModalTitle.textContent = 'Add Deck';
    }
    
    openModal('deckModal');
}

function saveDeck(e) {
    e.preventDefault();
    
    const name = elements.deckName.value.trim();
    const description = elements.deckDescription.value.trim();
    
    if (!name) return;
    
    const category = getCurrentCategory();
    if (!category) return;
    
    if (state.editingItem) {
        // Edit existing
        const deck = category.decks.find(d => d.id === state.editingItem);
        if (deck) {
            deck.name = name;
            deck.description = description;
            showToast('Deck updated!');
        }
    } else {
        // Create new
        category.decks.push({
            id: generateId(),
            name,
            description,
            cards: []
        });
        showToast('Deck created!');
    }
    
    saveData();
    closeAllModals();
    renderDecks();
}

// ===== Card Functions =====

let currentImageData = null;

function openCardModal(editing = false) {
    if (editing && state.editingItem) {
        const deck = getCurrentDeck();
        const card = deck?.cards.find(c => c.id === state.editingItem);
        if (card) {
            elements.cardFront.value = card.front;
            elements.cardBack.value = card.back;
            if (card.image) {
                currentImageData = card.image;
                elements.imagePreview.innerHTML = `<img src="${card.image}" alt="Preview">`;
                elements.imagePreview.classList.add('has-image');
                elements.removeImageBtn.classList.remove('hidden');
            }
        }
        elements.cardModalTitle.textContent = 'Edit Card';
    } else {
        elements.cardModalTitle.textContent = 'Add Card';
    }
    
    openModal('cardModal');
}

function saveCard(e) {
    e.preventDefault();
    
    const front = elements.cardFront.value.trim();
    const back = elements.cardBack.value.trim();
    
    if (!front || !back) return;
    
    const deck = getCurrentDeck();
    if (!deck) return;
    
    if (state.editingItem) {
        // Edit existing
        const card = deck.cards.find(c => c.id === state.editingItem);
        if (card) {
            card.front = front;
            card.back = back;
            card.image = currentImageData;
            showToast('Card updated!');
        }
    } else {
        // Create new
        deck.cards.push({
            id: generateId(),
            front,
            back,
            image: currentImageData
        });
        showToast('Card created!');
    }
    
    saveData();
    closeAllModals();
    renderCards();
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        currentImageData = event.target.result;
        elements.imagePreview.innerHTML = `<img src="${currentImageData}" alt="Preview">`;
        elements.imagePreview.classList.add('has-image');
        elements.removeImageBtn.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function resetImagePreview() {
    currentImageData = null;
    elements.imagePreview.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Click to upload image</span>
    `;
    elements.imagePreview.classList.remove('has-image');
    elements.removeImageBtn.classList.add('hidden');
    elements.cardImage.value = '';
}

// ===== Delete Functions =====

function confirmDelete() {
    let message = 'Are you sure you want to delete this item?';
    
    switch (state.editingType) {
        case 'category':
            const category = state.categories.find(c => c.id === state.editingItem);
            const deckCount = category?.decks?.length || 0;
            message = `Delete "${category?.name}"? This will also delete ${deckCount} deck${deckCount !== 1 ? 's' : ''} and all their cards.`;
            break;
        case 'deck':
            const cat = getCurrentCategory();
            const deck = cat?.decks.find(d => d.id === state.editingItem);
            const cardCount = deck?.cards?.length || 0;
            message = `Delete "${deck?.name}"? This will also delete ${cardCount} card${cardCount !== 1 ? 's' : ''}.`;
            break;
        case 'card':
            message = 'Delete this card?';
            break;
    }
    
    elements.confirmMessage.textContent = message;
    elements.contextMenu.classList.remove('active');
    openModal('confirmModal');
}

function deleteItem() {
    switch (state.editingType) {
        case 'category':
            state.categories = state.categories.filter(c => c.id !== state.editingItem);
            showToast('Category deleted');
            renderCategories();
            break;
        case 'deck':
            const category = getCurrentCategory();
            if (category) {
                category.decks = category.decks.filter(d => d.id !== state.editingItem);
                showToast('Deck deleted');
                renderDecks();
            }
            break;
        case 'card':
            const deck = getCurrentDeck();
            if (deck) {
                deck.cards = deck.cards.filter(c => c.id !== state.editingItem);
                showToast('Card deleted');
                renderCards();
            }
            break;
    }
    
    saveData();
    closeAllModals();
}

// ===== Study Mode =====

function initStudyMode() {
    const deck = getCurrentDeck();
    if (!deck?.cards || deck.cards.length === 0) {
        showToast('No cards to study', 'error');
        navigateTo('cards');
        return;
    }
    
    state.studyCards = [...deck.cards];
    state.studyIndex = 0;
    
    updateStudyCard();
    updateStudyProgress();
}

function updateStudyCard(skipFlipReset = false) {
    const card = state.studyCards[state.studyIndex];
    if (!card) return;
    
    const updateContent = () => {
        // Update front
        if (card.image) {
            elements.cardFrontImage.innerHTML = `<img src="${card.image}" alt="Card image">`;
            elements.cardFrontImage.style.display = 'block';
        } else {
            elements.cardFrontImage.innerHTML = '';
            elements.cardFrontImage.style.display = 'none';
        }
        elements.cardFrontText.textContent = card.front;
        
        // Update back
        elements.cardBackText.textContent = card.back;
        
        // Update button states
        elements.prevCardBtn.disabled = state.studyIndex === 0;
        elements.nextCardBtn.disabled = state.studyIndex === state.studyCards.length - 1;
    };
    
    // If card is flipped and we're not skipping reset, flip back first then update
    if (!skipFlipReset && elements.flashcard.classList.contains('flipped')) {
        elements.flashcard.classList.remove('flipped');
        // Wait for flip animation to complete before updating content
        setTimeout(updateContent, 300);
    } else {
        elements.flashcard.classList.remove('flipped');
        updateContent();
    }
}

function updateStudyProgress() {
    const current = state.studyIndex + 1;
    const total = state.studyCards.length;
    const percentage = (current / total) * 100;
    
    elements.progressFill.style.width = `${percentage}%`;
    elements.progressText.textContent = `${current} / ${total}`;
}

function flipCard() {
    elements.flashcard.classList.toggle('flipped');
}

function prevCard() {
    if (state.studyIndex > 0) {
        state.studyIndex--;
        updateStudyCard();
        updateStudyProgress();
    }
}

function nextCard() {
    if (state.studyIndex < state.studyCards.length - 1) {
        state.studyIndex++;
        updateStudyCard();
        updateStudyProgress();
    }
}

function shuffleCards() {
    // Fisher-Yates shuffle
    for (let i = state.studyCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.studyCards[i], state.studyCards[j]] = [state.studyCards[j], state.studyCards[i]];
    }
    
    state.studyIndex = 0;
    updateStudyCard();
    updateStudyProgress();
    showToast('Cards shuffled!');
}

// ===== Swipe Gesture Handler =====

const swipeHandler = {
    startX: 0,
    startY: 0,
    startTime: 0,
    threshold: 50,      // Minimum distance for swipe
    velocityThreshold: 0.3, // Minimum velocity
    restraint: 100,     // Maximum perpendicular distance
    allowedTime: 500,   // Maximum time for swipe
    
    handleTouchStart(e) {
        const touch = e.changedTouches[0];
        this.startX = touch.pageX;
        this.startY = touch.pageY;
        this.startTime = Date.now();
    },
    
    handleTouchEnd(e, callbacks) {
        const touch = e.changedTouches[0];
        const distX = touch.pageX - this.startX;
        const distY = touch.pageY - this.startY;
        const elapsedTime = Date.now() - this.startTime;
        
        if (elapsedTime <= this.allowedTime) {
            const velocity = Math.abs(distX) / elapsedTime;
            
            // Horizontal swipe
            if (Math.abs(distX) >= this.threshold && 
                Math.abs(distY) <= this.restraint &&
                velocity >= this.velocityThreshold) {
                
                if (distX > 0 && callbacks.onSwipeRight) {
                    callbacks.onSwipeRight();
                    return true;
                } else if (distX < 0 && callbacks.onSwipeLeft) {
                    callbacks.onSwipeLeft();
                    return true;
                }
            }
            
            // Vertical swipe
            if (Math.abs(distY) >= this.threshold && 
                Math.abs(distX) <= this.restraint &&
                velocity >= this.velocityThreshold) {
                
                if (distY > 0 && callbacks.onSwipeDown) {
                    callbacks.onSwipeDown();
                    return true;
                } else if (distY < 0 && callbacks.onSwipeUp) {
                    callbacks.onSwipeUp();
                    return true;
                }
            }
        }
        
        return false;
    }
};

function initSwipeListeners() {
    // Study view swipe - navigate cards
    elements.flashcard.addEventListener('touchstart', (e) => {
        swipeHandler.handleTouchStart(e);
    }, { passive: true });
    
    elements.flashcard.addEventListener('touchend', (e) => {
        const handled = swipeHandler.handleTouchEnd(e, {
            onSwipeLeft: () => nextCard(),
            onSwipeRight: () => prevCard(),
            onSwipeUp: () => flipCard(),
            onSwipeDown: () => flipCard()
        });
        
        // Only flip on tap if swipe wasn't detected
        // Tap is handled by click event
    });
    
    // Category/Deck/Card list swipe - go back
    const swipeBackViews = [elements.decksView, elements.cardsView];
    swipeBackViews.forEach(view => {
        view.addEventListener('touchstart', (e) => {
            swipeHandler.handleTouchStart(e);
        }, { passive: true });
        
        view.addEventListener('touchend', (e) => {
            // Only trigger if not swiping on an interactive element
            if (!e.target.closest('.grid-item, .card-item, button')) {
                swipeHandler.handleTouchEnd(e, {
                    onSwipeRight: () => goBack()
                });
            }
        });
    });
}

// ===== Event Listeners =====

function initEventListeners() {
    // Navigation
    elements.backBtn.addEventListener('click', goBack);
    
    // Add buttons
    elements.addCategoryBtn.addEventListener('click', () => openCategoryModal(false));
    elements.addDeckBtn.addEventListener('click', () => openDeckModal(false));
    elements.addCardBtn.addEventListener('click', () => openCardModal(false));
    elements.studyBtn.addEventListener('click', () => navigateTo('study'));
    
    // Forms
    elements.categoryForm.addEventListener('submit', saveCategory);
    elements.deckForm.addEventListener('submit', saveDeck);
    elements.cardForm.addEventListener('submit', saveCard);
    
    // Color picker
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
            btn.classList.add('selected');
            elements.categoryColor.value = btn.dataset.color;
        });
    });
    
    // Icon picker
    document.querySelectorAll('.icon-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.icon-option').forEach(i => i.classList.remove('selected'));
            btn.classList.add('selected');
            elements.categoryIcon.value = btn.dataset.icon;
        });
    });
    
    // Image upload
    elements.cardImage.addEventListener('change', handleImageUpload);
    elements.removeImageBtn.addEventListener('click', resetImagePreview);
    
    // Context menu
    document.addEventListener('click', (e) => {
        const moreBtn = e.target.closest('.btn-more');
        if (moreBtn) {
            showContextMenu(e, moreBtn.dataset.id, moreBtn.dataset.type);
        }
    });
    
    elements.editItemBtn.addEventListener('click', () => {
        elements.contextMenu.classList.remove('active');
        switch (state.editingType) {
            case 'category':
                openCategoryModal(true);
                break;
            case 'deck':
                openDeckModal(true);
                break;
            case 'card':
                openCardModal(true);
                break;
        }
    });
    
    elements.deleteItemBtn.addEventListener('click', confirmDelete);
    elements.confirmDeleteBtn.addEventListener('click', deleteItem);
    
    // Close modals
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) {
            closeAllModals();
        }
    });
    
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Study controls
    elements.flashcard.addEventListener('click', flipCard);
    elements.prevCardBtn.addEventListener('click', prevCard);
    elements.nextCardBtn.addEventListener('click', nextCard);
    elements.shuffleBtn.addEventListener('click', shuffleCards);
    
    // Keyboard navigation for study mode
    document.addEventListener('keydown', (e) => {
        if (state.currentView !== 'study') return;
        
        switch (e.key) {
            case ' ':
            case 'Enter':
                e.preventDefault();
                flipCard();
                break;
            case 'ArrowLeft':
                prevCard();
                break;
            case 'ArrowRight':
                nextCard();
                break;
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// ===== Service Worker Registration =====

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    }
}

// ===== Initialize App =====

function init() {
    loadData();
    initEventListeners();
    initSwipeListeners();
    registerServiceWorker();
    navigateTo('categories');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

// ===== Export for Testing =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        state,
        generateId,
        saveData,
        loadData,
        showToast,
        getCurrentCategory,
        getCurrentDeck,
        navigateTo,
        goBack,
        escapeHtml,
        openModal,
        closeAllModals,
        saveCategory,
        saveDeck,
        saveCard,
        deleteItem,
        initStudyMode,
        updateStudyCard,
        flipCard,
        prevCard,
        nextCard,
        shuffleCards,
        swipeHandler
    };
}
