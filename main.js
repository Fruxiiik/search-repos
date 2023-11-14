'use strict'

const input = document.querySelector('input');
const listRepos = document.querySelector('.listRepos');
const listReposFavorite = document.querySelector('.listReposFavorite');
const gridFavorite = 'display: grid; gap: 5px; grid-template-columns: 300px 200px 100px 80px';

let favoriteRepositoriesArray = [];
let response;


function renderRepos(response) {
    let list = '<ul class="repo-list">'; // Начало списка
    for (let index = 0; index < response.length; index++) {
        list += `<li class="list-item">
            <a href="${response[index].html_url}" class="repo-link" target="_blank" data-key="${index}">${response[index].name}</a>
            <button class="add-repo" data-id="${index}">Add</button>
        </li>`;
    }
    list += '</ul>'; // Конец списка
    return list;
}


function renderFavoriteRepo(repo) {
    return `
        <div class="favorite-repository" data-favoriteid="${repo.id}">
            <p class="favorite-text">${repo.name}</p>
            <p class="favorite-text">${repo.owner}</p>
            <p class="favorite-text">${repo.stars}</p>
            <button class="remove-repo" data-removeid="${repo.id}" >Delete</button>
        </div>
    `;
}


const removeFavorite = id => {
    favoriteRepositoriesArray = favoriteRepositoriesArray.filter(element => element.id !== Number(id));
    listReposFavorite.removeChild(document.querySelector(`[data-favoriteid="${id}"]`));
    if (!favoriteRepositoriesArray.length) listReposFavorite.classList.add('inactive');
}

function addFavorite(repo) {
    const repoFavorite = {
        id: Number(Date.now()),
        name: repo.name,
        owner: repo.owner.login,
        stars: repo.watchers,
    };
    console.log(renderFavoriteRepo(repoFavorite));

    listReposFavorite.insertAdjacentHTML('beforeend', renderFavoriteRepo(repoFavorite));
    favoriteRepositoriesArray.push(repoFavorite);
    toggleFavoriteRepoListVisibility(favoriteRepositoriesArray);
}


function toggleFavoriteRepoListVisibility(hasFavorites) {
    if (hasFavorites) {
        listReposFavorite.classList.remove('inactive');
        listReposFavorite.classList.add('active');
    } else {
        listReposFavorite.classList.remove('active');
        listReposFavorite.classList.add('inactive');
    }
}


async function fetchGitHubApi(searchName) {
    try {
        if (!searchName.trim()) {
            listRepos.classList.remove('active');
            listRepos.classList.add('inactive');
            return null;
        }
        response = await fetch(`https://api.github.com/search/repositories?q=${searchName}&per_page=5`)
            .then(response => response.json())
            .then(repos => repos.items)
            .catch(error => console.log(error))
        if (response.length === 0) {
            console.warn('Repositories not found.');
            throw new Error('Repositories not found.');
        }
        // РЕНДЕР ДОБАВИТЬ
        const list = renderRepos(response);
        listRepos.innerHTML = list;
        listRepos.classList.remove('inactive');
        listRepos.classList.add('active');


    } catch (error) {
        console.log(error)
        listRepos.classList.remove('active');
        listRepos.classList.add('inactive');
        // console.error('Error fetching data:', error);
        // throw error;
    }
}


const debounce = (fn, ms) => {
    let timeout;
    return function () {
        const fnCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(fnCall, ms);
    };
}

const delayedRequest = debounce(fetchGitHubApi, 1000);

input.addEventListener('input', function (event) {
    delayedRequest(event.target.value);

})


listRepos.addEventListener('click', event => {
    if (event.target.tagName === 'BUTTON') {
        const repo = response[event.target.dataset.id];
        addFavorite(repo);
        input.value = '';
    }
})

listReposFavorite.addEventListener('click', event => {
    if (event.target.tagName === 'BUTTON') {
        removeFavorite(event.target.dataset.removeid);
    }
})