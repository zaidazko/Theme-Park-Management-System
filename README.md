# Theme Park Management System

This project uses a **Vite + React** frontend and a **C# / .NET** backend.

## Prerequisites

Before you begin, ensure you have met the following requirements:

### Backend
* **[.NET SDK](https://dotnet.microsoft.com/download)**
* Compatible OS: Windows, macOS, or Linux

### Frontend
* **[Node.js](https://nodejs.org/)** 
* **npm** (included with Node.js)

---

## Getting Started

Follow these steps to get the application running locally.

### 1. Clone the Repository

```bash
git clone https://github.com/zaidazko/Theme-Park-Management-System
cd <root-folder-of-project>
```

## Backend Setup (.NET)

Navigate to the backend directory to restore dependencies and start the API.

1.  **Navigate to the backend folder:**
    ```bash
    cd backend
    ```

2.  **Restore dependencies:**
    ```bash
    dotnet restore
    ```

3.  **Run the API:**
    ```bash
    dotnet run
    ```

> **Note:** The backend will start on a local URL (typically `http://localhost:5239`). **Keep this terminal window open.**

## Frontend Setup (Vite + React)

Open a **new terminal window** to set up the frontend.

1.  **Navigate to the frontend folder:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create Environment Variables:**
    Create a file named `.env` in the `frontend` root directory. Add the following line, using the URL provided by your running backend:

    ```env
    VITE_API_URL=http://localhost:5239/api
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

> **Note:** The frontend will typically start on `http://localhost:5173`.


## Running the App

Once both servers are running:

1.  Ensure the **Backend** is running in your first terminal window (`dotnet run`).
2.  Ensure the **Frontend** is running in your second terminal window (`npm run dev`).
3.  Open the frontend URL (e.g., `http://localhost:5173`) in your browser.

The app will now communicate with the API automatically.
