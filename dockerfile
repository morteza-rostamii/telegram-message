# Use Node image
FROM node:18

# Set working directory (this is where the app will be copied to inside the container)
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy the rest of the app (including src directory)
COPY . .

# Expose the port
EXPOSE 5000

# Start the app
CMD ["node", "src/index.js"]