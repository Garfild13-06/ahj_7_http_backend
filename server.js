const fs = require('fs');
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const path = require('path');
const uuid = require('uuid');

const app = new Koa();

let tickets = []; // Хранилище тикетов (в памяти)

// Путь к статическим файлам (если они нужны)
const public = path.join(__dirname, '/public');
app.use(koaStatic(public));

// Настройка body parser для обработки данных из POST/PUT запросов
app.use(koaBody({
    urlencoded: true,
    multipart: true,
}));

// Middleware для обработки CORS-запросов
app.use((ctx, next) => {
    if (ctx.request.method !== 'OPTIONS') {
        return next();
    }

    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
    ctx.response.status = 204;
});

// Основной обработчик запросов
app.use(async (ctx, next) => {
    const {method} = ctx.request;  // Получаем HTTP метод запроса
    const {id} = ctx.query;       // Получаем параметр 'id' из query

    // Обработка GET запросов
    if (method === 'GET') {
        if (id) {
            // Если указан id, возвращаем расширенные данные тикета
            const ticket = tickets.find(ticket => ticket.id === id);

            if (!ticket) {
                ctx.response.status = 404;
                ctx.response.body = JSON.stringify({error: 'Ticket not found.'});
                return;
            }

            ctx.response.set('Access-Control-Allow-Origin', '*');
            ctx.response.type = 'application/json';
            ctx.response.body = JSON.stringify(ticket); // Полные данные тикета
        } else {
            // Если id не указан, возвращаем краткий список тикетов
            ctx.response.set('Access-Control-Allow-Origin', '*');
            const shortTickets = tickets.map(ticket => ({
                id: ticket.id,
                title: ticket.title,
                createdAt: ticket.createdAt,
                status: ticket.status
            }));
            ctx.response.type = 'application/json';
            ctx.response.body = JSON.stringify(shortTickets); // Краткие данные тикетов
        }
    }

    // Обработка POST запросов для создания тикета
    else if (method === 'POST') {
        const {name, description, status} = ctx.request.body;

        // Проверяем наличие всех необходимых полей
        if (!name || !description || !status) {
            ctx.response.status = 400;
            ctx.response.body = JSON.stringify({error: 'Name, description, and status are required.'});
            return;
        }

        // Создаем новый тикет
        const newTicket = {
            id: uuid.v4(), // Генерируем уникальный ID
            title: name,
            description,
            status,
            createdAt: new Date().toISOString(),
        };

        tickets.push(newTicket); // Добавляем новый тикет в массив
        ctx.response.set('Access-Control-Allow-Origin', '*');
        ctx.response.type = 'application/json';
        ctx.response.body = JSON.stringify(newTicket); // Возвращаем созданный тикет
    }

    // Обработка PUT запросов для редактирования тикета
    else if (method === 'PUT' && id) {
        const {name, description, status} = ctx.request.body;

        // Проверяем наличие всех необходимых полей
        if (!name || !description || !status) {
            ctx.response.status = 400;
            ctx.response.body = JSON.stringify({error: 'Name, description, and status are required.'});
            return;
        }

        // Находим тикет по ID
        const ticket = tickets.find(ticket => ticket.id === id);

        if (!ticket) {
            ctx.response.status = 404;
            ctx.response.body = JSON.stringify({error: 'Ticket not found.'});
            return;
        }

        // Обновляем данные тикета
        ticket.title = name;
        ticket.description = description;
        ticket.status = status;

        ctx.response.set('Access-Control-Allow-Origin', '*');
        ctx.response.type = 'application/json';
        ctx.response.body = JSON.stringify(ticket); // Возвращаем обновленный тикет
    }

    // Обработка DELETE запросов для удаления тикета
    else if (method === 'DELETE' && id) {
        // Находим индекс тикета по ID
        const ticketIndex = tickets.findIndex(ticket => ticket.id === id);

        if (ticketIndex === -1) {
            ctx.response.status = 404;
            ctx.response.body = JSON.stringify({error: 'Ticket not found.'});
            return;
        }

        tickets.splice(ticketIndex, 1); // Удаляем тикет из массива

        ctx.response.set('Access-Control-Allow-Origin', '*');
        ctx.response.type = 'application/json';
        ctx.response.body = JSON.stringify({message: 'Ticket successfully deleted.'}); // Подтверждаем удаление
    }

    // Если метод не поддерживается
    else {
        ctx.response.status = 400;
        ctx.response.body = JSON.stringify({error: 'Invalid request.'});
    }

    await next();
});

// Создание HTTP сервера на основе Koa
const server = http.createServer(app.callback());
const port = process.env.PORT || 7070;

// Запуск сервера
server.listen(port, (err) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log('Server is listening on port ' + port);
});
