import { ExpressServer } from './express';
const app = new ExpressServer();

//apply body parser and json middleware
app.applyJSONandBodyParser();

// apply listen port
app.applyPortListen(5000);

//apply routing middleware
import studentRoutes from './routes/studentRoutes';
app.applyRoutingMiddleware('/api/students', studentRoutes);

import subjectRoutes from './routes/subjectRoutes';
app.applyRoutingMiddleware('/api/subjects', subjectRoutes);

import userRoutes from './routes/userRoutes';
app.applyRoutingMiddleware('/api/users', userRoutes);
