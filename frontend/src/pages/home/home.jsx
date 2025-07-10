import React from 'react';
import NavLogo from '../../components/navbar/Nav-Logo';
import DateDisplayBox from '../../components/home/DateDisplayBox';

export default function Home(props) {
  return (
    <div className="app-root">
      <NavLogo />
      <DateDisplayBox />
    </div>
  );
} 