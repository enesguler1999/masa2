# Stage 1: Build the application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Vite application for production
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Remove default Nginx config and copy our custom config for SPA routing
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the build stage to Nginx's web root
# Notice that Vite outputs to 'dist' folder by default
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 5173 inside the container
EXPOSE 5173

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
