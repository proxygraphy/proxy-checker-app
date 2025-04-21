# Proxy Checker App

A web-based application to check and validate proxy servers, providing their geolocation information.

## Features

- Check multiple proxies in batch
- Validate proxy connectivity
- Display geolocation information (country, region, city, etc.)
- Real-time results display

## Tech Stack

- **Frontend**: React.js with CSS
- **Backend**: Node.js with Express
- **Libraries**: Axios, https-proxy-agent, socks-proxy-agent

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/proxy-checker-app.git
   cd proxy-checker-app
   ```

2. Install backend dependencies:
   ```
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd client
   npm install
   ```

4. Create a `.env` file in the root directory with the following content:
   ```
   PORT=5000
   # Add your API keys if needed
   ```

## Running the Application

1. Start the backend server:
   ```
   npm run dev
   ```

2. In a separate terminal, start the frontend:
   ```
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter a list of proxies (one per line) in the input area
2. Format should be either:
   - `IP:PORT` (for proxies without authentication)
   - `IP:PORT:USERNAME:PASSWORD` (for proxies with authentication)
3. Click "Check Proxies" to start validating
4. View the results in the table below

## Development

- Backend API runs on port 5000
- Frontend development server runs on port 3000 with proxy configured
- The application uses real-time checking for each proxy in the list

## License

MIT License
