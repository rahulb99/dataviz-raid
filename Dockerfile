FROM node:23-slim

ENV NODE_ENV=development
ENV PROJECT_DIR=/app

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy project files
COPY . .

RUN yarn install --cwd ${PROJECT_DIR}/client
RUN yarn install --cwd ${PROJECT_DIR}/server

EXPOSE 3000

# Start the application
CMD ["yarn", "dev"]
