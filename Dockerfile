# Use Node.js version 16.14.2 as a base image
FROM edge.pishgamanasia.ir/pasand/dev/node:1

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install


#Budle your app source code into the container
COPY . .

# Expose the port your app runs on
EXPOSE 8383

# Define the command to run your app
CMD ["node", "app.js"]