const url = 'http://192.168.1.73:5000';

async function createUser() {
    try {
        const response = await axios.post(`${url}/user/add`, {
           fio:     'Онохов Павел',
           tableId: 50,
        });
        console.log(response);
    }
    catch(error) {
        console.error('Произошла ошибка', error);
    }
}

async function createComment() {
    try {
        const response = await axios.post(`${url}/comments/add`, {
            filmId: 1,
            commentText: 'Онохов Павел ',
            filmRating: 1000,
            userId: 8,
        });
        console.log(response);
    }
    catch(error) {
        console.error(error);
    }
}

createComment();