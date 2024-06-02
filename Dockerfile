# Stage 1: Build the React application
FROM node:14 AS react-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Flask application
FROM python:3.8-slim AS flask-build
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY backend/ ./

# Stage 3: Nginx to serve React static files and proxy Flask
FROM nginx:alpine
COPY --from=react-build /app/frontend/build /usr/share/nginx/html
COPY --from=flask-build /app/backend /app/backend
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# Start Nginx and the Flask application
CMD ["sh", "-c", "nginx -g 'daemon off;' & (cd /app/backend && flask run --host=0.0.0.0)"]
