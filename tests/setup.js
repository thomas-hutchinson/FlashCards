// Jest Setup File

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: jest.fn((i) => Object.keys(store)[i] || null)
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
    value: {
        register: jest.fn().mockResolvedValue({
            scope: '/'
        }),
        ready: Promise.resolve({
            active: { state: 'activated' }
        }),
        controller: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    },
    writable: true
});

// Mock Touch Events
class Touch {
    constructor(options) {
        this.identifier = options.identifier || 0;
        this.target = options.target;
        this.clientX = options.clientX || 0;
        this.clientY = options.clientY || 0;
        this.pageX = options.pageX || options.clientX || 0;
        this.pageY = options.pageY || options.clientY || 0;
        this.screenX = options.screenX || 0;
        this.screenY = options.screenY || 0;
    }
}

global.Touch = Touch;

class TouchEvent extends Event {
    constructor(type, options = {}) {
        super(type, options);
        this.changedTouches = options.changedTouches || [];
        this.targetTouches = options.targetTouches || [];
        this.touches = options.touches || [];
    }
}

global.TouchEvent = TouchEvent;

// Clear mocks between tests
beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.body.innerHTML = '';
});

// Console error handling
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render is no longer supported')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
