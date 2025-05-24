# NovelFinds OMS - Book Store Order Management System

A comprehensive order management system for NovelFinds, a second-hand bookstore operating on Instagram.

## Features

### Inventory Management
- Add books via ISBN lookup or manual entry
- Track book details including title, author, cost, weight, and condition
- Mark books as ready/not ready for sale
- View available and sold books

### Order Management
- Create new orders with customer information
- Select available books for orders
- Auto-calculate shipping costs based on weight
- Track order status (Pending, Packed, Shipped, Delivered)

### Shipping Details
- Update tracking IDs
- Upload tracking slip images
- Change order status

### Customer Management
- Auto-save customer profiles
- Search for existing customers
- View customer order history

### Analytics Dashboard
- Monthly sales, expenses, and profits reports
- Genre breakdown of sold books
- Top customer insights
- Inventory value tracking

## Technology Stack

- **Frontend**: React, React Router, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Local file system (can be extended to cloud storage)

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd novelfinds-oms
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Install frontend dependencies
```
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/novelfinds
NODE_ENV=development
```

5. Start the backend server
```
cd backend
npm run dev
```

6. Start the frontend development server
```
cd frontend
npm run dev
```

7. Access the application at `http://localhost:3000`

## License

This project is licensed under the MIT License. 