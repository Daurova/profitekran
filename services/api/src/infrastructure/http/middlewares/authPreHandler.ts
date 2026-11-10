import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] || 'super-secret-key-for-dev';

export const authPreHandler = async (request: any, reply: any) => {
  try {
    let token = '';
    const authHeader = request.headers.authorization;
    
    if (authHeader) {
      token = authHeader.split(' ')[1];
    } else if (request.cookies && request.cookies.auth_token) {
      token = request.cookies.auth_token;
    }

    if (!token) throw new Error('Нет токена');
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: 'Неавторизован' });
  }
};