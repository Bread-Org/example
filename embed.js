(async () => {

   
    const scriptTag = document.currentScript;
    const api = scriptTag.dataset.api;
    const api2 = scriptTag.dataset.api2;
    const selectortarget = scriptTag.dataset.target;

    const target = document.querySelector(selectortarget);

    if (!target) {
        return;
    }

    let allGames = [];
    let displayedGames = []; // sort
    let currentSortOrder = 'az'; 
    let gamesPerPage = 30;
    let currentPage = 1;
    let totalPages = 1;

    // mf themes

    const themes = {
        light: {
            '--bg-primary': '#f3f4f6',
            '--bg-secondary': '#ffffff',
            '--text-primary': '#374151',
            '--text-secondary': '#6b7280',
            '--sidebar-bg': '#f9fafb',
            '--sidebar-border': '#e5e7eb',
            '--card-outline': '#e0e7ff',
            '--accent-blue': '#3b82f6',
            '--accent-blue-hover': '#2563eb',
            '--red-button': '#ef4444',
            '--red-button-hover': '#dc2626',
            '--gray-bg-hover': '#e5e7eb',
            '--input-bg': '#ffffff',
            '--input-border': '#e2e8f0',
            '--active-link-bg': '#e0e7ff',
            '--active-link-text': '#3b82f6',
            '--active-link-outline': '#93c5fd',
        },
        dark: {
            '--bg-primary': '#1a1a1a',
            '--bg-secondary': '#2d2d2d',
            '--text-primary': '#e5e7eb',
            '--text-secondary': '#9ca3af',
            '--sidebar-bg': '#222222',
            '--sidebar-border': '#333333',
            '--card-outline': '#374151',
            '--accent-blue': '#60a5fa',
            '--accent-blue-hover': '#3b82f6',
            '--red-button': '#ef4444',
            '--red-button-hover': '#dc2626',
            '--gray-bg-hover': '#333333',
            '--input-bg': '#3b3b3b',
            '--input-border': '#4a4a4a',
            '--active-link-bg': '#374151',
            '--active-link-text': '#60a5fa',
            '--active-link-outline': '#4f46e5',
        },
        // more themes lmoa
        ocean: {
            '--bg-primary': '#e0f2f7',
            '--bg-secondary': '#ffffff',
            '--text-primary': '#1c4e80',
            '--text-secondary': '#4a6a8a',
            '--sidebar-bg': '#d0efff',
            '--sidebar-border': '#a7d9f2',
            '--card-outline': '#87ceeb',
            '--accent-blue': '#0077b6',
            '--accent-blue-hover': '#005f9b',
            '--red-button': '#ef4444',
            '--red-button-hover': '#dc2626',
            '--gray-bg-hover': '#cceeff',
            '--input-bg': '#ffffff',
            '--input-border': '#a7d9f2',
            '--active-link-bg': '#87ceeb',
            '--active-link-text': '#1c4e80',
            '--active-link-outline': '#0077b6',
        },
        sunset: {
            '--bg-primary': '#fef3c7',
            '--bg-secondary': '#ffffff',
            '--text-primary': '#7c2d12',
            '--text-secondary': '#b45309',
            '--sidebar-bg': '#ffedd5',
            '--sidebar-border': '#fcd34d',
            '--card-outline': '#fde68a',
            '--accent-blue': '#f97316',
            '--accent-blue-hover': '#ea580c',
            '--red-button': '#ef4444',
            '--red-button-hover': '#dc2626',
            '--gray-bg-hover': '#ffecc0',
            '--input-bg': '#ffffff',
            '--input-border': '#fcd34d',
            '--active-link-bg': '#fde68a',
            '--active-link-text': '#7c2d12',
            '--active-link-outline': '#f97316',
        },
        hacker: {
            '--bg-primary': '#0a0a0a',
            '--bg-secondary': '#1a1a1a',
            '--text-primary': '#00ff00',
            '--text-secondary': '#00cc00',
            '--sidebar-bg': '#000000',
            '--sidebar-border': '#004400',
            '--card-outline': '#006600',
            '--accent-blue': '#00ff00',
            '--accent-blue-hover': '#00cc00',
            '--red-button': '#ff0000',
            '--red-button-hover': '#cc0000',
            '--gray-bg-hover': '#002200',
            '--input-bg': '#111111',
            '--input-border': '#004400',
            '--active-link-bg': '#003300',
            '--active-link-text': '#00ff00',
            '--active-link-outline': '#00ff00',
        }
    };


    function showMessage(message) {
        const modal = document.getElementById('messageModal');
        const modalText = document.getElementById('messageModalText');
        modalText.textContent = message;
        modal.classList.remove('hidden');
    }

    window.hideMessage = () => {
        document.getElementById('messageModal').classList.add('hidden');
    };


    const makecard = (games) => {
        return games.map(game => `
            <div
                onclick="opengame('${game.apiUrl}', '${game.alt}', '${game.title}')"
                class="game-card cursor-pointer rounded-xl p-3 m-2 inline-block w-52 text-center shadow-sm transition-transform duration-200 ease-in-out hover:scale-105 outline outline-2 outline-offset-2"
            >
                <img src="${game.apiUrl}/images/${game.alt}.webp" alt="${game.title} thumbnail" class="w-full h-32 object-cover rounded-md" onerror="this.onerror=null;this.src='https://placehold.co/200x120/e5e7eb/6b7280?text=No+Image';" />
                <h3 class="mt-2 text-lg font-medium">${game.title}</h3>
            </div>
        `).join("");
    };

     // sorts games 
     
    function sortGames(games, order) { 
        return [...games].sort((a, b) => {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            if (order === 'az') {
                return titleA.localeCompare(titleB);
            } else { // za
                return titleB.localeCompare(titleA);
            }
        });
    }


    const updateGameList = () => {
        const startIndex = (currentPage - 1) * gamesPerPage;
        const endIndex = startIndex + gamesPerPage;
        const gamesToRender = displayedGames.slice(startIndex, endIndex);
        if (gamesToRender.length === 0 && displayedGames.length > 0 && currentPage > 1) {
            currentPage--;
            updateGameList();
            return;
        }
        renderGames(gamesToRender);
        renderPaginationControls();
    };


    function renderGames(gamesToRender) {
        if (gamesToRender.length === 0 && document.getElementById('searchBar').value === '') {
            target.innerHTML = "<p class='text-center font-medium'>No games available.</p>";
        } else if (gamesToRender.length === 0) {
            target.innerHTML = "<p class='text-center font-medium'>No games found matching your search.</p>";
        } else {
            target.innerHTML = makecard(gamesToRender);
        }

        lucide.createIcons();
    }


    const filterGames = () => {
        const searchTerm = document.getElementById('searchBar').value.toLowerCase();
        let filtered = allGames.filter(game =>
            game.title.toLowerCase().includes(searchTerm) ||
            game.alt.toLowerCase().includes(searchTerm)
        );
        displayedGames = sortGames(filtered, currentSortOrder);
        totalPages = Math.ceil(displayedGames.length / gamesPerPage);
        currentPage = 1; 
        updateGameList();
    };

    // pages thingy 

    function renderPaginationControls() { 
        const paginationControls = document.getElementById('paginationControls');
        const pageNumbersContainer = document.getElementById('pageNumbers');

        if (!paginationControls || !pageNumbersContainer) {
            console.warn("Pagination controls or page numbers container not found.");
            return;
        }

        pageNumbersContainer.innerHTML = '';

        const maxPageButtons = 5; // sets the thingy (limit) for the change page thing
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        // naw lmao
        if (endPage - startPage + 1 < maxPageButtons && totalPages > maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        if (startPage > 1) {
            const ellipsisSpan = document.createElement('span');
            ellipsisSpan.textContent = '...';
            ellipsisSpan.classList.add('px-2', 'py-1', 'text-sm');
            pageNumbersContainer.appendChild(ellipsisSpan);
        }

        for (let i = startPage; i <= endPage; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.classList.add('pagination-btn', 'px-3', 'py-1', 'rounded-md', 'text-sm', 'transition-colors', 'duration-200');
            if (i === currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => showPage(i));
            pageNumbersContainer.appendChild(button);
        }

        if (endPage < totalPages) {
            const ellipsisSpan = document.createElement('span');
            ellipsisSpan.textContent = '...';
            ellipsisSpan.classList.add('px-2', 'py-1', 'text-sm');
            pageNumbersContainer.appendChild(ellipsisSpan);
        }


        document.getElementById('prevPageBtn').disabled = currentPage === 1;
        document.getElementById('nextPageBtn').disabled = currentPage === totalPages;
    }


    function showPage(page) { 
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        updateGameList();
    }


    function saveGameToHistory(game) { 
        let history = JSON.parse(localStorage.getItem('gameHistory')) || [];
        history = history.filter(item => item.alt !== game.alt);
        history.unshift(game); // Add to the beginning
        // 10 games limit 
        history = history.slice(0, 10);
        localStorage.setItem('gameHistory', JSON.stringify(history));
        displayGameHistory();
    }


    function displayGameHistory() {
        const historyContainer = document.getElementById('gameHistoryContainer');
        const noHistoryMessage = document.getElementById('noHistoryMessage');


        if (!historyContainer || !noHistoryMessage) {
            console.warn("History container or no history message element not found, skipping history display.");
            return;
        }

        const history = JSON.parse(localStorage.getItem('gameHistory')) || [];

        if (history.length === 0) {
            noHistoryMessage.classList.remove('hidden');
            historyContainer.innerHTML = ''; // delete the mf history
        } else {
            noHistoryMessage.classList.add('hidden');
            historyContainer.innerHTML = history.map(game => `
                <div
                    onclick="opengame('${game.apiUrl}', '${game.alt}', '${game.title}')"
                    class="flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 outline outline-1 outline-offset-1 outline-gray-200"
                >
                    <span class="font-medium">${game.title}</span>
                    <i data-lucide="play" class="w-5 h-5 text-blue-500"></i>
                </div>
            `).join('');
        }

        lucide.createIcons(); //naw 
    }


    function clearGameHistory() {
        localStorage.removeItem('gameHistory');
        displayGameHistory();
        showMessage('Game history cleared!');
    }

    // themes

    function setTheme(themeName) { 
        const selectedTheme = themes[themeName];
        if (selectedTheme) {
            for (const [property, value] of Object.entries(selectedTheme)) {
                document.documentElement.style.setProperty(property, value);
            }
            localStorage.setItem('theme', themeName);

            const themeSelectElement = document.getElementById('themeSelect');
            if (themeSelectElement) {
                themeSelectElement.value = themeName; 
            }
        }

        lucide.createIcons(); 
    }


    function initTheme() { 
        const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
        setTheme(savedTheme);
    }

    // Fullscreen

    function toggleFullscreen() { 
        const iframe = document.getElementById('gamePageFrame');
        if (iframe) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                iframe.requestFullscreen().catch(err => {
                    showMessage(`Error attempting to enable full-screen mode: ${err.message} (Is the iframe allowed to go fullscreen?)`);
                });
            }
        }
    }


    //sidebar logic

    function showSection(sectionId) { 
        const sections = ['gameContainer', 'gameHistorySection', 'settingsSection'];
        const searchSortSection = document.getElementById('searchSortSection');
        const paginationControls = document.getElementById('paginationControls');


        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                if (id === sectionId) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            }
        });

        if (searchSortSection) {
            if (sectionId === 'gameContainer') {
                searchSortSection.classList.remove('hidden');
            } else {
                searchSortSection.classList.add('hidden');
            }
        }


        if (paginationControls) {
            if (sectionId === 'gameContainer') {
                paginationControls.classList.remove('hidden');
            } else {
                paginationControls.classList.add('hidden');
            }
        }


        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });
        if (sectionId === 'gameContainer') {
            document.getElementById('navHomeBtn').classList.add('active');
        } else if (sectionId === 'gameHistorySection') {
            document.getElementById('navHistoryBtn').classList.add('active');
        } else if (sectionId === 'settingsSection') {
            document.getElementById('navSettingsBtn').classList.add('active');
        }
    }


    // Events

    document.getElementById('themeSelect').addEventListener('change', (event) => setTheme(event.target.value));
    document.getElementById('clearHistoryBtn').addEventListener('click', clearGameHistory);
    document.getElementById('searchBar').addEventListener('keyup', filterGames);
    document.getElementById('applySortBtn').addEventListener('click', filterGames);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

    // the thingy to change pages

    document.getElementById('prevPageBtn').addEventListener('click', () => showPage(currentPage - 1));
    document.getElementById('nextPageBtn').addEventListener('click', () => showPage(currentPage + 1));


    // Sidebar

    document.getElementById('navHomeBtn').addEventListener('click', () => showSection('gameContainer'));
    document.getElementById('navHistoryBtn').addEventListener('click', () => { showSection('gameHistorySection'); displayGameHistory(); });
    document.getElementById('navSettingsBtn').addEventListener('click', () => showSection('settingsSection'));


    // Initial setup

    initTheme(); 
    target.innerHTML = "<p class='text-center font-medium'>Loading games...</p>";
    showSection('gameContainer');

    try {

        const [response1, response2] = await Promise.all([
            fetch(`${api}/g.json`),
            fetch(`${api2}/g.json`)
        ]);


        const [games1, games2] = await Promise.all([
            response1.json(),
            response2.json()
        ]);


        allGames = [
            ...games1.map(game => ({ ...game, apiUrl: api })),
            ...games2.map(game => ({ ...game, apiUrl: api2 }))
        ];
        filterGames(); 


    


        const searchBar = document.getElementById('searchBar');
        searchBar.placeholder = `Search between ${allGames.length} games...`;


        const params = new URLSearchParams(window.location.search);
        const gameId = params.get('id');
        if (gameId) {
            const gameToOpen = allGames.find(game => game.alt === gameId);
            if (gameToOpen) {
                opengame(gameToOpen.apiUrl, gameToOpen.alt, gameToOpen.title);
            } else {
                showMessage('Game not found.');
                if (window.location.protocol !== 'blob:') {
                    history.replaceState({}, document.title, window.location.pathname);
                }
            }
        }


        lucide.createIcons();

    } catch (err) {
        target.innerHTML = "<p class='text-red-500 text-center font-medium'>Error loading games. Please try again later.</p>";
        console.error("Error loading games:", err);
        showMessage('Error loading games. Please try again later.');
    }


    window.opengame = (apiUrl, alt, title) => {
        const gamePageContainer = document.getElementById("gamePageContainer");
        const gamePageFrame = document.getElementById("gamePageFrame");
        const gamePageTitle = document.getElementById("gamePageTitle");

        gamePageTitle.textContent = title;
        gamePageFrame.src = `${apiUrl}/g/${alt}`;
        gamePageContainer.classList.remove("hidden");
        gamePageContainer.classList.add("flex"); 
        document.body.style.overflow = 'hidden'; // Prevent scrolling 


        if (window.location.protocol !== 'blob:') {
            const newUrl = `${window.location.pathname}?id=${alt}`;
            history.pushState({ gameAlt: alt }, title, newUrl);
        }


        saveGameToHistory({ apiUrl, alt, title });
    };


    window.closegame = () => {
        const gamePageContainer = document.getElementById("gamePageContainer");
        const gamePageFrame = document.getElementById("gamePageFrame");

        gamePageFrame.src = ""; 
        gamePageContainer.classList.add("hidden");
        gamePageContainer.classList.remove("flex"); 
        document.body.style.overflow = ''; 

        if (window.location.protocol !== 'blob:') {
            history.replaceState({}, document.title, window.location.pathname);
        }
    };


    window.addEventListener('popstate', (event) => {
        if (window.location.protocol !== 'blob:') {
            const params = new URLSearchParams(window.location.search);
            const gameId = params.get('id');
            if (gameId) {
                const gameToOpen = allGames.find(game => game.alt === gameId);
                if (gameToOpen) {
                    opengame(gameToOpen.apiUrl, gameToOpen.alt, gameToOpen.title);
                } else {
                    closegame(); // Close if game not found on popstate
                    showMessage('Game not found.');
                }
            } else {
                closegame(); 
            }
        }
    });


    lucide.createIcons();
})();