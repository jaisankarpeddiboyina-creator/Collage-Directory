# Use official Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* package-lock.json* ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "run", "start"]
