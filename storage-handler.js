/**
 * CTS Transportation — Application State Manager
 * Persists all form data to localStorage across pages.
 * Auto-saves on input and auto-hydrates on page load.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'cts_application_state';

    // Determine which page we're on based on filename
    function getPageKey() {
        const path = window.location.pathname;
        const file = path.split('/').pop() || 'index.html';
        const map = {
            'form.html': 'w9',
            'driver-file.html': 'driver_file',
            'authorization.html': 'authorization',
            'employment-history.html': 'employment',
            'safety-performance-history.html': 'safety',
            'fcra-disclosure.html': 'fcra',
            'final-certification.html': 'certification',
        };
        return map[file] || null;
    }

    // Read full state from localStorage
    function loadState() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    // Write full state to localStorage
    function saveState(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // Get the section object for the current page
    function getPageState(state, pageKey) {
        if (!state[pageKey]) state[pageKey] = {};
        return state[pageKey];
    }

    // Save all inputs on the current page into localStorage
    function saveCurrentPage() {
        const pageKey = getPageKey();
        if (!pageKey) return;

        const state = loadState();
        const section = {};

        document.querySelectorAll('[data-field]').forEach(function (el) {
            const key = el.getAttribute('data-field');
            if (!key) return;

            if (el.type === 'checkbox') {
                section[key] = el.checked;
            } else if (el.type === 'radio') {
                if (el.checked) {
                    section[key] = el.value || el.nextElementSibling?.textContent?.trim() || 'selected';
                }
            } else if (el.tagName === 'SELECT') {
                section[key] = el.options[el.selectedIndex]?.text || el.value;
            } else {
                section[key] = el.value;
            }
        });

        state[pageKey] = section;
        saveState(state);
    }

    // Restore inputs from localStorage into the current page
    function hydrateCurrentPage() {
        const pageKey = getPageKey();
        if (!pageKey) return;

        const state = loadState();
        const section = state[pageKey];
        if (!section) return;

        document.querySelectorAll('[data-field]').forEach(function (el) {
            const key = el.getAttribute('data-field');
            if (!key || section[key] === undefined) return;

            if (el.type === 'checkbox') {
                el.checked = !!section[key];
            } else if (el.type === 'radio') {
                const val = section[key];
                const label = el.nextElementSibling?.textContent?.trim();
                if (el.value === val || label === val) {
                    el.checked = true;
                }
            } else if (el.tagName === 'SELECT') {
                for (let i = 0; i < el.options.length; i++) {
                    if (el.options[i].text === section[key] || el.options[i].value === section[key]) {
                        el.selectedIndex = i;
                        break;
                    }
                }
            } else {
                el.value = section[key];
            }
        });
    }

    // Initialize
    function init() {
        // Hydrate on load
        hydrateCurrentPage();

        // Auto-save on any input change
        document.addEventListener('input', saveCurrentPage);
        document.addEventListener('change', saveCurrentPage);
    }

    // Expose loadState globally for the summary page
    window.CTSStorage = {
        loadState: loadState,
        saveState: saveState,
        STORAGE_KEY: STORAGE_KEY,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
