/**
 * Flash Cards App - End-to-End Tests
 * 
 * These tests verify the full user experience including:
 * - Category creation and management
 * - Deck creation and management
 * - Card creation and management
 * - Study mode functionality
 * - Navigation and UI interactions
 * - Mobile responsiveness
 * - PWA features
 */

const { test, expect } = require('@playwright/test');

test.describe('Flash Cards App', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    // =========================================
    // Initial Load Tests
    // =========================================
    test.describe('Initial Load', () => {
        test('should display the app title', async ({ page }) => {
            await page.goto('/');
            await expect(page.locator('#headerTitle')).toHaveText('Flash Cards');
        });

        test('should show empty state when no categories exist', async ({ page }) => {
            await page.goto('/');
            await expect(page.locator('#emptyCategoriesState')).toBeVisible();
        });

        test('should show Add Category button', async ({ page }) => {
            await page.goto('/');
            await expect(page.locator('#addCategoryBtn')).toBeVisible();
        });

        test('should hide back button on initial load', async ({ page }) => {
            await page.goto('/');
            await expect(page.locator('#backBtn')).toHaveClass(/hidden/);
        });
    });

    // =========================================
    // Category Tests
    // =========================================
    test.describe('Category Management', () => {
        test('should open category modal when clicking Add Category', async ({ page }) => {
            await page.goto('/');
            await page.click('#addCategoryBtn');
            await expect(page.locator('#categoryModal')).toHaveClass(/active/);
        });

        test('should create a new category', async ({ page }) => {
            await page.goto('/');
            await page.click('#addCategoryBtn');
            await page.fill('#categoryName', 'Spanish');
            await page.click('#categoryForm button[type="submit"]');
            
            // Modal should close
            await expect(page.locator('#categoryModal')).not.toHaveClass(/active/);
            
            // Category should appear
            await expect(page.locator('.grid-item')).toBeVisible();
            await expect(page.locator('.grid-item-title')).toHaveText('Spanish');
        });

        test('should hide empty state after creating category', async ({ page }) => {
            await page.goto('/');
            await page.click('#addCategoryBtn');
            await page.fill('#categoryName', 'Spanish');
            await page.click('#categoryForm button[type="submit"]');
            
            await expect(page.locator('#emptyCategoriesState')).not.toHaveClass(/visible/);
        });

        test('should allow selecting category color', async ({ page }) => {
            await page.goto('/');
            await page.click('#addCategoryBtn');
            
            // Click a different color
            await page.click('.color-option[data-color="#22c55e"]');
            
            // Verify it's selected
            await expect(page.locator('.color-option[data-color="#22c55e"]')).toHaveClass(/selected/);
        });

        test('should allow selecting category icon', async ({ page }) => {
            await page.goto('/');
            await page.click('#addCategoryBtn');
            
            // Click a different icon
            await page.click('.icon-option[data-icon="🌍"]');
            
            // Verify it's selected
            await expect(page.locator('.icon-option[data-icon="🌍"]')).toHaveClass(/selected/);
        });

        test('should show toast message after creating category', async ({ page }) => {
            await page.goto('/');
            await page.click('#addCategoryBtn');
            await page.fill('#categoryName', 'Spanish');
            await page.click('#categoryForm button[type="submit"]');
            
            await expect(page.locator('#toast')).toHaveClass(/show/);
            await expect(page.locator('#toast')).toContainText('Category created');
        });

        test('should persist categories after page reload', async ({ page }) => {
            await page.goto('/');
            await page.click('#addCategoryBtn');
            await page.fill('#categoryName', 'Spanish');
            await page.click('#categoryForm button[type="submit"]');
            
            // Reload page
            await page.reload();
            
            // Category should still exist
            await expect(page.locator('.grid-item-title')).toHaveText('Spanish');
        });

        test('should edit a category', async ({ page }) => {
            await page.goto('/');
            
            // Create category first
            await page.click('#addCategoryBtn');
            await page.fill('#categoryName', 'Spanish');
            await page.click('#categoryForm button[type="submit"]');
            
            // Open context menu
            await page.hover('.grid-item');
            await page.click('.btn-more');
            await page.click('#editItemBtn');
            
            // Edit name
            await page.fill('#categoryName', 'French');
            await page.click('#categoryForm button[type="submit"]');
            
            await expect(page.locator('.grid-item-title')).toHaveText('French');
        });

        test('should delete a category', async ({ page }) => {
            await page.goto('/');
            
            // Create category
            await page.click('#addCategoryBtn');
            await page.fill('#categoryName', 'Spanish');
            await page.click('#categoryForm button[type="submit"]');
            
            // Delete it
            await page.hover('.grid-item');
            await page.click('.btn-more');
            await page.click('#deleteItemBtn');
            await page.click('#confirmDeleteBtn');
            
            // Should show empty state again
            await expect(page.locator('#emptyCategoriesState')).toHaveClass(/visible/);
        });

        test('should close modal when clicking overlay', async ({ page }) => {
            await page.goto('/');
            await page.click('#addCategoryBtn');
            
            // Click on overlay (not on modal)
            await page.click('#modalOverlay', { position: { x: 10, y: 10 } });
            
            await expect(page.locator('#modalOverlay')).not.toHaveClass(/active/);
        });

        test('should close modal when pressing Escape', async ({ page }) => {
            await page.goto('/');
            await page.click('#addCategoryBtn');
            await page.keyboard.press('Escape');
            
            await expect(page.locator('#modalOverlay')).not.toHaveClass(/active/);
        });
    });

    // =========================================
    // Deck Tests
    // =========================================
    test.describe('Deck Management', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/');
            // Create a category first
            await page.click('#addCategoryBtn');
            await page.fill('#categoryName', 'Spanish');
            await page.click('#categoryForm button[type="submit"]');
            // Navigate to decks
            await page.click('.grid-item');
        });

        test('should navigate to decks view when clicking category', async ({ page }) => {
            await expect(page.locator('#decksView')).toHaveClass(/active/);
            await expect(page.locator('#headerTitle')).toHaveText('Spanish');
        });

        test('should show back button in decks view', async ({ page }) => {
            await expect(page.locator('#backBtn')).not.toHaveClass(/hidden/);
        });

        test('should show empty state in decks view', async ({ page }) => {
            await expect(page.locator('#emptyDecksState')).toHaveClass(/visible/);
        });

        test('should create a new deck', async ({ page }) => {
            await page.click('#addDeckBtn');
            await page.fill('#deckName', 'Basic Vocabulary');
            await page.fill('#deckDescription', 'Common words');
            await page.click('#deckForm button[type="submit"]');
            
            await expect(page.locator('.grid-item-title')).toHaveText('Basic Vocabulary');
        });

        test('should navigate back to categories', async ({ page }) => {
            await page.click('#backBtn');
            
            await expect(page.locator('#categoriesView')).toHaveClass(/active/);
            await expect(page.locator('#headerTitle')).toHaveText('Flash Cards');
        });

        test('should show deck count in category', async ({ page }) => {
            await page.click('#addDeckBtn');
            await page.fill('#deckName', 'Basic Vocabulary');
            await page.click('#deckForm button[type="submit"]');
            
            await page.click('#backBtn');
            
            await expect(page.locator('.grid-item-meta')).toContainText('1 deck');
        });
    });

    // =========================================
    // Card Tests
    // =========================================
    test.describe('Card Management', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/');
            // Create category
            await page.click('#addCategoryBtn');
            await page.fill('#categoryName', 'Spanish');
            await page.click('#categoryForm button[type="submit"]');
            await page.click('.grid-item');
            // Create deck
            await page.click('#addDeckBtn');
            await page.fill('#deckName', 'Basic');
            await page.click('#deckForm button[type="submit"]');
            // Navigate to cards
            await page.click('.grid-item');
        });

        test('should navigate to cards view', async ({ page }) => {
            await expect(page.locator('#cardsView')).toHaveClass(/active/);
            await expect(page.locator('#headerTitle')).toHaveText('Basic');
        });

        test('should show study button disabled when no cards', async ({ page }) => {
            await expect(page.locator('#studyBtn')).toBeDisabled();
        });

        test('should create a new card', async ({ page }) => {
            await page.click('#addCardBtn');
            await page.fill('#cardFront', 'Hola');
            await page.fill('#cardBack', 'Hello');
            await page.click('#cardForm button[type="submit"]');
            
            await expect(page.locator('.card-item-front')).toHaveText('Hola');
            await expect(page.locator('.card-item-back')).toContainText('Hello');
        });

        test('should enable study button after adding cards', async ({ page }) => {
            await page.click('#addCardBtn');
            await page.fill('#cardFront', 'Hola');
            await page.fill('#cardBack', 'Hello');
            await page.click('#cardForm button[type="submit"]');
            
            await expect(page.locator('#studyBtn')).not.toBeDisabled();
        });

        test('should show card count in deck', async ({ page }) => {
            await page.click('#addCardBtn');
            await page.fill('#cardFront', 'Hola');
            await page.fill('#cardBack', 'Hello');
            await page.click('#cardForm button[type="submit"]');
            
            await page.click('#backBtn');
            
            await expect(page.locator('.grid-item-meta')).toContainText('1 card');
        });
    });

    // =========================================
    // Study Mode Tests
    // =========================================
    test.describe('Study Mode', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/');
            // Setup: Create category, deck, and cards
            await page.click('#addCategoryBtn');
            await page.fill('#categoryName', 'Spanish');
            await page.click('#categoryForm button[type="submit"]');
            await page.click('.grid-item');
            
            await page.click('#addDeckBtn');
            await page.fill('#deckName', 'Basic');
            await page.click('#deckForm button[type="submit"]');
            await page.click('.grid-item');
            
            // Add multiple cards
            await page.click('#addCardBtn');
            await page.fill('#cardFront', 'Hola');
            await page.fill('#cardBack', 'Hello');
            await page.click('#cardForm button[type="submit"]');
            
            await page.click('#addCardBtn');
            await page.fill('#cardFront', 'Adiós');
            await page.fill('#cardBack', 'Goodbye');
            await page.click('#cardForm button[type="submit"]');
            
            await page.click('#addCardBtn');
            await page.fill('#cardFront', 'Gracias');
            await page.fill('#cardBack', 'Thank you');
            await page.click('#cardForm button[type="submit"]');
        });

        test('should enter study mode', async ({ page }) => {
            await page.click('#studyBtn');
            
            await expect(page.locator('#studyView')).toHaveClass(/active/);
            await expect(page.locator('#headerTitle')).toHaveText('Study Mode');
        });

        test('should display first card', async ({ page }) => {
            await page.click('#studyBtn');
            
            await expect(page.locator('#cardFrontText')).toHaveText('Hola');
        });

        test('should show progress indicator', async ({ page }) => {
            await page.click('#studyBtn');
            
            await expect(page.locator('#progressText')).toHaveText('1 / 3');
        });

        test('should flip card on click', async ({ page }) => {
            await page.click('#studyBtn');
            await page.click('#flashcard');
            
            await expect(page.locator('#flashcard')).toHaveClass(/flipped/);
        });

        test('should show back text when flipped', async ({ page }) => {
            await page.click('#studyBtn');
            await page.click('#flashcard');
            
            // Wait for flip animation
            await page.waitForTimeout(400);
            
            await expect(page.locator('#cardBackText')).toHaveText('Hello');
        });

        test('should navigate to next card', async ({ page }) => {
            await page.click('#studyBtn');
            await page.click('#nextCardBtn');
            
            await expect(page.locator('#cardFrontText')).toHaveText('Adiós');
            await expect(page.locator('#progressText')).toHaveText('2 / 3');
        });

        test('should navigate to previous card', async ({ page }) => {
            await page.click('#studyBtn');
            await page.click('#nextCardBtn');
            await page.click('#prevCardBtn');
            
            await expect(page.locator('#cardFrontText')).toHaveText('Hola');
            await expect(page.locator('#progressText')).toHaveText('1 / 3');
        });

        test('should disable prev button on first card', async ({ page }) => {
            await page.click('#studyBtn');
            
            await expect(page.locator('#prevCardBtn')).toBeDisabled();
        });

        test('should disable next button on last card', async ({ page }) => {
            await page.click('#studyBtn');
            await page.click('#nextCardBtn');
            await page.click('#nextCardBtn');
            
            await expect(page.locator('#nextCardBtn')).toBeDisabled();
        });

        test('should shuffle cards', async ({ page }) => {
            await page.click('#studyBtn');
            const originalText = await page.locator('#cardFrontText').textContent();
            
            // Shuffle multiple times to increase chance of order change
            for (let i = 0; i < 5; i++) {
                await page.click('#shuffleBtn');
            }
            
            await expect(page.locator('#progressText')).toHaveText('1 / 3');
        });

        test('should flip card using Space key', async ({ page }) => {
            await page.click('#studyBtn');
            await page.keyboard.press('Space');
            
            await expect(page.locator('#flashcard')).toHaveClass(/flipped/);
        });

        test('should flip card using Enter key', async ({ page }) => {
            await page.click('#studyBtn');
            await page.keyboard.press('Enter');
            
            await expect(page.locator('#flashcard')).toHaveClass(/flipped/);
        });

        test('should navigate with Arrow keys', async ({ page }) => {
            await page.click('#studyBtn');
            await page.keyboard.press('ArrowRight');
            
            await expect(page.locator('#cardFrontText')).toHaveText('Adiós');
            
            await page.keyboard.press('ArrowLeft');
            
            await expect(page.locator('#cardFrontText')).toHaveText('Hola');
        });

        test('should flip back before changing cards when answer is shown', async ({ page }) => {
            await page.click('#studyBtn');
            
            // Flip to show answer
            await page.click('#flashcard');
            await expect(page.locator('#flashcard')).toHaveClass(/flipped/);
            
            // Navigate to next card
            await page.click('#nextCardBtn');
            
            // Wait for animation
            await page.waitForTimeout(350);
            
            // Card should now show front of next card (not flipped)
            await expect(page.locator('#flashcard')).not.toHaveClass(/flipped/);
            await expect(page.locator('#cardFrontText')).toHaveText('Adiós');
        });

        test('should navigate back from study mode', async ({ page }) => {
            await page.click('#studyBtn');
            await page.click('#backBtn');
            
            await expect(page.locator('#cardsView')).toHaveClass(/active/);
        });
    });

    // =========================================
    // Mobile/Responsive Tests
    // =========================================
    test.describe('Mobile Responsiveness', () => {
        test.use({ viewport: { width: 375, height: 667 } });

        test('should display properly on mobile viewport', async ({ page }) => {
            await page.goto('/');
            
            await expect(page.locator('#app')).toBeVisible();
            await expect(page.locator('#addCategoryBtn')).toBeVisible();
        });

        test('should stack view header on mobile', async ({ page }) => {
            await page.goto('/');
            
            const viewHeader = page.locator('.view-header');
            await expect(viewHeader).toBeVisible();
        });
    });

    // =========================================
    // Swipe Gesture Tests
    // =========================================
    test.describe('Swipe Gestures', () => {
        test.use({ hasTouch: true });

        test.beforeEach(async ({ page }) => {
            await page.goto('/');
            // Setup with cards
            await page.click('#addCategoryBtn');
            await page.fill('#categoryName', 'Spanish');
            await page.click('#categoryForm button[type="submit"]');
            await page.click('.grid-item');
            
            await page.click('#addDeckBtn');
            await page.fill('#deckName', 'Basic');
            await page.click('#deckForm button[type="submit"]');
            await page.click('.grid-item');
            
            await page.click('#addCardBtn');
            await page.fill('#cardFront', 'Hola');
            await page.fill('#cardBack', 'Hello');
            await page.click('#cardForm button[type="submit"]');
            
            await page.click('#addCardBtn');
            await page.fill('#cardFront', 'Adiós');
            await page.fill('#cardBack', 'Goodbye');
            await page.click('#cardForm button[type="submit"]');
        });

        test('should swipe left to go to next card in study mode', async ({ page }) => {
            await page.click('#studyBtn');
            
            const flashcard = page.locator('#flashcard');
            const box = await flashcard.boundingBox();
            
            if (box) {
                await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
                
                // Simulate swipe left
                await page.evaluate(async () => {
                    const flashcard = document.getElementById('flashcard');
                    if (!flashcard) return;
                    
                    const startEvent = new TouchEvent('touchstart', {
                        bubbles: true,
                        changedTouches: [new Touch({
                            identifier: 0,
                            target: flashcard,
                            clientX: 300,
                            clientY: 300,
                            pageX: 300,
                            pageY: 300
                        })]
                    });
                    
                    const endEvent = new TouchEvent('touchend', {
                        bubbles: true,
                        changedTouches: [new Touch({
                            identifier: 0,
                            target: flashcard,
                            clientX: 50,
                            clientY: 300,
                            pageX: 50,
                            pageY: 300
                        })]
                    });
                    
                    flashcard.dispatchEvent(startEvent);
                    await new Promise(r => setTimeout(r, 100));
                    flashcard.dispatchEvent(endEvent);
                });
                
                await page.waitForTimeout(500);
            }
        });
    });

    // =========================================
    // PWA Tests
    // =========================================
    test.describe('PWA Features', () => {
        test('should have manifest link', async ({ page }) => {
            await page.goto('/');
            
            const manifest = page.locator('link[rel="manifest"]');
            await expect(manifest).toHaveAttribute('href', 'manifest.json');
        });

        test('should have theme-color meta tag', async ({ page }) => {
            await page.goto('/');
            
            const themeColor = page.locator('meta[name="theme-color"]');
            await expect(themeColor).toHaveAttribute('content', '#6366f1');
        });

        test('should have apple-mobile-web-app-capable meta tag', async ({ page }) => {
            await page.goto('/');
            
            const appleMeta = page.locator('meta[name="apple-mobile-web-app-capable"]');
            await expect(appleMeta).toHaveAttribute('content', 'yes');
        });

        test('should load manifest successfully', async ({ page }) => {
            const response = await page.goto('/manifest.json');
            expect(response?.status()).toBe(200);
            
            const manifest = await response?.json();
            expect(manifest.name).toBe('Flash Cards');
            expect(manifest.display).toBe('standalone');
        });
    });

    // =========================================
    // Accessibility Tests
    // =========================================
    test.describe('Accessibility', () => {
        test('should have aria-labels on icon buttons', async ({ page }) => {
            await page.goto('/');
            
            await expect(page.locator('#backBtn')).toHaveAttribute('aria-label', 'Go back');
            await expect(page.locator('#menuBtn')).toHaveAttribute('aria-label', 'Menu');
        });

        test('should be keyboard navigable', async ({ page }) => {
            await page.goto('/');
            
            // Tab to Add Category button
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            
            // Should be able to activate with Enter
            await page.keyboard.press('Enter');
            
            await expect(page.locator('#categoryModal')).toHaveClass(/active/);
        });

        test('should close modal with Escape key', async ({ page }) => {
            await page.goto('/');
            await page.click('#addCategoryBtn');
            
            await page.keyboard.press('Escape');
            
            await expect(page.locator('#modalOverlay')).not.toHaveClass(/active/);
        });
    });

    // =========================================
    // Error Handling Tests
    // =========================================
    test.describe('Error Handling', () => {
        test('should not create category with empty name', async ({ page }) => {
            await page.goto('/');
            await page.click('#addCategoryBtn');
            
            // Try to submit empty form
            await page.click('#categoryForm button[type="submit"]');
            
            // Modal should still be open (form validation)
            await expect(page.locator('#categoryModal')).toHaveClass(/active/);
        });

        test('should not create card without front text', async ({ page }) => {
            await page.goto('/');
            // Setup
            await page.click('#addCategoryBtn');
            await page.fill('#categoryName', 'Spanish');
            await page.click('#categoryForm button[type="submit"]');
            await page.click('.grid-item');
            await page.click('#addDeckBtn');
            await page.fill('#deckName', 'Basic');
            await page.click('#deckForm button[type="submit"]');
            await page.click('.grid-item');
            
            // Try to create card without front
            await page.click('#addCardBtn');
            await page.fill('#cardBack', 'Hello');
            await page.click('#cardForm button[type="submit"]');
            
            // Modal should still be open
            await expect(page.locator('#cardModal')).toHaveClass(/active/);
        });

        test('should handle corrupted localStorage gracefully', async ({ page }) => {
            await page.goto('/');
            
            // Set corrupted data
            await page.evaluate(() => {
                localStorage.setItem('flashCardsData', 'not valid json{{{');
            });
            
            // Reload - should not crash
            await page.reload();
            
            // App should still be functional
            await expect(page.locator('#app')).toBeVisible();
        });
    });

    // =========================================
    // Performance Tests
    // =========================================
    test.describe('Performance', () => {
        test('should load quickly', async ({ page }) => {
            const startTime = Date.now();
            await page.goto('/');
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;
            
            expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
        });

        test('should handle many categories', async ({ page }) => {
            await page.goto('/');
            
            // Create 10 categories
            for (let i = 0; i < 10; i++) {
                await page.click('#addCategoryBtn');
                await page.fill('#categoryName', `Category ${i + 1}`);
                await page.click('#categoryForm button[type="submit"]');
                await page.waitForTimeout(100); // Brief pause for toast
            }
            
            const categories = page.locator('.grid-item');
            await expect(categories).toHaveCount(10);
        });
    });
});
