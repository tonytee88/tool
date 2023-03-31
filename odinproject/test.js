// Template how to create an element with a specific class and append it to the body
// const mainFrame = document.createElement('div');
// mainFrame.classList.add('book-container');
// body.append(mainFrame)

//steps to crete read-button
//create button button container
// append this.container in card
//use function to tinitiate state (True or False)
//change onclick function to 

const bookContainer = document.querySelector('.book-container');
const formPopup = document.querySelector('.form-popup');
const form = document.querySelector('.form-container');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const pagesInput = document.getElementById('pages');
const isReadInput = document.getElementById('is-read');
const submitButton = document.getElementById('submit-btn');

let myLibrary = [];
let title = '';
let author = '';
let pages = '';
let isRead = '';

// create add book button
const body = document.body
const addBookButton = document.createElement('button');
addBookButton.classList.add('add-book-btn');
const buttonText = document.createElement('div');
buttonText.textContent = 'Add Book';
const plusImage = document.createElement('img');
plusImage.src = 'images/plussign.png';
addBookButton.append(plusImage);
addBookButton.append(buttonText);
body.append(addBookButton)

function Book(title, author, pages, isRead) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.isRead = isRead;
}

const lesMiserables = new Book("Les misérables", "Victor Hugo", 666, false);
const lesChichis = new Book("Les Chichis", "Victor Hugo", 555, true);

myLibrary.push(lesChichis, lesMiserables);

// function to display initial read information of a book
Book.prototype.initialReadInfo = function (button) {
    if (this.isRead === true) {
      button.classList.add('has-read');
      button.textContent = 'Read';
    } else if (this.isRead === false) {
      button.classList.add('not-read');
      button.textContent = 'Not Read';
    }
  };

// function to toggle between "read" and "not read" on a book that's already displayed
Book.prototype.populateReadInfo = function (button) {
    if (this.isRead === true) {
      button.classList.remove('has-read');
      button.classList.add('not-read');
      button.textContent = 'Not Read';
      this.isRead = false;
    } else if (this.isRead === false) {
      button.classList.remove('not-read');
      button.classList.add('has-read');
      button.textContent = 'Read';
      this.isRead = true;
    }
  };


// Function to display myLibrary in book cards in the book container
function displayLibrary() {
    myLibrary.forEach((book, index) => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');
        bookContainer.prepend(bookCard);
        bookContainer.prepend(addBookButton);
        
        const bookInfo = document.createElement('div');
        const buttonContainer = document.createElement('div');
        bookInfo.classList.add('book-info');
        buttonContainer.classList.add('button-container');
        bookCard.append(bookInfo);
        bookCard.append(buttonContainer);

        const displayTitle = document.createElement('div');
        const displayAuthor = document.createElement('div');
        const displayPages = document.createElement('div');
        const displayRead = document.createElement('div');
        const displayRemove = document.createElement('div');
        bookInfo.append(displayTitle);
        bookInfo.append(displayAuthor);
        bookInfo.append(displayPages);
        buttonContainer.append(displayRead);
        buttonContainer.append(displayRemove);

        const isReadButton = document.createElement('button');
        const removeButton = document.createElement('button');
        isReadButton.classList.add('is-read-btn');
        removeButton.classList.add('remove-btn');
        displayRead.append(isReadButton);
        displayRemove.append(removeButton);

        displayTitle.textContent = book.title;
        displayAuthor.textContent = book.author;
        displayPages.textContent = `${book.pages} pages`;
        book.initialReadInfo(isReadButton);
        removeButton.textContent = 'Remove';
    
        isReadButton.addEventListener('click', () => {
            book.populateReadInfo(isReadButton);
          });

        removeButton.addEventListener('click', () => {
            myLibrary.splice(index, 1);
            updateBookDisplay();
            bookContainer.prepend(addBookButton);
            });
    });
}


// function to update book display
function updateBookDisplay() {
    while (bookContainer.firstChild) {
      bookContainer.removeChild(bookContainer.firstChild);
    }
    displayLibrary();
}

// function to add a new book to the library
function addBookToLibrary() {
    title = titleInput.value;
    author = authorInput.value;
    pages = pagesInput.value;
    isRead = isReadInput.checked;
  
    const newBook = new Book(title, author, pages, isRead);
    myLibrary.push(newBook);
    updateBookDisplay();
}

// function to display pop up form
function openForm() {
    formPopup.style.display = 'block';
    titleInput.focus();
}
  
  
// function to close pop up form
function closeForm() {
    formPopup.style.display = 'none';
    titleInput.value = '';
    authorInput.value = '';
    pagesInput.value = '';
    isReadInput.checked = false;
}


// set on click attribute to open the pop up form on the add book button
addBookButton.setAttribute('onclick', 'openForm()');
addButton = document.querySelector(".add-book-btn2");
addButton.setAttribute('onclick', 'openForm()');


// event listener to add book to the library when submit is clicked on the pop up form
submitButton.addEventListener('click', (e) => {
    if (!form.checkValidity()) {
        form.reportValidity();
    } 
    else {
        addBookToLibrary();
        closeForm();
        e.preventDefault();

        titleInput.value = '';
        authorInput.value = '';
        pagesInput.value = '';
        isReadInput.checked = false;
    }
});

updateBookDisplay()

