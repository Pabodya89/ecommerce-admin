# Use official Node LTS on alpine (small image)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (Docker layer caching optimization)
# If package.json hasn't changed, Docker reuses the cached npm install layer
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your source code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Default command (docker-compose overrides this with npm run dev)
CMD ["node", "app.js"]