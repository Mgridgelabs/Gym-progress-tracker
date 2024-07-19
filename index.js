document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const exerciseLogForm = document.getElementById('exerciseLogForm');
    const exerciseLogList = document.getElementById('exerciseLogList');
    const categoryForm = document.getElementById('categoriesForm');
    const categoryList = document.getElementById('categoryList');
    const searchResultsList = document.getElementById('searchResultsList');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('#search button');

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(registerForm);
        const userData = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('User registered:', data);
            alert('User registered successfully');
            registerForm.reset();
            const regModal = bootstrap.Modal.getInstance(document.getElementById('reg-modal'));
            regModal.hide();
        })
        .catch(error => {
            console.error('Error registering user:', error);
            alert('Error registering user');
        });
    });

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');

        fetch('http://localhost:3000/users')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(users => {
            const user = users.find(user => user.username === username && user.password === password);
            if (user) {
                console.log('Logged in successfully:', user);
                alert('Logged in successfully');
                loginForm.reset();
                const logModal = bootstrap.Modal.getInstance(document.getElementById('log-modal'));
                logModal.hide();
            } else {
                alert('Invalid username or password');
            }
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            alert('Error logging in');
        });
    });

    exerciseLogForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const exerciseData = {
            date: document.getElementById('exerciseDate').value,
            type: document.getElementById('exerciseType').value,
            sets: document.getElementById('exerciseSets').value,
            reps: document.getElementById('exerciseReps').value,
            weight: document.getElementById('exerciseWeight').value
        };

        fetch('http://localhost:3000/exercises', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(exerciseData)
        })
        .then(response => response.json())
        .then(data => {
            displayLoggedExercise(data);
            exerciseLogForm.reset();
        })
        .catch(error => console.error('Error:', error));
    });

    function displayLoggedExercise(exercise) {
        const li = document.createElement('li');
        li.textContent = `Date: ${exercise.date}, Type: ${exercise.type}, Sets: ${exercise.sets}, Reps: ${exercise.reps}, Weight: ${exercise.weight} kg`;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            const newDate = prompt('Enter new date:', exercise.date);
            const newType = prompt('Enter new type:', exercise.type);
            const newSets = prompt('Enter new sets:', exercise.sets);
            const newReps = prompt('Enter new reps:', exercise.reps);
            const newWeight = prompt('Enter new weight:', exercise.weight);

            if (newDate && newType && newSets && newReps && newWeight) {
                updateExercise(exercise.id, {
                    date: newDate,
                    type: newType,
                    sets: newSets,
                    reps: newReps,
                    weight: newWeight
                });
            }
        });
        li.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            const confirmDelete = confirm(`Are you sure you want to delete this exercise?`);
            if (confirmDelete) {
                deleteExercise(exercise.id);
            }
        });
        li.appendChild(deleteButton);

        exerciseLogList.appendChild(li);
    }

    function updateExercise(id, updatedData) {
        fetch(`http://localhost:3000/exercises/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.json())
        .then(data => {
            loadExercises();
        })
        .catch(error => console.error('Error:', error));
    }

    function deleteExercise(id) {
        fetch(`http://localhost:3000/exercises/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            loadExercises();
        })
        .catch(error => console.error('Error:', error));
    }

    function loadExercises() {
        fetch('http://localhost:3000/exercises')
            .then(response => response.json())
            .then(data => {
                exerciseLogList.innerHTML = '';
                data.forEach(exercise => {
                    displayLoggedExercise(exercise);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    loadExercises();

    categoryForm.addEventListener('submit', event => {
        event.preventDefault();
    
        const categoryName = document.getElementById('categoryName').value.trim();
       
        const categoryData = { 
            name: categoryName 
        };

        fetch('http://localhost:3000/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        })
        .then(response => response.json())
        .then(data => {
            displayCategory(data);
            categoryForm.reset(); 
        })
        .catch(error => console.error('Error:', error));
    });
    
    function displayCategory(category) {
        const li = document.createElement('li');
        li.dataset.categoryId = category.id; 
    
        const span = document.createElement('span');
        span.textContent = category.name;
        li.appendChild(span);
    
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            const newName = prompt('Enter new category name:', category.name);
            if (newName && newName.trim() !== '') {
                updateCategory(category.id, newName.trim());
            }
        });
        li.appendChild(editButton);
    
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            const confirmDelete = confirm(`Are you sure you want to delete '${category.name}'?`);
            if (confirmDelete) {
                deleteCategory(category.id);
            }
        });
        li.appendChild(deleteButton);
    
        categoryList.appendChild(li);
    }
    
    function updateCategory(categoryId, newName) {
        const categoryData = { name: newName };
        fetch(`http://localhost:3000/categories/${categoryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update category');
            }
            return response.json();
        })
        .then(updatedCategory => {
            const liToUpdate = categoryList.querySelector(`li[data-category-id="${categoryId}"]`);
            if (liToUpdate) {
                liToUpdate.querySelector('span').textContent = updatedCategory.name;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating category');
        });
    }
    
    function deleteCategory(categoryId) {
        fetch(`http://localhost:3000/categories/${categoryId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete category');
            }
            
            const liToRemove = categoryList.querySelector(`li[data-category-id="${categoryId}"]`);
            if (liToRemove) {
                liToRemove.remove();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting category');
        });
    }
    
    function loadCategories() {
        fetch('http://localhost:3000/categories')
            .then(response => response.json())
            .then(data => {
                categoryList.innerHTML = '';
                data.forEach(category => {
                    displayCategory(category);
                });
            })
            .catch(error => console.error('Error:', error));
    }
    
    loadCategories();

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchExercises(query);
        }
    });

    function searchExercises(query) {
        fetch(`http://localhost:3000/exercises?q=${query}`)
            .then(response => response.json())
            .then(data => {
                searchResultsList.innerHTML = '';
                data.forEach(exercise => {
                    const li = document.createElement('li');
                    li.textContent = `Date: ${exercise.date}, Type: ${exercise.type}, Sets: ${exercise.sets}, Reps: ${exercise.reps}, Weight: ${exercise.weight} kg`;
                    searchResultsList.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    }
});
