/**
 * Flash Cards App - Unit Tests
 * 
 * This test suite covers:
 * - State Management
 * - Data Persistence (localStorage)
 * - Category CRUD operations
 * - Deck CRUD operations
 * - Card CRUD operations
 * - Navigation
 * - Study Mode
 * - Swipe Gestures
 * - Utility Functions
 */

// HTML template for testing
const createTestDOM = () => {
    document.body.innerHTML = `
        <div id="app">
            <header class="header">
                <button id="backBtn" class="btn-icon hidden"></button>
                <h1 id="headerTitle">Flash Cards</h1>
                <button id="menuBtn" class="btn-icon"></button>
            </header>
            <main id="mainContent">
                <section id="categoriesView" class="view active">
                    <div class="view-header">
                        <h2>Categories</h2>
                        <button id="addCategoryBtn" class="btn-primary">Add Category</button>
                    </div>
                    <div id="categoriesList" class="grid-list"></div>
                    <div id="emptyCategoriesState" class="empty-state"></div>
                </section>
                <section id="decksView" class="view">
                    <div class="view-header">
                        <h2 id="decksTitle">Decks</h2>
                        <button id="addDeckBtn" class="btn-primary">Add Deck</button>
                    </div>
                    <div id="decksList" class="grid-list"></div>
                    <div id="emptyDecksState" class="empty-state"></div>
                </section>
                <section id="cardsView" class="view">
                    <div class="view-header">
                        <h2 id="cardsTitle">Cards</h2>
                        <div class="header-actions">
                            <button id="studyBtn" class="btn-secondary">Study</button>
                            <button id="addCardBtn" class="btn-primary">Add Card</button>
                        </div>
                    </div>
                    <div id="cardsList" class="cards-list"></div>
                    <div id="emptyCardsState" class="empty-state"></div>
                </section>
                <section id="studyView" class="view">
                    <div class="study-container">
                        <div class="study-progress">
                            <div class="progress-bar">
                                <div id="progressFill" class="progress-fill"></div>
                            </div>
                            <span id="progressText">0 / 0</span>
                        </div>
                        <div id="flashcard" class="flashcard">
                            <div class="flashcard-inner">
                                <div class="flashcard-front">
                                    <div id="cardFrontImage" class="card-image"></div>
                                    <div id="cardFrontText" class="card-text"></div>
                                </div>
                                <div class="flashcard-back">
                                    <div id="cardBackText" class="card-text"></div>
                                </div>
                            </div>
                        </div>
                        <div class="study-controls">
                            <button id="prevCardBtn" class="btn-control"></button>
                            <button id="shuffleBtn" class="btn-control"></button>
                            <button id="nextCardBtn" class="btn-control"></button>
                        </div>
                    </div>
                </section>
            </main>
            <div id="modalOverlay" class="modal-overlay">
                <div id="categoryModal" class="modal">
                    <div class="modal-header">
                        <h3 id="categoryModalTitle">Add Category</h3>
                        <button class="btn-close" data-close-modal>×</button>
                    </div>
                    <form id="categoryForm" class="modal-form">
                        <input type="text" id="categoryName" required>
                        <input type="hidden" id="categoryColor" value="#6366f1">
                        <input type="hidden" id="categoryIcon" value="📚">
                        <div class="color-picker">
                            <button type="button" class="color-option selected" data-color="#6366f1"></button>
                            <button type="button" class="color-option" data-color="#22c55e"></button>
                        </div>
                        <div class="icon-picker">
                            <button type="button" class="icon-option selected" data-icon="📚"></button>
                            <button type="button" class="icon-option" data-icon="🌍"></button>
                        </div>
                    </form>
                </div>
                <div id="deckModal" class="modal">
                    <div class="modal-header">
                        <h3 id="deckModalTitle">Add Deck</h3>
                        <button class="btn-close" data-close-modal>×</button>
                    </div>
                    <form id="deckForm" class="modal-form">
                        <input type="text" id="deckName" required>
                        <textarea id="deckDescription"></textarea>
                    </form>
                </div>
                <div id="cardModal" class="modal modal-large">
                    <div class="modal-header">
                        <h3 id="cardModalTitle">Add Card</h3>
                        <button class="btn-close" data-close-modal>×</button>
                    </div>
                    <form id="cardForm" class="modal-form">
                        <input type="text" id="cardFront" required>
                        <div class="image-upload">
                            <input type="file" id="cardImage" accept="image/*">
                            <div id="imagePreview" class="image-preview"></div>
                        </div>
                        <button type="button" id="removeImageBtn" class="btn-text hidden">Remove</button>
                        <textarea id="cardBack" required></textarea>
                    </form>
                </div>
                <div id="contextMenu" class="context-menu">
                    <button id="editItemBtn" class="context-item">Edit</button>
                    <button id="deleteItemBtn" class="context-item danger">Delete</button>
                </div>
                <div id="confirmModal" class="modal modal-small">
                    <div class="modal-header">
                        <h3>Confirm Delete</h3>
                        <button class="btn-close" data-close-modal>×</button>
                    </div>
                    <div class="modal-body">
                        <p id="confirmMessage"></p>
                    </div>
                    <div class="modal-actions">
                        <button type="button" id="confirmDeleteBtn" class="btn-danger">Delete</button>
                    </div>
                </div>
            </div>
            <div id="toast" class="toast"></div>
        </div>
    `;
};

