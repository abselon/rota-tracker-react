# ROTA Tracker React

A modern React application for managing employee rosters and schedules. This application helps businesses manage their workforce scheduling efficiently.

## Features

- **Dashboard**: Overview of key metrics and quick actions
- **Weekly Calendar**: Visual representation of the weekly schedule
- **Employee Management**: Add, edit, and manage employee information
- **Shift Management**: Create and manage shift templates
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/rota-tracker-react.git
cd rota-tracker-react
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  ├── App.tsx        # Main application component
  └── index.tsx      # Application entry point
```

## Features in Detail

### Dashboard

- Overview of total employees
- Active shifts count
- Weekly hours scheduled
- Shift coverage percentage
- Quick actions for common tasks

### Weekly Calendar

- View and manage weekly schedules
- Navigate between weeks
- Add and edit shifts
- Visual representation of employee assignments

### Employee Management

- Add new employees
- Edit employee details
- Manage employee roles
- Track employee availability

### Shift Management

- Create shift templates
- Set shift durations
- Define required staff numbers
- Assign employees to shifts

## Technologies Used

- React
- TypeScript
- Material-UI
- React Router
- date-fns

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
