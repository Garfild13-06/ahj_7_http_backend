const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const uuid = require('uuid');

const app = new Koa();

let tickets = []; // Хранилище тикетов (в памяти)

// Настройка middleware для обработки CORS
app.use(cors({
    origin: '*', // Разрешаем запросы с любых доменов
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешённые методы
    allowHeaders: ['Content-Type', 'Authorization'], // Разрешённые заголовки
}));

// Настройка body parser для обработки данных из POST/PUT запросов
app.use(koaBody({
    urlencoded: true,
    multipart: true,
}));

// Основной обработчик запросов
app.use(async (ctx, next) => {
    const {method} = ctx.query; // Получаем параметр 'method' из query

    switch (method) {
        case 'allTickets': {
            // Возвращаем краткий список тикетов
            const shortTickets = tickets.map(ticket => ({
                id: ticket.id,
                title: ticket.title,
                createdAt: ticket.createdAt,
                status: ticket.status,
            }));
            ctx.response.type = 'application/json';
            ctx.response.body = shortTickets;
            break;
        }

        case 'ticketById': {
            // Возвращаем расширенные данные тикета по ID
            const {id} = ctx.query;
            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = {error: 'Ticket ID is required.'};
                break;
            }

            const ticket = tickets.find(ticket => ticket.id === id);
            if (!ticket) {
                ctx.response.status = 404;
                ctx.response.body = {error: 'Ticket not found.'};
                break;
            }

            ctx.response.type = 'application/json';
            ctx.response.body = ticket;
            break;
        }

        case 'createTicket': {
            // Создание нового тикета
            const {name, description, status} = ctx.request.body;

            if (!name || !description || !status) {
                ctx.response.status = 400;
                ctx.response.body = {error: 'Name, description, and status are required.'};
                break;
            }

            const newTicket = {
                id: uuid.v4(), // Генерируем уникальный ID
                title: name,
                description,
                status,
                createdAt: new Date().toISOString(),
            };

            tickets.push(newTicket); // Добавляем новый тикет в массив
            ctx.response.type = 'application/json';
            ctx.response.body = newTicket;
            break;
        }

        case 'editTicket': {
            // Редактирование тикета по ID
            const {id, name, description, status} = ctx.request.body;

            if (!id || !name || !description || !status) {
                ctx.response.status = 400;
                ctx.response.body = {error: 'ID, name, description, and status are required.'};
                break;
            }

            const ticket = tickets.find(ticket => ticket.id === id);

            if (!ticket) {
                ctx.response.status = 404;
                ctx.response.body = {error: 'Ticket not found.'};
                break;
            }

            ticket.title = name;
            ticket.description = description;
            ticket.status = status;

            ctx.response.type = 'application/json';
            ctx.response.body = ticket;
            break;
        }

        case 'deleteTicket': {
            // Удаление тикета по ID
            const {id} = ctx.query;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = {error: 'Ticket ID is required.'};
                break;
            }

            const ticketIndex = tickets.findIndex(ticket => ticket.id === id);

            if (ticketIndex === -1) {
                ctx.response.status = 404;
                ctx.response.body = {error: 'Ticket not found.'};
                break;
            }

            tickets.splice(ticketIndex, 1); // Удаляем тикет из массива

            ctx.response.type = 'application/json';
            ctx.response.body = {message: 'Ticket successfully deleted.'};
            break;
        }

        default: {
            // Если метод не поддерживается
            ctx.response.status = 400;
            ctx.response.body = {error: 'Invalid method.'};
        }
    }

    await next();
});

// Запуск сервера
const port = process.env.PORT || 7070;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