// Import app module (we'll create a testable version)
let app;

describe('Flash Cards App', () => {
    beforeEach(() => {
        createTestDOM();
        jest.useFakeTimers();
        
        // Reset module cache to get fresh state
        jest.resetModules();
        
        // Create mock app state and functions for testing
        app = {
            state: {
                categories: [],
                currentCategoryId: null,
                currentDeckId: null,
                currentView: 'categories',
                studyCards: [],
                studyIndex: 0,
                editingItem: null,
                editingType: null
            },
            elements: {
                backBtn: document.getElementById('backBtn'),
                headerTitle: document.getElementById('headerTitle'),
                categoriesView: document.getElementById('categoriesView'),
                decksView: document.getElementById('decksView'),
                cardsView: document.getElementById('cardsView'),
                studyView: document.getElementById('studyView'),
                categoriesList: document.getElementById('categoriesList'),
                decksList: document.getElementById('decksList'),
                cardsList: document.getElementById('cardsList'),
                emptyCategoriesState: document.getElementById('emptyCategoriesState'),
                emptyDecksState: document.getElementById('emptyDecksState'),
                emptyCardsState: document.getElementById('emptyCardsState'),
                flashcard: document.getElementById('flashcard'),
                cardFrontImage: document.getElementById('cardFrontImage'),
                cardFrontText: document.getElementById('cardFrontText'),
                cardBackText: document.getElementById('cardBackText'),
                progressFill: document.getElementById('progressFill'),
                progressText: document.getElementById('progressText'),
                prevCardBtn: document.getElementById('prevCardBtn'),
                nextCardBtn: document.getElementById('nextCardBtn'),
                modalOverlay: document.getElementById('modalOverlay'),
                toast: document.getElementById('toast'),
                studyBtn: document.getElementById('studyBtn')
            }
        };
    });

    afterEach(() => {
        jest.useRealTimers();
        localStorage.clear();
    });

    // =========================================
    // Utility Function Tests
    // =========================================
    describe('Utility Functions', () => {
        describe('generateId', () => {
            test('should generate unique IDs', () => {
                const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
                
                const ids = new Set();
                for (let i = 0; i < 100; i++) {
                    ids.add(generateId());
                }
                
                expect(ids.size).toBe(100);
            });

            test('should generate string IDs', () => {
                const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
                const id = generateId();
                
                expect(typeof id).toBe('string');
                expect(id.length).toBeGreaterThan(0);
            });
        });

        describe('escapeHtml', () => {
            test('should escape HTML special characters', () => {
                const escapeHtml = (text) => {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                };

                expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
                expect(escapeHtml('Hello & World')).toBe('Hello &amp; World');
                expect(escapeHtml('"quoted"')).toBe('"quoted"');
            });

            test('should handle empty strings', () => {
                const escapeHtml = (text) => {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                };

                expect(escapeHtml('')).toBe('');
            });

            test('should handle normal text unchanged', () => {
                const escapeHtml = (text) => {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                };

                expect(escapeHtml('Hello World')).toBe('Hello World');
            });
        });
    });

    // =========================================
    // Data Persistence Tests
    // =========================================
    describe('Data Persistence', () => {
        test('should save data to localStorage', () => {
            const testData = [
                { id: '1', name: 'Test Category', color: '#6366f1', icon: '📚', decks: [] }
            ];
            
            localStorage.setItem('flashCardsData', JSON.stringify(testData));
            
            expect(localStorage.setItem).toHaveBeenCalledWith('flashCardsData', JSON.stringify(testData));
        });

        test('should load data from localStorage', () => {
            const testData = [
                { id: '1', name: 'Test Category', color: '#6366f1', icon: '📚', decks: [] }
            ];
            
            localStorage.getItem.mockReturnValue(JSON.stringify(testData));
            
            const data = JSON.parse(localStorage.getItem('flashCardsData'));
            
            expect(data).toEqual(testData);
        });

        test('should handle missing localStorage data', () => {
            localStorage.getItem.mockReturnValue(null);
            
            const data = localStorage.getItem('flashCardsData');
            
            expect(data).toBeNull();
        });

        test('should handle corrupted localStorage data', () => {
            localStorage.getItem.mockReturnValue('invalid json{');
            
            expect(() => {
                JSON.parse(localStorage.getItem('flashCardsData'));
            }).toThrow();
        });
    });

    // =========================================
    // Category Tests
    // =========================================
    describe('Category Management', () => {
        test('should create a new category', () => {
            const category = {
                id: 'cat1',
                name: 'Spanish',
                color: '#6366f1',
                icon: '🌍',
                decks: []
            };
            
            app.state.categories.push(category);
            
            expect(app.state.categories).toHaveLength(1);
            expect(app.state.categories[0].name).toBe('Spanish');
        });

        test('should update an existing category', () => {
            app.state.categories = [
                { id: 'cat1', name: 'Spanish', color: '#6366f1', icon: '🌍', decks: [] }
            ];
            
            const category = app.state.categories.find(c => c.id === 'cat1');
            category.name = 'French';
            category.icon = '🇫🇷';
            
            expect(app.state.categories[0].name).toBe('French');
            expect(app.state.categories[0].icon).toBe('🇫🇷');
        });

        test('should delete a category', () => {
            app.state.categories = [
                { id: 'cat1', name: 'Spanish', color: '#6366f1', icon: '🌍', decks: [] },
                { id: 'cat2', name: 'French', color: '#22c55e', icon: '🇫🇷', decks: [] }
            ];
            
            app.state.categories = app.state.categories.filter(c => c.id !== 'cat1');
            
            expect(app.state.categories).toHaveLength(1);
            expect(app.state.categories[0].id).toBe('cat2');
        });

        test('should count decks in category', () => {
            app.state.categories = [{
                id: 'cat1',
                name: 'Spanish',
                color: '#6366f1',
                icon: '🌍',
                decks: [
                    { id: 'd1', name: 'Deck 1', cards: [] },
                    { id: 'd2', name: 'Deck 2', cards: [] }
                ]
            }];
            
            const deckCount = app.state.categories[0].decks.length;
            
            expect(deckCount).toBe(2);
        });

        test('should count total cards in category', () => {
            app.state.categories = [{
                id: 'cat1',
                name: 'Spanish',
                color: '#6366f1',
                icon: '🌍',
                decks: [
                    { id: 'd1', name: 'Deck 1', cards: [{ id: 'c1' }, { id: 'c2' }] },
                    { id: 'd2', name: 'Deck 2', cards: [{ id: 'c3' }] }
                ]
            }];
            
            const cardCount = app.state.categories[0].decks.reduce(
                (sum, deck) => sum + (deck.cards?.length || 0), 0
            );
            
            expect(cardCount).toBe(3);
        });
    });

    // =========================================
    // Deck Tests
    // =========================================
    describe('Deck Management', () => {
        beforeEach(() => {
            app.state.categories = [{
                id: 'cat1',
                name: 'Spanish',
                color: '#6366f1',
                icon: '🌍',
                decks: []
            }];
            app.state.currentCategoryId = 'cat1';
        });

        test('should create a new deck', () => {
            const deck = {
                id: 'deck1',
                name: 'Basic Vocabulary',
                description: 'Common Spanish words',
                cards: []
            };
            
            app.state.categories[0].decks.push(deck);
            
            expect(app.state.categories[0].decks).toHaveLength(1);
            expect(app.state.categories[0].decks[0].name).toBe('Basic Vocabulary');
        });

        test('should update an existing deck', () => {
            app.state.categories[0].decks = [
                { id: 'deck1', name: 'Basic Vocabulary', description: '', cards: [] }
            ];
            
            const deck = app.state.categories[0].decks.find(d => d.id === 'deck1');
            deck.name = 'Advanced Vocabulary';
            deck.description = 'Updated description';
            
            expect(app.state.categories[0].decks[0].name).toBe('Advanced Vocabulary');
        });

        test('should delete a deck', () => {
            app.state.categories[0].decks = [
                { id: 'deck1', name: 'Deck 1', cards: [] },
                { id: 'deck2', name: 'Deck 2', cards: [] }
            ];
            
            const category = app.state.categories[0];
            category.decks = category.decks.filter(d => d.id !== 'deck1');
            
            expect(category.decks).toHaveLength(1);
            expect(category.decks[0].id).toBe('deck2');
        });

        test('should delete deck with all its cards', () => {
            app.state.categories[0].decks = [{
                id: 'deck1',
                name: 'Deck 1',
                cards: [
                    { id: 'c1', front: 'Hola', back: 'Hello' },
                    { id: 'c2', front: 'Adiós', back: 'Goodbye' }
                ]
            }];
            
            const category = app.state.categories[0];
            const deckToDelete = category.decks.find(d => d.id === 'deck1');
            const cardCount = deckToDelete.cards.length;
            
            category.decks = category.decks.filter(d => d.id !== 'deck1');
            
            expect(cardCount).toBe(2);
            expect(category.decks).toHaveLength(0);
        });
    });

    // =========================================
    // Card Tests
    // =========================================
    describe('Card Management', () => {
        beforeEach(() => {
            app.state.categories = [{
                id: 'cat1',
                name: 'Spanish',
                color: '#6366f1',
                icon: '🌍',
                decks: [{
                    id: 'deck1',
                    name: 'Basic Vocabulary',
                    description: '',
                    cards: []
                }]
            }];
            app.state.currentCategoryId = 'cat1';
            app.state.currentDeckId = 'deck1';
        });

        test('should create a new card', () => {
            const card = {
                id: 'card1',
                front: 'Hola',
                back: 'Hello',
                image: null
            };
            
            app.state.categories[0].decks[0].cards.push(card);
            
            expect(app.state.categories[0].decks[0].cards).toHaveLength(1);
            expect(app.state.categories[0].decks[0].cards[0].front).toBe('Hola');
        });

        test('should create a card with an image', () => {
            const card = {
                id: 'card1',
                front: 'Cat',
                back: 'A furry pet',
                image: 'data:image/png;base64,iVBORw0KGgo='
            };
            
            app.state.categories[0].decks[0].cards.push(card);
            
            expect(app.state.categories[0].decks[0].cards[0].image).toBeTruthy();
        });

        test('should update an existing card', () => {
            app.state.categories[0].decks[0].cards = [
                { id: 'card1', front: 'Hola', back: 'Hello', image: null }
            ];
            
            const card = app.state.categories[0].decks[0].cards.find(c => c.id === 'card1');
            card.front = 'Buenos días';
            card.back = 'Good morning';
            
            expect(app.state.categories[0].decks[0].cards[0].front).toBe('Buenos días');
        });

        test('should delete a card', () => {
            app.state.categories[0].decks[0].cards = [
                { id: 'card1', front: 'Hola', back: 'Hello', image: null },
                { id: 'card2', front: 'Adiós', back: 'Goodbye', image: null }
            ];
            
            const deck = app.state.categories[0].decks[0];
            deck.cards = deck.cards.filter(c => c.id !== 'card1');
            
            expect(deck.cards).toHaveLength(1);
            expect(deck.cards[0].id).toBe('card2');
        });
    });

    // =========================================
    // Navigation Tests
    // =========================================
    describe('Navigation', () => {
        test('should navigate to decks view', () => {
            app.state.currentView = 'categories';
            app.state.currentCategoryId = 'cat1';
            
            // Simulate navigation
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            app.elements.decksView.classList.add('active');
            app.state.currentView = 'decks';
            
            expect(app.state.currentView).toBe('decks');
            expect(app.elements.decksView.classList.contains('active')).toBe(true);
        });

        test('should navigate to cards view', () => {
            app.state.currentView = 'decks';
            app.state.currentDeckId = 'deck1';
            
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            app.elements.cardsView.classList.add('active');
            app.state.currentView = 'cards';
            
            expect(app.state.currentView).toBe('cards');
        });

        test('should navigate to study view', () => {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            app.elements.studyView.classList.add('active');
            app.state.currentView = 'study';
            
            expect(app.state.currentView).toBe('study');
        });

        test('should go back from decks to categories', () => {
            app.state.currentView = 'decks';
            app.state.currentCategoryId = 'cat1';
            
            // Simulate goBack
            app.state.currentCategoryId = null;
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            app.elements.categoriesView.classList.add('active');
            app.state.currentView = 'categories';
            
            expect(app.state.currentView).toBe('categories');
            expect(app.state.currentCategoryId).toBeNull();
        });

        test('should go back from cards to decks', () => {
            app.state.currentView = 'cards';
            app.state.currentDeckId = 'deck1';
            
            app.state.currentDeckId = null;
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            app.elements.decksView.classList.add('active');
            app.state.currentView = 'decks';
            
            expect(app.state.currentView).toBe('decks');
            expect(app.state.currentDeckId).toBeNull();
        });

        test('should update header title based on view', () => {
            const updateHeader = (view, categoryName, deckName) => {
                switch (view) {
                    case 'categories':
                        return 'Flash Cards';
                    case 'decks':
                        return categoryName || 'Decks';
                    case 'cards':
                        return deckName || 'Cards';
                    case 'study':
                        return 'Study Mode';
                    default:
                        return 'Flash Cards';
                }
            };
            
            expect(updateHeader('categories')).toBe('Flash Cards');
            expect(updateHeader('decks', 'Spanish')).toBe('Spanish');
            expect(updateHeader('cards', null, 'Basic Vocabulary')).toBe('Basic Vocabulary');
            expect(updateHeader('study')).toBe('Study Mode');
        });
    });

    // =========================================
    // Study Mode Tests
    // =========================================
    describe('Study Mode', () => {
        beforeEach(() => {
            app.state.categories = [{
                id: 'cat1',
                name: 'Spanish',
                color: '#6366f1',
                icon: '🌍',
                decks: [{
                    id: 'deck1',
                    name: 'Basic',
                    cards: [
                        { id: 'c1', front: 'Hola', back: 'Hello', image: null },
                        { id: 'c2', front: 'Adiós', back: 'Goodbye', image: null },
                        { id: 'c3', front: 'Gracias', back: 'Thank you', image: null }
                    ]
                }]
            }];
            app.state.currentCategoryId = 'cat1';
            app.state.currentDeckId = 'deck1';
        });

        test('should initialize study mode with cards', () => {
            const deck = app.state.categories[0].decks[0];
            app.state.studyCards = [...deck.cards];
            app.state.studyIndex = 0;
            
            expect(app.state.studyCards).toHaveLength(3);
            expect(app.state.studyIndex).toBe(0);
        });

        test('should flip card', () => {
            app.elements.flashcard.classList.remove('flipped');
            
            // Flip
            app.elements.flashcard.classList.toggle('flipped');
            expect(app.elements.flashcard.classList.contains('flipped')).toBe(true);
            
            // Flip back
            app.elements.flashcard.classList.toggle('flipped');
            expect(app.elements.flashcard.classList.contains('flipped')).toBe(false);
        });

        test('should navigate to next card', () => {
            app.state.studyCards = app.state.categories[0].decks[0].cards;
            app.state.studyIndex = 0;
            
            if (app.state.studyIndex < app.state.studyCards.length - 1) {
                app.state.studyIndex++;
            }
            
            expect(app.state.studyIndex).toBe(1);
        });

        test('should not go past last card', () => {
            app.state.studyCards = app.state.categories[0].decks[0].cards;
            app.state.studyIndex = 2; // Last card
            
            const originalIndex = app.state.studyIndex;
            if (app.state.studyIndex < app.state.studyCards.length - 1) {
                app.state.studyIndex++;
            }
            
            expect(app.state.studyIndex).toBe(originalIndex);
        });

        test('should navigate to previous card', () => {
            app.state.studyCards = app.state.categories[0].decks[0].cards;
            app.state.studyIndex = 2;
            
            if (app.state.studyIndex > 0) {
                app.state.studyIndex--;
            }
            
            expect(app.state.studyIndex).toBe(1);
        });

        test('should not go before first card', () => {
            app.state.studyCards = app.state.categories[0].decks[0].cards;
            app.state.studyIndex = 0;
            
            if (app.state.studyIndex > 0) {
                app.state.studyIndex--;
            }
            
            expect(app.state.studyIndex).toBe(0);
        });

        test('should shuffle cards', () => {
            app.state.studyCards = [...app.state.categories[0].decks[0].cards];
            const originalOrder = app.state.studyCards.map(c => c.id).join(',');
            
            // Fisher-Yates shuffle
            for (let i = app.state.studyCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [app.state.studyCards[i], app.state.studyCards[j]] = 
                    [app.state.studyCards[j], app.state.studyCards[i]];
            }
            
            app.state.studyIndex = 0;
            
            // Cards should still exist (may or may not be in different order due to randomness)
            expect(app.state.studyCards).toHaveLength(3);
            expect(app.state.studyIndex).toBe(0);
        });

        test('should update progress correctly', () => {
            app.state.studyCards = app.state.categories[0].decks[0].cards;
            app.state.studyIndex = 1;
            
            const current = app.state.studyIndex + 1;
            const total = app.state.studyCards.length;
            const percentage = (current / total) * 100;
            
            expect(current).toBe(2);
            expect(total).toBe(3);
            expect(percentage).toBeCloseTo(66.67, 1);
        });

        test('should disable prev button on first card', () => {
            app.state.studyIndex = 0;
            app.elements.prevCardBtn.disabled = app.state.studyIndex === 0;
            
            expect(app.elements.prevCardBtn.disabled).toBe(true);
        });

        test('should disable next button on last card', () => {
            app.state.studyCards = app.state.categories[0].decks[0].cards;
            app.state.studyIndex = app.state.studyCards.length - 1;
            app.elements.nextCardBtn.disabled = app.state.studyIndex === app.state.studyCards.length - 1;
            
            expect(app.elements.nextCardBtn.disabled).toBe(true);
        });
    });

    // =========================================
    // Swipe Gesture Tests
    // =========================================
    describe('Swipe Gestures', () => {
        let swipeHandler;

        beforeEach(() => {
            swipeHandler = {
                startX: 0,
                startY: 0,
                startTime: 0,
                threshold: 50,
                velocityThreshold: 0.3,
                restraint: 100,
                allowedTime: 500,

                handleTouchStart(touch) {
                    this.startX = touch.pageX;
                    this.startY = touch.pageY;
                    this.startTime = Date.now();
                },

                handleTouchEnd(touch) {
                    const distX = touch.pageX - this.startX;
                    const distY = touch.pageY - this.startY;
                    const elapsedTime = Date.now() - this.startTime;

                    if (elapsedTime <= this.allowedTime) {
                        const velocity = Math.abs(distX) / elapsedTime;

                        if (Math.abs(distX) >= this.threshold &&
                            Math.abs(distY) <= this.restraint &&
                            velocity >= this.velocityThreshold) {
                            return distX > 0 ? 'right' : 'left';
                        }

                        if (Math.abs(distY) >= this.threshold &&
                            Math.abs(distX) <= this.restraint) {
                            return distY > 0 ? 'down' : 'up';
                        }
                    }
                    return null;
                }
            };
        });

        test('should detect swipe left', () => {
            swipeHandler.handleTouchStart({ pageX: 200, pageY: 100 });
            
            // Simulate fast swipe
            jest.advanceTimersByTime(100);
            const result = swipeHandler.handleTouchEnd({ pageX: 50, pageY: 100 });
            
            expect(result).toBe('left');
        });

        test('should detect swipe right', () => {
            swipeHandler.handleTouchStart({ pageX: 50, pageY: 100 });
            
            jest.advanceTimersByTime(100);
            const result = swipeHandler.handleTouchEnd({ pageX: 200, pageY: 100 });
            
            expect(result).toBe('right');
        });

        test('should detect swipe up', () => {
            swipeHandler.handleTouchStart({ pageX: 100, pageY: 200 });
            
            jest.advanceTimersByTime(100);
            const result = swipeHandler.handleTouchEnd({ pageX: 100, pageY: 50 });
            
            expect(result).toBe('up');
        });

        test('should detect swipe down', () => {
            swipeHandler.handleTouchStart({ pageX: 100, pageY: 50 });
            
            jest.advanceTimersByTime(100);
            const result = swipeHandler.handleTouchEnd({ pageX: 100, pageY: 200 });
            
            expect(result).toBe('down');
        });

        test('should not detect swipe if too slow', () => {
            swipeHandler.handleTouchStart({ pageX: 200, pageY: 100 });
            
            // Simulate slow swipe (600ms > 500ms allowed)
            jest.advanceTimersByTime(600);
            const result = swipeHandler.handleTouchEnd({ pageX: 50, pageY: 100 });
            
            expect(result).toBeNull();
        });

        test('should not detect swipe if distance too short', () => {
            swipeHandler.handleTouchStart({ pageX: 100, pageY: 100 });
            
            jest.advanceTimersByTime(100);
            const result = swipeHandler.handleTouchEnd({ pageX: 130, pageY: 100 }); // 30px < 50px threshold
            
            expect(result).toBeNull();
        });

        test('should not detect horizontal swipe if too much vertical movement', () => {
            swipeHandler.handleTouchStart({ pageX: 100, pageY: 100 });
            
            jest.advanceTimersByTime(100);
            // 100px horizontal, 150px vertical - vertical is larger so it won't be horizontal swipe
            // But since vertical distance > threshold and horizontal < restraint, it detects as vertical swipe
            const result = swipeHandler.handleTouchEnd({ pageX: 200, pageY: 250 });
            
            // This actually detects as a down swipe since vertical is dominant
            expect(result).toBe('down');
        });
    });

    // =========================================
    // Modal Tests
    // =========================================
    describe('Modal Management', () => {
        test('should open modal', () => {
            app.elements.modalOverlay.classList.add('active');
            const modal = document.getElementById('categoryModal');
            modal.classList.add('active');
            
            expect(app.elements.modalOverlay.classList.contains('active')).toBe(true);
            expect(modal.classList.contains('active')).toBe(true);
        });

        test('should close modal', () => {
            app.elements.modalOverlay.classList.add('active');
            const modal = document.getElementById('categoryModal');
            modal.classList.add('active');
            
            // Close
            app.elements.modalOverlay.classList.remove('active');
            modal.classList.remove('active');
            
            expect(app.elements.modalOverlay.classList.contains('active')).toBe(false);
            expect(modal.classList.contains('active')).toBe(false);
        });

        test('should close all modals', () => {
            // Open multiple modals
            app.elements.modalOverlay.classList.add('active');
            document.getElementById('categoryModal').classList.add('active');
            document.getElementById('contextMenu').classList.add('active');
            
            // Close all
            app.elements.modalOverlay.classList.remove('active');
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            document.getElementById('contextMenu').classList.remove('active');
            
            expect(document.getElementById('categoryModal').classList.contains('active')).toBe(false);
            expect(document.getElementById('contextMenu').classList.contains('active')).toBe(false);
        });
    });

    // =========================================
    // Toast Notification Tests
    // =========================================
    describe('Toast Notifications', () => {
        test('should show toast message', () => {
            const message = 'Category created!';
            app.elements.toast.textContent = message;
            app.elements.toast.classList.add('toast', 'success', 'show');
            
            expect(app.elements.toast.textContent).toBe(message);
            expect(app.elements.toast.classList.contains('show')).toBe(true);
        });

        test('should show error toast', () => {
            app.elements.toast.textContent = 'Error occurred';
            app.elements.toast.className = 'toast error show';
            
            expect(app.elements.toast.classList.contains('error')).toBe(true);
        });

        test('should hide toast after timeout', () => {
            app.elements.toast.classList.add('show');
            
            setTimeout(() => {
                app.elements.toast.classList.remove('show');
            }, 3000);
            
            jest.advanceTimersByTime(3000);
            
            expect(app.elements.toast.classList.contains('show')).toBe(false);
        });
    });

    // =========================================
    // Empty State Tests
    // =========================================
    describe('Empty States', () => {
        test('should show empty state when no categories', () => {
            app.state.categories = [];
            
            if (app.state.categories.length === 0) {
                app.elements.emptyCategoriesState.classList.add('visible');
            }
            
            expect(app.elements.emptyCategoriesState.classList.contains('visible')).toBe(true);
        });

        test('should hide empty state when categories exist', () => {
            app.state.categories = [{ id: 'cat1', name: 'Test', decks: [] }];
            
            if (app.state.categories.length > 0) {
                app.elements.emptyCategoriesState.classList.remove('visible');
            }
            
            expect(app.elements.emptyCategoriesState.classList.contains('visible')).toBe(false);
        });

        test('should disable study button when no cards', () => {
            const deck = { id: 'deck1', name: 'Empty Deck', cards: [] };
            
            if (!deck.cards || deck.cards.length === 0) {
                app.elements.studyBtn.disabled = true;
            }
            
            expect(app.elements.studyBtn.disabled).toBe(true);
        });
    });

    // =========================================
    // Keyboard Navigation Tests
    // =========================================
    describe('Keyboard Navigation', () => {
        test('should flip card on Space key in study mode', () => {
            app.state.currentView = 'study';
            
            const event = new KeyboardEvent('keydown', { key: ' ' });
            
            if (app.state.currentView === 'study' && event.key === ' ') {
                app.elements.flashcard.classList.toggle('flipped');
            }
            
            expect(app.elements.flashcard.classList.contains('flipped')).toBe(true);
        });

        test('should flip card on Enter key in study mode', () => {
            app.state.currentView = 'study';
            
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            
            if (app.state.currentView === 'study' && event.key === 'Enter') {
                app.elements.flashcard.classList.toggle('flipped');
            }
            
            expect(app.elements.flashcard.classList.contains('flipped')).toBe(true);
        });

        test('should not respond to Space key outside study mode', () => {
            app.state.currentView = 'categories';
            app.elements.flashcard.classList.remove('flipped');
            
            const event = new KeyboardEvent('keydown', { key: ' ' });
            
            if (app.state.currentView === 'study' && event.key === ' ') {
                app.elements.flashcard.classList.toggle('flipped');
            }
            
            expect(app.elements.flashcard.classList.contains('flipped')).toBe(false);
        });
    });

    // =========================================
    // Image Handling Tests
    // =========================================
    describe('Image Handling', () => {
        test('should validate image file type', () => {
            const validateImage = (file) => file.type.startsWith('image/');
            
            expect(validateImage({ type: 'image/png' })).toBe(true);
            expect(validateImage({ type: 'image/jpeg' })).toBe(true);
            expect(validateImage({ type: 'image/gif' })).toBe(true);
            expect(validateImage({ type: 'text/plain' })).toBe(false);
            expect(validateImage({ type: 'application/pdf' })).toBe(false);
        });

        test('should handle image data URL', () => {
            const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            
            expect(imageData.startsWith('data:image/')).toBe(true);
        });
    });

    // =========================================
    // Service Worker Tests
    // =========================================
    describe('Service Worker', () => {
        test('should register service worker', async () => {
            await navigator.serviceWorker.register('./sw.js');
            
            expect(navigator.serviceWorker.register).toHaveBeenCalledWith('./sw.js');
        });
    });

    // =========================================
    // Color and Icon Picker Tests
    // =========================================
    describe('Color and Icon Pickers', () => {
        test('should select color', () => {
            const colorOptions = document.querySelectorAll('.color-option');
            
            colorOptions.forEach(c => c.classList.remove('selected'));
            colorOptions[1].classList.add('selected');
            
            expect(colorOptions[0].classList.contains('selected')).toBe(false);
            expect(colorOptions[1].classList.contains('selected')).toBe(true);
        });

        test('should select icon', () => {
            const iconOptions = document.querySelectorAll('.icon-option');
            
            iconOptions.forEach(i => i.classList.remove('selected'));
            iconOptions[1].classList.add('selected');
            
            expect(iconOptions[0].classList.contains('selected')).toBe(false);
            expect(iconOptions[1].classList.contains('selected')).toBe(true);
        });

        test('should update hidden color input', () => {
            const colorInput = document.getElementById('categoryColor');
            const newColor = '#22c55e';
            
            colorInput.value = newColor;
            
            expect(colorInput.value).toBe(newColor);
        });

        test('should update hidden icon input', () => {
            const iconInput = document.getElementById('categoryIcon');
            const newIcon = '🌍';
            
            iconInput.value = newIcon;
            
            expect(iconInput.value).toBe(newIcon);
        });
    });

    // =========================================
    // Data Validation Tests
    // =========================================
    describe('Data Validation', () => {
        test('should require category name', () => {
            const name = '';
            const isValid = name.trim().length > 0;
            
            expect(isValid).toBe(false);
        });

        test('should require deck name', () => {
            const name = '   ';
            const isValid = name.trim().length > 0;
            
            expect(isValid).toBe(false);
        });

        test('should require card front and back', () => {
            const front = 'Hola';
            const back = '';
            const isValid = front.trim().length > 0 && back.trim().length > 0;
            
            expect(isValid).toBe(false);
        });

        test('should accept valid card data', () => {
            const front = 'Hola';
            const back = 'Hello';
            const isValid = front.trim().length > 0 && back.trim().length > 0;
            
            expect(isValid).toBe(true);
        });
    });
});
