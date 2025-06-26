# Use official Node.js image for build
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Use a lightweight web server to serve static files
FROM node:20-alpine AS production

WORKDIR /app

# Install serve to serve the build directory
RUN npm install -g serve

# Copy build output from previous stage
COPY --from=build /app/build ./build

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]
