const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book'
const STORAGE_KEY = 'BOOK_SHELF_APP'

//mengecek apakah storage mendukung atau tidak
function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Browser Kamu tidak mendukung local storage')
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('inputBook')
    submitForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addBook();
    })

    if (isStorageExist()) {
        loadDataFromStorage();
    }
})

//unik id
function generateId() {
    return +new Date();
}

function generateBook(id, title, author, timestamp, isComplete) {
    return { id, title, author, timestamp, isComplete }
}

//load data dari local storage
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY)
    let data = JSON.parse(serializedData)

    if (data !== null) {
        for (const book of data) {
            books.push(book)
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT))
}

//mencari buku dengan id
function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

//mencari index buku dengan id
function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

//mengubah inner text dari tombol add
const checkBox = document.getElementById('inputBookIsComplete');
checkBox.addEventListener('change', function() {
    if (checkBox.checked) {
        document.querySelector('span').innerText = 'Selesai Dibaca'
    } else if (!checkBox.checked) {
        document.querySelector('span').innerText = 'Belum Selesai Dibaca'
    }

    return checkBox;
})

//membuat elemen html buku dengan pengkondisian 
function makeBook(bookObject) {

    const { id, title, author, timestamp, isComplete } = bookObject;
    //Content
    const textTitle = document.createElement('h2')
    textTitle.innerText = title;

    const textAuthor = document.createElement('p')
    textAuthor.innerText = author;

    const textTimestamp = document.createElement('p')
    textTimestamp.innerText = timestamp;

    //button
    //undo button
    const undoButton = document.createElement('button')
    undoButton.innerText = 'Baca Lagi'
    undoButton.classList.add('green')

    const iconUndo = document.createElement('i')
    iconUndo.classList.add('fa-solid', 'fa-rotate-left')
    undoButton.append(iconUndo)

    undoButton.addEventListener('click', function() {
        undoBookFromCompleted(id)
    })

    //edit button
    const editButton = document.createElement('button')
    editButton.innerText = 'Edit Buku'
    editButton.classList.add('yellow')

    const editIcon = document.createElement('i')
    editIcon.classList.add('fa-solid', 'fa-pen-to-square')
    editButton.append(editIcon)
    editButton.addEventListener('click', function() {
        const modalBg = document.querySelector('.modal-bg')
        const close = document.getElementById('close')
        const bookId = this.closest('.book_item').id
        const form = document.getElementById('editBook')
        const bookItem = findBook(Number(bookId))
        console.log(bookId);

        const bookTitle = document.getElementById('editBookTitle')
        const bookAuthor = document.getElementById('editBookAuthor')
        const bookTimestamp = document.getElementById('editBookYear')
        const bookIsComplete = document.getElementById('editBookIsComplete')

        bookTitle.value = bookItem.title
        bookAuthor.value = bookItem.author
        bookTimestamp.value = bookItem.timestamp
        bookIsComplete.checked = bookItem.isComplete

        form.addEventListener('submit', function(e) {
            e.preventDefault()
            editBook(id)
            modalBg.classList.remove('bg-active')
        })
        modalBg.classList.add('bg-active')
        close.addEventListener('click', function() {
            modalBg.classList.remove('bg-active')
        })

    })

    //trash Button
    const trashButton = document.createElement('button')
    trashButton.innerText = 'Hapus'
    trashButton.classList.add('red')

    const trashIcon = document.createElement('i')
    trashIcon.classList.add('fa-solid', 'fa-trash')
    trashButton.append(trashIcon)

    trashButton.addEventListener('click', function() {
        let confirmed = confirm('Apakah anda ingin menghapus buku ?')
        if (confirmed) {
            removeBookFromCompleted(bookObject.id);
        } else {
            return;
        }
    })

    const checkButton = document.createElement('button')
    checkButton.innerText = 'Selesai Baca'
    checkButton.classList.add('green')

    const checkIcon = document.createElement('i')
    checkIcon.classList.add('fa-solid', 'fa-check')
    checkButton.append(checkIcon)

    checkButton.addEventListener('click', function() {
        addBookToCompleted(id)
    });


    //container
    const bookContainer = document.createElement('article')
    bookContainer.classList.add('book_item')
    bookContainer.append(textTitle, textAuthor, textTimestamp)
    bookContainer.setAttribute('id', id)

    const actionContainer = document.createElement('div')
    actionContainer.classList.add('action')

    if (bookObject.isComplete) {
        actionContainer.append(undoButton, editButton, trashButton)
        bookContainer.append(actionContainer)
    } else if (!bookObject.isComplete) {
        actionContainer.append(checkButton, editButton, trashButton)
        bookContainer.append(actionContainer)
    }

    return bookContainer;
}

//menambahkan buku
function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value
    const bookAuthor = document.getElementById('inputBookAuthor').value
    const timestamp = document.getElementById('inputBookYear').value
    const bookComplete = document.getElementById('inputBookIsComplete').checked

    const generatedID = generateId();
    const book = generateBook(generatedID, bookTitle, bookAuthor, timestamp, bookComplete)
    books.push(book)

    document.dispatchEvent(new Event(RENDER_EVENT))
    alert('Buku berhasil ditambahkan')
    location.reload()
    saveData();
}

//mengedit buku
function editBook(bookId) {
    const bookTarget = findBook(Number(bookId))
    if (bookTarget == null) return;

    const editTitle = document.getElementById('editBookTitle').value
    const editAuthor = document.getElementById('editBookAuthor').value
    const editTimestamp = document.getElementById('editBookYear').value
    const isComplete = document.getElementById('editBookIsComplete').checked

    bookTarget.title = editTitle
    bookTarget.author = editAuthor
    bookTarget.timestamp = editTimestamp
    bookTarget.isComplete = isComplete

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
    alert('Buku berhasil di edit')
}

//Fitur Search
document.getElementById('searchSubmit').addEventListener('click', (e) => {
    const input = document.getElementById('searchBookTitle').value.toLowerCase();
    const bookList = document.querySelectorAll('.book_item>h2')

    for (let book of bookList) {
        const title = book.textContent.toLowerCase();
        console.log(title);
        if (title.includes(input)) {
            book.parentElement.style.display = 'block';
        } else {
            book.parentElement.style.display = 'none';
        }
    }
    e.preventDefault();
})

//Untuk Menambahkan book ke sudah dibaca
function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId)

    if (bookTarget == null) return;

    bookTarget.isComplete = true
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData();
    alert('Memindahkan Buku ke sudah dibaca')
}

//menghapus buku
function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId)

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1)

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData();


}

//undo buku
function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId)

    if (bookTarget == null) return;

    bookTarget.isComplete = false
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData();
    alert('Buku di pindahkan ke belum dibaca')
}

//menyimpan data books ke local storage
function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books)
        localStorage.setItem(STORAGE_KEY, parsed)
        document.dispatchEvent(new Event(SAVED_EVENT))
    }
}

//custom event 
document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
})

//looping data dari books ke complete list dan uncomplete
document.addEventListener(RENDER_EVENT, function() {
    const uncompleteBookRead = document.getElementById('incompleteBookshelfList')
    const completeBookRead = document.getElementById('completeBookshelfList')

    uncompleteBookRead.innerHTML = '';
    completeBookRead.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            uncompleteBookRead.append(bookElement)
        } else if (bookItem.isComplete) {
            completeBookRead.append(bookElement)
        }
    }
})