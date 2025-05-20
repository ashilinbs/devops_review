# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies, including Babel and Jest
RUN npm install && \
    npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-jest

# Copy the rest of the application code to the working directory
COPY . .

# Run tests
CMD ["npx", "jest"]