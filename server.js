const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const uuid = require('uuid');

const app = new Koa();

let tickets = [
    {
        id: uuid.v4(),
        title: "Fix Login Bug",
        description: "Users cannot log in with special characters in their password.",
        status: "open",
        createdAt: new Date().toISOString(),
    },
    {
        id: uuid.v4(),
        title: "Add Dark Mode",
        description: "Implement dark mode across the entire application UI.",
        status: "in progress",
        createdAt: new Date().toISOString(),
    },
    {
        id: uuid.v4(),
        title: "Improve Performance",
        description: "Optimize database queries to reduce load times.",
        status: "resolved",
        createdAt: new Date().toISOString(),
    },
    {
        id: uuid.v4(),
        title: "Update Documentation",
        description: "Update API documentation to include new endpoints.",
        status: "open",
        createdAt: new Date().toISOString(),
    },
    {
        id: uuid.v4(),
        title: "Redesign Homepage",
        description: "Create a new, modern design for the homepage.",
        status: "open",
        createdAt: new Date().toISOString(),
    },
    {
        id: uuid.v4(),
        title: "Add Multi-Language Support",
        description: "Support multiple languages for international users.",
        status: "in progress",
        createdAt: new Date().toISOString(),
    },
    {
        id: uuid.v4(),
        title: "Fix Notification Bugs",
        description: "Notifications are not being delivered to some users.",
        status: "open",
        createdAt: new Date().toISOString(),
    },
];

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
    const httpMethod = ctx.request.method; // Получаем HTTP метод запроса

    if (!method) {
        // Вывод доступных методов, если method отсутствует
        ctx.response.status = 200;
        ctx.response.body = {
            message: 'Available methods:',
            availableMethods: [
                'GET: allTickets, ticketById',
                'POST: createTicket',
                'PUT: editTicket, editTicketStatus',
                'DELETE: deleteTicket',
            ],
        };
        return;
    }

    switch (httpMethod) {
        case 'GET': {
            if (method === 'allTickets') {
                // Возвращаем краткий список тикетов
                const shortTickets = tickets.map(ticket => ({
                    id: ticket.id,
                    title: ticket.title,
                    createdAt: ticket.createdAt,
                    status: ticket.status,
                }));
                ctx.response.type = 'application/json';
                ctx.response.body = shortTickets;
            } else if (method === 'ticketById') {
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
            } else {
                ctx.response.status = 400;
                ctx.response.body = {error: 'Invalid method for GET request.'};
            }
            break;
        }

        case 'POST': {
            if (method === 'createTicket') {
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
            } else {
                ctx.response.status = 400;
                ctx.response.body = {error: 'Invalid method for POST request.'};
            }
            break;
        }

        case 'PUT': {
            if (method === 'editTicket') {
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
            } else if (method === 'editTicketStatus') {
                // Изменение только статуса тикета по ID
                const {id, status} = ctx.request.body;

                if (!id || !status) {
                    ctx.response.status = 400;
                    ctx.response.body = {error: 'ID and status are required.'};
                    break;
                }

                const ticket = tickets.find(ticket => ticket.id === id);

                if (!ticket) {
                    ctx.response.status = 404;
                    ctx.response.body = {error: 'Ticket not found.'};
                    break;
                }

                ticket.status = status;

                ctx.response.type = 'application/json';
                ctx.response.body = ticket;
            } else {
                ctx.response.status = 400;
                ctx.response.body = {error: 'Invalid method for PUT request.'};
            }
            break;
        }

        case 'DELETE': {
            if (method === 'deleteTicket') {
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
            } else {
                ctx.response.status = 400;
                ctx.response.body = {error: 'Invalid method for DELETE request.'};
            }
            break;
        }

        default: {
            // Если метод не поддерживается
            ctx.response.status = 400;
            ctx.response.body = {
                error: 'Invalid HTTP method.',
                availableMethods: [
                    'GET: allTickets, ticketById',
                    'POST: createTicket',
                    'PUT: editTicket, editTicketStatus',
                    'DELETE: deleteTicket',
                ],
            };
        }
    }

    await next();
});

// Запуск сервера
const port = process.env.PORT || 7070;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
