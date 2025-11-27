import React from 'react';
import { NavigationBuilder } from './components/NavigationBuilder';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBuilder />
    </div>
  );
};

export default App;
